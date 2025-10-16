import type { Course, CreateCourse } from '../../../../schemas/complexQuizSchemas/courseSchema';

const createCourse = async (createCourseData: CreateCourse): Promise<Course> => {
	const response = await fetch(`/api/course`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(createCourseData)
	});
	if (!response.ok) {
		throw new Error('Failed to create course');
	}
	const data = await response.json();
	return data;
};

export default createCourse;
