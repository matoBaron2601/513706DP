import type {
	CreateDocumentRequest,
	Document
} from '../../../../../../../../schemas/documentSchema';

export const uploadDocument = async (createDocumentRequest: CreateDocumentRequest): Promise<Document> => {
	const formData = new FormData();
	formData.append('blockId', createDocumentRequest.blockId);
	formData.append('document', createDocumentRequest.document);

	const response = await fetch(`/api/document`, {
		method: 'POST',
		body: formData
	});

	if (!response.ok) {
		throw new Error('Failed to upload document');
	}
	const data = await response.json();
	return data;
};