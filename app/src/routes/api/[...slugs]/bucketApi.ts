import * as Minio from 'minio';

export const MinioClient = new Minio.Client({
	endPoint: 'localhost',
	port: 9000,
	useSSL: false,
	accessKey: 'minio',
	secretKey: 'minio123'
});
