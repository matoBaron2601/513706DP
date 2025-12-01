import type { Concept } from "../../../../../../../../../schemas/conceptSchema";

const getConceptsByBlockId = async (blockId: string): Promise<Concept[]> => {
    const response = await fetch(`/api/concept/blockId/${blockId}`);
    if (!response.ok) {
        throw new Error('Failed to get concepts by block ID');
    }
    const data = await response.json();
    return data;
};

export default getConceptsByBlockId;
