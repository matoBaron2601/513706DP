import type { Block } from "../../schemas/blockSchema";

const getBlockById = async (blockId: string): Promise<Block> => {
    const response = await fetch(`/api/block/${blockId}`, {});

    if (!response.ok) {
        throw new Error('Failed to get block by id');
    }
    return await response.json();
};

export default getBlockById;
