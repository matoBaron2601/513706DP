import type { Course } from '../../../schemas/courseSchema';

/**
 * Unpublishes a course by its ID.
 * @param id
 * @returns The unpublished course data.
 */
export const unpublishCourse = async (id: string): Promise<Course> => {
	const response = await fetch(`/api/course/${id}/unpublish`, {
		method: 'PUT'
	});
	if (!response.ok) {
		throw new Error('Failed to unpublish course');
	}
	const data = await response.json();
	return data;
};
