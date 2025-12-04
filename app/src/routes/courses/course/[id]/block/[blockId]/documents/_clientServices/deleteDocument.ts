import type {
	DeleteDocumentRequest,
	Document
} from '../../../../../../../../schemas/documentSchema';


/**
 * Delete a document with the provided request data
 * @param deleteDocumentRequest 
 * @returns Document 
 */
export const deleteDocument = async (
	deleteDocumentRequest: DeleteDocumentRequest
): Promise<Document> => {
	const response = await fetch(`/api/document`, {
		method: 'DELETE',
		body: JSON.stringify(deleteDocumentRequest),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error('Failed to upload document');
	}
	const data = await response.json();
	return data;
};
