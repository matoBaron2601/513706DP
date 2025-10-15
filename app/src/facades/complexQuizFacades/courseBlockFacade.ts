import { ChunkerService } from '../../chunker/chunkerService';
import { db } from '../../db/client';
import { createBaseAnswerSchema } from '../../schemas/commonSchemas/baseAnsweSchema';
import type {
	CourseBlockExtended,
	CreateCourseBlockExtended
} from '../../schemas/complexQuizSchemas/courseBlockSchema';
import { OpenAiService } from '../../services/commonServices/openAIService';
import { ConceptService } from '../../services/complexQuizServices/conceptService';
import { CourseBlockService } from '../../services/complexQuizServices/courseBlockService';
import { TypesenseService } from '../../typesense/typesenseService';

export class CourseBlockFacade {
	constructor(
		private courseBlockService: CourseBlockService,
		private openAiService: OpenAiService,
		private conceptService: ConceptService,
		private typesenseService: TypesenseService,
		private chunkerService: ChunkerService
	) {
		this.courseBlockService = new CourseBlockService();
		this.openAiService = new OpenAiService();
		this.conceptService = new ConceptService();
		this.typesenseService = new TypesenseService();
		this.chunkerService = new ChunkerService();
	}

	async create(data: CreateCourseBlockExtended): Promise<CourseBlockExtended> {
		return await db.transaction(async (tx) => {
			const courseBlock = await this.courseBlockService.create(data);
			const courseBlockDataExist = await this.typesenseService.checkDocumentExists(courseBlock.id);
			if (!courseBlockDataExist) {
				throw new Error(
					`Typesense document for course block with id ${courseBlock.id} does already exist`
				);
			}
			const identifiedConcepts = await this.openAiService.identifyConcepts(data.document);
			await this.conceptService.createMany(
				identifiedConcepts.map((concept) => ({
					name: concept,
					courseBlockId: courseBlock.id
				})),
				tx
			);

			const chunks = await this.chunkerService.chunkRTC(data.document);

			await this.typesenseService.populateManyQuizCollection(
				chunks.map((chunk) => ({
					course_block_id: courseBlock.id,
					content: chunk
				}))
			);

			return {
				...courseBlock,
				courseId: data.courseId,
				concepts: identifiedConcepts
			};
		});
	}

	async getById(id: string): Promise<CourseBlockExtended> {
		const courseBlock = await this.courseBlockService.getById(id);
		const concepts = await this.conceptService.getByCourseBlockId(id);
		return {
			...courseBlock,
			concepts: concepts.map((c) => c.name)
		};
	}

	async getManyByCourseId(courseId: string): Promise<CourseBlockExtended[]> {
		const courseBlocks = await this.courseBlockService.getByCourseId(courseId);
		const concepts = await this.conceptService.getManyByCourseBlockIds(
			courseBlocks.map((cb) => cb.id)
		);
		return courseBlocks.map((cb) => ({
			...cb,
			concepts: concepts.filter((c) => c.courseBlockId === cb.id).map((c) => c.name)
		}));
	}
}
