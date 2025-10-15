import Elysia from 'elysia';
import { chunkRTCService } from '../../../chunker/chunkerService_old';
import { populateDocumentsService } from '../../../typesense/typesenseService_old';

export const chunkerApi = new Elysia().post(
	'chunker/chunkRTC',
	async (context): Promise<{ message: string; chunksCount: number }> => {
		const body = context.body as { file?: File };
		const file = body.file;
		console.log('File received:', file);
		if (!file) {
			throw new Error('No file provided');
		}
		const chunksFromFile = await chunkRTCService(file);
		console.log('Chunks from file:', chunksFromFile);
		const populateChunks = await populateDocumentsService({
			contentChunks: chunksFromFile,
			is_default: false,
			name: 'custom',
			source_file: file.name
		});
		return { message: populateChunks.message, chunksCount: chunksFromFile.length };
	}
);
