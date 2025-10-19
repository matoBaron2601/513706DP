import type { CourseBlock, CreateCourseBlockExtended } from "../../../../../schemas/complexQuizSchemas/courseBlockSchema";

const createCourseBlock = async (createCourseBlockData: CreateCourseBlockExtended) => {
    const formData = new FormData();

    formData.append('courseId', createCourseBlockData.courseId);
    formData.append('name', createCourseBlockData.name);
    formData.append('document', createCourseBlockData.document); 

    const response = await fetch(`/api/courseBlock`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to create course block');
    }
    return await response.json();

};

export default createCourseBlock;