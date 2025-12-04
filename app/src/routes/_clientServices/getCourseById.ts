/**
 * Fetches a course by its ID from the API.
 * @param courseId - The ID of the course to fetch.
 * @returns A promise that resolves to the Course object.
 * @throws An error if the fetch operation fails.
 */

import type { Course } from '../../schemas/courseSchema';

export const getCourseById = async (courseId: string): Promise<Course> => {
	const response = await fetch(`/api/course/${courseId}`);

	if (!response.ok) {
		throw new Error('Failed to get course by id');
	}
	const data = await response.json();
	return data;
};
