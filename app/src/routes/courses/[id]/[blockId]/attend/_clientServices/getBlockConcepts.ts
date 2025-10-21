import type { Concept } from '../../../../../../schemas/conceptSchema';

const getBlockConcepts = async (blockId: string): Promise<Concept[]> => {
	const response = await fetch(`/api/concept/block/${blockId}`);
	if (!response.ok) {
		throw new Error('Failed to get course block concepts');
	}
	const data = await response.json();
	return data;
};

export default getBlockConcepts;
