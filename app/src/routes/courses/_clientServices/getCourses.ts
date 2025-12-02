import type { GetCoursesRequest, GetCoursesResponse } from '../../../schemas/courseSchema';

export const getCourses = async (getCoursesRequest: GetCoursesRequest): Promise<GetCoursesResponse[]> => {
	console.log('calling Courses')
	const response = await fetch(`/api/course/available`, {
		body: JSON.stringify(getCoursesRequest),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	if (!response.ok) {
		throw new Error('Failed to get courses');
	}
	const data = await response.json();
	return data;
};

