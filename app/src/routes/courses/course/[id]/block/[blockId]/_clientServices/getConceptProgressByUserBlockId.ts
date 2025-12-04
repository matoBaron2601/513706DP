import type {
	GetConceptProgressByUserBlockIdRequest,
	GetConceptProgressByUserBlockIdResponse
} from '../../../../../../../schemas/conceptSchema';

/**
 * Fetch concept progress for a given user block ID
 * @param data 
 * @returns GetConceptProgressByUserBlockIdResponse 
 */
export const getConceptProgressByUserBlockId = async (
	data: GetConceptProgressByUserBlockIdRequest
): Promise<GetConceptProgressByUserBlockIdResponse> => {
	const response = await fetch(`/api/concept/progress/${data.userBlockId}`);

	if (!response.ok) {
		throw new Error('Failed to get block concept progress');
	}
	return await response.json();
};

