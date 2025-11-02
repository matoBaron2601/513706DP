import { MinioClient } from '../routes/api/[...slugs]/bucketApi';

const BUCKET = 'blockdata';

export class BucketService {
	constructor() {}
	async ensureBucket() {
		const exists = await MinioClient.bucketExists(BUCKET).catch(() => false);
		if (!exists) await MinioClient.makeBucket(BUCKET, 'us-east-1');
	}
	async uploadFile(file: File): Promise<string> {
		await this.ensureBucket();

		if (!file) throw new Error('Missing file');

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const objectName = `${file.name.split('.txt')[0]}_${new Date().toISOString()}.txt`;

		await MinioClient.putObject(BUCKET, objectName, buffer, buffer.length, {
			'Content-Type': file.type || 'text/plain; charset=utf-8'
		});

		return objectName;
	}

	async getFileStream(objectName: string) {
		await this.ensureBucket();
		const stream = await MinioClient.getObject(BUCKET, objectName);
		return stream;
	}

	async getFileString(objectName: string): Promise<string> {
		await this.ensureBucket();

		const stream = await MinioClient.getObject(BUCKET, objectName);
		const chunks: Buffer[] = [];

		for await (const chunk of stream) {
			chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
		}

		return Buffer.concat(chunks).toString('utf-8');
	}
}
