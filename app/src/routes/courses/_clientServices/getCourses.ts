import type { GetCoursesRequest, GetCoursesResponse } from '../../../schemas/courseSchema';

/**
 * Fetches available courses for a given creator.
 * @param getCoursesRequest
 * @returns A list of available courses.
 */
export const getCourses = async (
	getCoursesRequest: GetCoursesRequest
): Promise<GetCoursesResponse[]> => {
	const response = await fetch(`/api/course/available/${getCoursesRequest.creatorId}`);
	if (!response.ok) {
		throw new Error('Failed to get courses');
	}
	const data = await response.json();
	return data;
};
