import type { IdentifyConceptsRequest, IdentifyConceptsResponse } from '../../../../../../schemas/blockSchema';

const identifyConcepts = async (data: IdentifyConceptsRequest) : Promise<IdentifyConceptsResponse> => {
	const formData = new FormData();

	formData.append('document', data.document);

	const response = await fetch(`/api/block/identifyConcepts`, {
		method: 'POST',
		body: formData
	});

	if (!response.ok) {
		throw new Error('Failed to identify concepts');
	}
	return await response.json();
};

export default identifyConcepts;
