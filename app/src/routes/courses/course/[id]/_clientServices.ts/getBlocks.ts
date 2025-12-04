import type { GetManyByCourseIdResponse } from '../../../../../schemas/blockSchema';

/**
 * Fetch blocks for a given course ID 
 * @param courseId 
 * @returns GetManyByCourseIdResponse 
 */
export const getBlocks = async (courseId: string): Promise<GetManyByCourseIdResponse> => {
	const response = await fetch(`/api/block/courseId/${courseId}`);
	if (!response.ok) {
		throw new Error('Failed to get course blocks');
	}
	const data = await response.json();
	return data;
};

