import type { CourseBlock } from "../../../../schemas/complexQuizSchemas/courseBlockSchema";

const getCourseBlocks = async (courseId: string): Promise<CourseBlock[]> => {
    const response = await fetch(`/api/courseBlock/courseId/${courseId}`);
    if (!response.ok) {
        throw new Error('Failed to get course blocks');
    }
    const data = await response.json();
    return data;
};

export default getCourseBlocks;
