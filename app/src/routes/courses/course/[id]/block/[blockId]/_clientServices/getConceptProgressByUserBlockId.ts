import type {
	GetConceptProgressByUserBlockIdRequest,
	GetConceptProgressByUserBlockIdResponse
} from '../../../../../../../schemas/conceptSchema';

export const getConceptProgressByUserBlockId = async (
	data: GetConceptProgressByUserBlockIdRequest
): Promise<GetConceptProgressByUserBlockIdResponse> => {
	const response = await fetch(`/api/concept/progress/${data.userBlockId}`);

	if (!response.ok) {
		throw new Error('Failed to get block concept progress');
	}
	return await response.json();
};

