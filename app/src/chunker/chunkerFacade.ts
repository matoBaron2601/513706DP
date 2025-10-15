import { TypesenseService } from '../typesense/typesenseService';
import { ChunkerService } from './chunkerService';

export class ChunkerFacade {
	private chunkerService: ChunkerService;
	private typesenseService: TypesenseService;
	constructor() {
		this.chunkerService = new ChunkerService();
		this.typesenseService = new TypesenseService();
	}

	async chunkAndStoreText(text: string, courseBlockId: string): Promise<void> {
		if (await this.typesenseService.checkDocumentExists(courseBlockId)) {
			throw new Error(`Document with course_block_id ${courseBlockId} already exists.`);
		}

		const chunks = await this.chunkerService.chunkRTC(text);
		for (const chunk of chunks) {
			await this.typesenseService.populateQuizCollection({
				course_block_id: courseBlockId,
				content: chunk
			});
		}
	}
}
