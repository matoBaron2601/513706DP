import Elysia, { t } from 'elysia';
import * as Minio from 'minio';

export const MinioClient = new Minio.Client({
	endPoint: 'localhost',
	port: 9000,
	useSSL: false,
	accessKey: 'minio',
	secretKey: 'minio123'
});

export const bucketApi = new Elysia({ prefix: 'bucketApi' }).get(
	'/progress/:userBlockId',
	async (req) => {}
);

export default bucketApi;
