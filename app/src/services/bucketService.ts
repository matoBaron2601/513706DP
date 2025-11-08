import { MinioClient } from '../routes/api/[...slugs]/bucketApi';

const BLOCKDATA = 'blockdata';
const PROFILEPIC = 'profilepic';

export class BucketService {
	constructor() {}
	async ensureBlockDataBucket() {
		const blockDataExists = await MinioClient.bucketExists(BLOCKDATA).catch(() => false);

		if (!blockDataExists) await MinioClient.makeBucket(BLOCKDATA, 'us-east-1');
	}
	async uploadBlockDataFile(file: File): Promise<string> {
		await this.ensureBlockDataBucket();

		if (!file) throw new Error('Missing file');

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const objectName = `${file.name.split('.txt')[0]}_${new Date().toISOString()}.txt`;

		await MinioClient.putObject(BLOCKDATA, objectName, buffer, buffer.length, {
			'Content-Type': file.type || 'text/plain; charset=utf-8'
		});

		return objectName;
	}

	async getBlockDataFileStream(objectName: string) {
		await this.ensureBlockDataBucket();
		const stream = await MinioClient.getObject(BLOCKDATA, objectName);
		return stream;
	}

	async getBlockDataFileString(objectName: string): Promise<string> {
		await this.ensureBlockDataBucket();

		const stream = await MinioClient.getObject(BLOCKDATA, objectName);
		const chunks: Buffer[] = [];

		for await (const chunk of stream) {
			chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
		}

		return Buffer.concat(chunks).toString('utf-8');
	}


	

	async ensureProfilePicBucket() {
		const profilePicExists = await MinioClient.bucketExists(PROFILEPIC).catch(() => false);

		if (!profilePicExists) await MinioClient.makeBucket(PROFILEPIC, 'us-east-1');
	}
	async uploadProfilePicFile(file: File): Promise<string> {
		await this.ensureProfilePicBucket();

		if (!file) throw new Error('Missing file');

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const objectName = `${file.name.split('.').slice(0, -1).join('.')}_${new Date().toISOString()}.${
			file.name.split('.').pop() || 'png'
		}`;

		await MinioClient.putObject(PROFILEPIC, objectName, buffer, buffer.length, {
			'Content-Type': file.type || 'image/png'
		});

		return objectName;
	}

	async getProfilePicFileStream(objectName: string) {
		await this.ensureProfilePicBucket();
		const stream = await MinioClient.getObject(PROFILEPIC, objectName);
		return stream;
	}

	async getProfilePicFileBuffer(objectName: string): Promise<Buffer> {
		await this.ensureProfilePicBucket();

		const stream = await MinioClient.getObject(PROFILEPIC, objectName);
		const chunks: Buffer[] = [];

		for await (const chunk of stream) {
			chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
		}

		return Buffer.concat(chunks);
	}
}
