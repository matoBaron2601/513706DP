import type { CreateDocumentDto, DocumentDto, UpdateDocumentDto } from '../db/schema';
import { DocumentRepository } from '../repositories/documentRepository';
import type { Transaction } from '../types';
import { NotFoundError } from './utils/notFoundError';

export class DocumentService {
	private repo: DocumentRepository;

	constructor() {
		this.repo = new DocumentRepository();
	}

	async getById(documentId: string, tx?: Transaction): Promise<DocumentDto> {
		const document = await this.repo.getById(documentId, tx);
		if (!document) throw new NotFoundError(`Document with id ${documentId} not found`);
		return document;
	}

	async create(newDocument: CreateDocumentDto, tx?: Transaction): Promise<DocumentDto> {
		return await this.repo.create(newDocument, tx);
	}

	async update(
		documentId: string,
		updateDocument: UpdateDocumentDto,
		tx?: Transaction
	): Promise<DocumentDto> {
		const document = await this.repo.update(documentId, updateDocument, tx);
		if (!document) throw new NotFoundError(`Document with id ${documentId} not found`);
		return document;
	}

	async delete(documentId: string, tx?: Transaction): Promise<DocumentDto> {
		const document = await this.repo.delete(documentId, tx);
		if (!document) throw new NotFoundError(`Document with id ${documentId} not found`);
		return document;
	}

	async getByBlockId(blockId: string, tx?: Transaction): Promise<DocumentDto[]> {
		return await this.repo.getByBlockId(blockId, tx);
	}

	async deleteByFilePath(filePath: string, tx?: Transaction): Promise<DocumentDto> {
		const document = await this.repo.getByFilePath(filePath, tx);
		if (!document) throw new NotFoundError(`Document with file ${filePath} not found`);

		const documents = await this.repo.getByBlockId(document.blockId, tx);
		if (documents.length <= 1) {
			throw new Error(`Cannot delete the only document in the block.`);
		}

		await this.repo.delete(document.id, tx);

		return document;
	}
}
