import { timeStamp } from 'console';
import { db } from '../db/client';
import type { CreateDocumentDto } from '../db/schema';
import type { Course } from '../schemas/courseSchema';
import { BlockService } from '../services/blockService';
import { CourseService } from '../services/courseService';
import { DocumentService } from '../services/documentService';
import { TypesenseService } from '../typesense/typesenseService';
import { ChunkerService } from '../chunker/chunkerService';
import { BucketService } from '../services/bucketService';

export class DocumentFacade {
	private documentService: DocumentService;
	private typesenseService: TypesenseService;
	private chunkerService: ChunkerService;
	private bucketService: BucketService;
	constructor() {
		this.documentService = new DocumentService();
		this.typesenseService = new TypesenseService();
		this.chunkerService = new ChunkerService();
		this.bucketService = new BucketService();
	}

	async uploadDocument(newDocument: CreateDocumentDto) {
		const document = await this.documentService.create(newDocument);
		const fileText = await this.bucketService.getBlockDataFileString(newDocument.filePath);

		const chunks = await this.chunkerService.chunk('rtc', fileText);

		await this.typesenseService.createMany(
			chunks.map((chunk, i) => ({
				block_id: newDocument.blockId,
				chunk_index: i,
				content: chunk,
				documentPath: newDocument.filePath
			}))
		);
		return document;
	}

	async deleteDocument(filePath: string) {
		const document = await this.documentService.deleteByFilePath(filePath);
		await this.typesenseService.deleteByDocumentPath(document.blockId, document.filePath);
		return document;
	}
}
