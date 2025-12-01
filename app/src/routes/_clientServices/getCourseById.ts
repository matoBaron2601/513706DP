import type { Course } from '../../schemas/courseSchema';

export const getCourseById = async (courseId: string): Promise<Course> => {
	const response = await fetch(`/api/course/${courseId}`);
	if (!response.ok) {
		throw new Error('Failed to get course by id');
	}
	const data = await response.json();
	return data;
};