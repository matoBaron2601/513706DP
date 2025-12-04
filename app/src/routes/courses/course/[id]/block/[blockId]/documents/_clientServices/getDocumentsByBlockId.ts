import type { Document } from '../../../../../../../../schemas/documentSchema';

/**
 * Get documents by block ID
 * @param blockId 
 * @returns Document[]
 */
export const getDocumentsByBlockId = async (blockId: string): Promise<Document[]> => {
	const response = await fetch(`/api/document/blockId/${blockId}`);
	if (!response.ok) {
		throw new Error('Failed to get documents');
	}
	const data = await response.json();
	return data;
};
