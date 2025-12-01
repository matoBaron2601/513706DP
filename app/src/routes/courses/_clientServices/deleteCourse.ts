import type { Course } from '../../../schemas/courseSchema';

export const deleteCourse = async (courseId: string): Promise<Course> => {
	const response = await fetch(`/api/course/${courseId}`, {
		method: 'DELETE'
	});
	if (!response.ok) {
		throw new Error('Failed to delete course');
	}
	const data = await response.json();
	return data;
};

