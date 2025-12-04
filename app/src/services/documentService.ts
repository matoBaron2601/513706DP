/**
 * @fileoverview
 * Service layer for managing documents.
 */
import type { CreateDocumentDto, DocumentDto, UpdateDocumentDto } from '../db/schema';
import { DocumentRepository } from '../repositories/documentRepository';
import type { Transaction } from '../types';
import { NotFoundError } from '../errors/AppError';

export class DocumentService {
	constructor(private repo: DocumentRepository = new DocumentRepository()) {}

	/**
	 * Retrieve a Document by its ID.
	 * @param documentId
	 * @param tx
	 * @returns The DocumentDto if found.
	 * @throws NotFoundError if the Document does not exist.
	 */
	async getById(documentId: string, tx?: Transaction): Promise<DocumentDto> {
		const document = await this.repo.getById(documentId, tx);
		if (!document) throw new NotFoundError(`Document with id ${documentId} not found`);
		return document;
	}

	/**
	 * Create a new Document.
	 * @param newDocument
	 * @param tx
	 * @returns The newly created DocumentDto.
	 */
	async create(newDocument: CreateDocumentDto, tx?: Transaction): Promise<DocumentDto> {
		return await this.repo.create(newDocument, tx);
	}

	/**
	 * Update an existing Document.
	 * @param documentId
	 * @param updateDocument
	 * @param tx
	 * @returns The updated DocumentDto.
	 * @throws NotFoundError if the Document does not exist.
	 */
	async update(
		documentId: string,
		updateDocument: UpdateDocumentDto,
		tx?: Transaction
	): Promise<DocumentDto> {
		const document = await this.repo.update(documentId, updateDocument, tx);
		if (!document) throw new NotFoundError(`Document with id ${documentId} not found`);
		return document;
	}

	/**
	 * Delete a Document by its ID.
	 * @param documentId
	 * @param tx
	 * @returns The deleted DocumentDto.
	 * @throws NotFoundError if the Document does not exist.
	 */
	async delete(documentId: string, tx?: Transaction): Promise<DocumentDto> {
		const document = await this.repo.delete(documentId, tx);
		if (!document) throw new NotFoundError(`Document with id ${documentId} not found`);
		return document;
	}

	/**
	 * Retrieve Documents by the associated Block ID.
	 * @param blockId
	 * @param tx
	 * @returns An array of DocumentDto.
	 */
	async getByBlockId(blockId: string, tx?: Transaction): Promise<DocumentDto[]> {
		return await this.repo.getByBlockId(blockId, tx);
	}

	/**
	 * Delete a Document by its file path.
	 * @param filePath
	 * @param tx
	 * @returns The deleted DocumentDto.
	 * @throws NotFoundError if the Document does not exist.
	 * @throws Error if attempting to delete the only document in a block.
	 */
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
