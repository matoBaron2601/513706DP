/**
 * Fetches a block by its ID from the API.
 * @param blockId - The ID of the block to fetch.
 * @returns A promise that resolves to the Block object.
 * @throws An error if the fetch operation fails.
 */

import type { Block } from '../../schemas/blockSchema';

export const getBlockById = async (blockId: string): Promise<Block> => {
	const response = await fetch(`/api/block/${blockId}`);

	if (!response.ok) {
		throw new Error('Failed to get block by id');
	}
	return await response.json();
};
