import Elysia, { t } from 'elysia';
import * as Minio from 'minio';
import { readFile } from 'node:fs/promises';
import { BucketService } from '../../../services/bucketService';

export const MinioClient = new Minio.Client({
	endPoint: 'localhost',
	port: 9000,
	useSSL: false,
	accessKey: 'minio',
	secretKey: 'minio123'
});

