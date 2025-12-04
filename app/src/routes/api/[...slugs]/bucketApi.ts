/**
 * @fileoverview
 * This file sets up the Minio client for interacting with the Minio object storage server.
 * It configures the client with the necessary connection details such as endpoint, port,
 * access key, and secret key.
 */

import * as Minio from 'minio';

export const MinioClient = new Minio.Client({
	endPoint: 'localhost',
	port: 9000,
	useSSL: false,
	accessKey: 'minio',
	secretKey: 'minio123'
});
