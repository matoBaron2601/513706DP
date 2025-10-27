import type {
	CreateBlockRequest,
	CreateBlockResponse
} from '../../../../../../schemas/blockSchema';

const createBlock = async (data: CreateBlockRequest): Promise<CreateBlockResponse> => {
	const response = await fetch('/api/block/createBlock', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
	if (!response.ok) {
		throw new Error('Failed to create block');
	}
	return await response.json();
};

export default createBlock;
