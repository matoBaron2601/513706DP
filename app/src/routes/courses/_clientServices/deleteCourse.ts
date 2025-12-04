import type { Course } from '../../../schemas/courseSchema';

/**
 * Deletes a course by its ID.
 * @param courseId
 * @returns The deleted course data.
 */
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
