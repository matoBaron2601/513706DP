import type { CourseBlock, CreateCourseBlock } from "../../../../../schemas/complexQuizSchemas/courseBlockSchema";

const createCourseBlock = async (createCourseBlockData: CreateCourseBlock): Promise<CourseBlock> => {
    const response = await fetch(`/api/courseBlock`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(createCourseBlockData)
    });
    if (!response.ok) {
        throw new Error('Failed to create course block');
    }
    const data = await response.json();
    return data;
};

export default createCourseBlock;
