import Elysia from 'elysia';
import { getUniqueDatasetsService } from '../../../typesense/typesenseService_old';
import type { UniqueDataset } from '../../../typesense/types';
export const typesenseApi = new Elysia()
	//General
	.get('typesense/collection', async () => {
		return {};
	})
	.post('typesense/collection', async () => {
		return {};
	})

	.delete('typesense/collection', async () => {
		return {};
	})
	// Default
	.post('typesense/collection/default/populate', async () => {
		return {};
	})
	.get('typesense/default/dataset', async (): Promise<UniqueDataset[]> => {
		return getUniqueDatasetsService({ isDefault: true });
	})
	// Custom
	.get('typesense/collection/custom/populate', async () => {})
	.get('typesense/custom/dataset', async (): Promise<UniqueDataset[]> => {
		return getUniqueDatasetsService({ isDefault: false });
	});
