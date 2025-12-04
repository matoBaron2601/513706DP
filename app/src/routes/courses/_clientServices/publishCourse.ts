import type { Course } from '../../../schemas/courseSchema';
import { AppError } from '../../../errors/AppError';

/**
 * Publishes a course by its ID. 
 * @param id 
 * @returns The published course data. 
 */
export const publishCourse = async (id: string): Promise<Course> => {
	const response = await fetch(`/api/course/${id}/publish`, {
		method: 'PUT'
	});

	const data = await response.json();

	if (!response.ok) {
		throw new AppError(
			data.status,
			data?.code ?? 'UNKNOWN',
			data?.message ?? 'An unknown error occurred',
			data?.details
		);
	}
	return data;
};
