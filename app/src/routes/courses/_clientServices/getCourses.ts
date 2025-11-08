import type { Course } from '../../../schemas/courseSchema';

const getCourses = async (): Promise<Course[]> => {
	const response = await fetch(`/api/course`);
	if (!response.ok) {
		throw new Error('Failed to get courses');
	}
	const data = await response.json();
	return data;
};

export default getCourses;
