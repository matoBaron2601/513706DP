import type { GetCoursesRequest, GetCoursesResponse } from '../../../schemas/courseSchema';

const getCourses = async (getCoursesRequest: GetCoursesRequest): Promise<GetCoursesResponse[]> => {
	const response = await fetch(`/api/course/filtered`, {
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

export default getCourses;
