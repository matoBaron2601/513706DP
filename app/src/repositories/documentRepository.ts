/**
 * @fileoverview
 * Document repository for managing document records in the database.
 */
import { eq, isNull, and } from 'drizzle-orm';
import {
	document,
	type CreateDocumentDto,
	type DocumentDto,
	type UpdateDocumentDto
} from '../db/schema';
import type { Transaction } from '../types';
import _getDbClient, { type GetDbClient } from './utils/getDbClient';

export class DocumentRepository {
	constructor(private readonly getDbClient: GetDbClient = _getDbClient) {}

	/**
	 * Get a document by its ID.
	 * @param documentId 
	 * @param tx 
	 * @returns The document with the specified ID, or undefined if not found.
	 */
	async getById(documentId: string, tx?: Transaction): Promise<DocumentDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(document)
			.where(and(eq(document.id, documentId), isNull(document.deletedAt)));
		return result[0];
	}

	/**
	 * Get a document by its file path.
	 * @param filePath 
	 * @param tx 
	 * @returns The document with the specified file path, or undefined if not found.
	 */
	async getByFilePath(filePath: string, tx?: Transaction): Promise<DocumentDto | undefined> {
		const result = await this.getDbClient(tx)
			.select()
			.from(document)
			.where(and(eq(document.filePath, filePath), isNull(document.deletedAt)));
		return result[0];
	}

	/**
	 * Create a new document.
	 * @param newDocument 
	 * @param tx 
	 * @returns The created document.
	 */
	async create(newDocument: CreateDocumentDto, tx?: Transaction): Promise<DocumentDto> {
		const result = await this.getDbClient(tx).insert(document).values(newDocument).returning();
		return result[0];
	}

	/**
	 * Update an existing document.
	 * @param documentId 
	 * @param updateDocument 
	 * @param tx 
	 * @returns The updated document, or undefined if not found.
	 */
	async update(
		documentId: string,
		updateDocument: UpdateDocumentDto,
		tx?: Transaction
	): Promise<DocumentDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(document)
			.set(updateDocument)
			.where(eq(document.id, documentId))
			.returning();
		return result[0];
	}

	/**
	 * Soft delete a document by setting its deletedAt timestamp.
	 * @param documentId 
	 * @param tx 
	 * @returns The deleted document, or undefined if not found.
	 */
	async delete(documentId: string, tx?: Transaction): Promise<DocumentDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(document)
			.set({ deletedAt: new Date() })
			.where(eq(document.id, documentId))
			.returning();
		return result[0];
	}

	/**
	 * Get multiple documents by the block ID.
	 * @param blockId 
	 * @param tx 
	 * @returns An array of documents associated with the specified block ID.
	 */
	async getManyByBlockId(blockId: string, tx?: Transaction): Promise<DocumentDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(document)
			.where(and(eq(document.blockId, blockId), isNull(document.deletedAt)));
	}

	/**
	 * Get multiple documents by the block ID.
	 * @param blockId 
	 * @param tx 
	 * @returns An array of documents associated with the specified block ID.
	 */
	async getByBlockId(blockId: string, tx?: Transaction): Promise<DocumentDto[]> {
		return await this.getDbClient(tx)
			.select()
			.from(document)
			.where(and(eq(document.blockId, blockId), isNull(document.deletedAt)));
	}

	/**
	 * Soft delete a document by its file path.
	 * @param filePath 
	 * @param tx 
	 * @returns The deleted document, or undefined if not found.
	 */
	async deleteByName(filePath: string, tx?: Transaction): Promise<DocumentDto | undefined> {
		const result = await this.getDbClient(tx)
			.update(document)
			.set({ deletedAt: new Date() })
			.where(eq(document.filePath, filePath))
			.returning();
		return result[0];
	}
}
