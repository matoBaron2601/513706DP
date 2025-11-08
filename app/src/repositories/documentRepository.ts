import { eq } from 'drizzle-orm';
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
		const result = await getDbClient(tx).select().from(document).where(eq(document.id, documentId));
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
			.delete(document)
			.where(eq(document.id, documentId))
			.returning();
		return result[0];
	}

	async getByBlockId(blockId: string, tx?: Transaction): Promise<DocumentDto[]> {
		return await getDbClient(tx).select().from(document).where(eq(document.blockId, blockId));
	}
}
