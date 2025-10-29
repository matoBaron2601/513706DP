import type {
	Concept,
	GetConceptProgressByUserBlockIdRequest,
	GetConceptProgressByUserBlockIdResponse
} from '../../../../../../../schemas/conceptSchema';

const getConceptProgressByUserBlockId = async (
	data: GetConceptProgressByUserBlockIdRequest
): Promise<GetConceptProgressByUserBlockIdResponse> => {
	const response = await fetch(`/api/concept/progress/${data.userBlockId}`);

	if (!response.ok) {
		throw new Error('Failed to get block concept progress');
	}
	return await response.json();
};

export default getConceptProgressByUserBlockId;
