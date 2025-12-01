import type { GetManyByCourseIdResponse } from '../../../../../schemas/blockSchema';

const getBlocks = async (courseId: string): Promise<GetManyByCourseIdResponse> => {
	const response = await fetch(`/api/block/courseId/${courseId}`);
	if (!response.ok) {
		throw new Error('Failed to get course blocks');
	}
	const data = await response.json();
	return data;
};

export default getBlocks;
