import { eq, isNull, and } from 'drizzle-orm';
import {
	document,
	type CreateDocumentDto,
	type DocumentDto,
	type UpdateDocumentDto
} from '../db/schema';
import type { Transaction } from '../types';
import getDbClient from './utils/getDbClient';

export class DocumentRepository {
	async getById(documentId: string, tx?: Transaction): Promise<DocumentDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(document)
			.where(and(eq(document.id, documentId), isNull(document.deletedAt)));
		return result[0];
	}

	async getByFilePath(filePath: string, tx?: Transaction): Promise<DocumentDto | undefined> {
		const result = await getDbClient(tx)
			.select()
			.from(document)
			.where(and(eq(document.filePath, filePath), isNull(document.deletedAt)));
		return result[0];
	}

	async create(newDocument: CreateDocumentDto, tx?: Transaction): Promise<DocumentDto> {
		const result = await getDbClient(tx).insert(document).values(newDocument).returning();
		return result[0];
	}

	async update(
		documentId: string,
		updateDocument: UpdateDocumentDto,
		tx?: Transaction
	): Promise<DocumentDto | undefined> {
		const result = await getDbClient(tx)
			.update(document)
			.set(updateDocument)
			.where(eq(document.id, documentId))
			.returning();
		return result[0];
	}

	async delete(documentId: string, tx?: Transaction): Promise<DocumentDto | undefined> {
		const result = await getDbClient(tx)
			.update(document)
			.set({ deletedAt: new Date() })
			.where(eq(document.id, documentId))
			.returning();
		return result[0];
	}

	async getManyByBlockId(blockId: string, tx?: Transaction): Promise<DocumentDto[]> {
		return await getDbClient(tx)
			.select()
			.from(document)
			.where(and(eq(document.blockId, blockId), isNull(document.deletedAt)));
	}

	async getByBlockId(blockId: string, tx?: Transaction): Promise<DocumentDto[]> {
		return await getDbClient(tx)
			.select()
			.from(document)
			.where(and(eq(document.blockId, blockId), isNull(document.deletedAt)));
	}

	async deleteByName(filePath: string, tx?: Transaction): Promise<DocumentDto | undefined> {
		const result = await getDbClient(tx)
			.update(document)
			.set({ deletedAt: new Date() })
			.where(eq(document.filePath, filePath))
			.returning();
		return result[0];
	}
}
