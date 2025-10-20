import type { Concept } from '../../../../../schemas/conceptSchema';

const getCourseBlockConcepts = async (courseBlockId: string): Promise<Concept[]> => {
	const response = await fetch(`/api/concept/courseBlock/${courseBlockId}`);
	if (!response.ok) {
		throw new Error('Failed to get course block concepts');
	}
	const data = await response.json();
	return data;
};

export default getCourseBlockConcepts;
