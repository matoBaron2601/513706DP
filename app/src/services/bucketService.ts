/**
 * @fileoverview
 * BucketService handles interactions with the MinIO object storage service,
 * specifically for managing block data files and profile pictures.
 */

import { MinioClient } from "$lib/minioClient";


const BLOCKDATA = 'blockdata';
const PROFILEPIC = 'profilepic';

export class BucketService {
	constructor() {}
	/**
	 * Ensures that the block data bucket exists; creates it if it does not.
	 * @param none
	 * @returns void
	 */
	async ensureBlockDataBucket() {
		const blockDataExists = await MinioClient.bucketExists(BLOCKDATA).catch(() => false);

		if (!blockDataExists) await MinioClient.makeBucket(BLOCKDATA, 'us-east-1');
	}

	/**
	 * Uploads a block data file to the block data bucket.
	 * @param file The file to upload.
	 * @returns The name of the uploaded object.
	 */
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

	/**
	 * Retrieves a readable stream for a block data file from the block data bucket.
	 * @param objectName The name of the object to retrieve.
	 * @returns A readable stream of the object.
	 */
	async getBlockDataFileStream(objectName: string) {
		await this.ensureBlockDataBucket();
		const stream = await MinioClient.getObject(BLOCKDATA, objectName);
		return stream;
	}

	/**
	 * Retrieves the contents of a block data file as a string.
	 * @param objectName The name of the object to retrieve.
	 * @returns The contents of the object as a string.
	 */
	async getBlockDataFileString(objectName: string): Promise<string> {
		await this.ensureBlockDataBucket();

		const stream = await MinioClient.getObject(BLOCKDATA, objectName);
		const chunks: Buffer[] = [];

		for await (const chunk of stream) {
			chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
		}

		return Buffer.concat(chunks).toString('utf-8');
	}

	/**
	 * Ensures that the profile picture bucket exists; creates it if it does not.
	 * @param none
	 * @returns void
	 */
	async ensureProfilePicBucket() {
		const profilePicExists = await MinioClient.bucketExists(PROFILEPIC).catch(() => false);

		if (!profilePicExists) await MinioClient.makeBucket(PROFILEPIC, 'us-east-1');
	}

	/**
	 * Uploads a profile picture file to the profile picture bucket.
	 * @param file The file to upload.
	 * @returns The name of the uploaded object.
	 */
	async uploadProfilePicFile(file: File): Promise<string> {
		await this.ensureProfilePicBucket();

		if (!file) throw new Error('Missing file');

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const objectName = `${file.name.split('.').slice(0, -1).join('.')}.${
			file.name.split('.').pop() || 'jpg'
		}`;

		await MinioClient.putObject(PROFILEPIC, objectName, buffer, buffer.length, {
			'Content-Type': file.type || 'image/jpg'
		});

		return objectName;
	}

	/**
	 * Retrieves a readable stream for a profile picture file from the profile picture bucket.
	 * @param objectName The name of the object to retrieve.
	 * @returns A readable stream of the object.
	 */
	async getProfilePicFileStream(objectName: string) {
		await this.ensureProfilePicBucket();
		const stream = await MinioClient.getObject(PROFILEPIC, objectName);
		return stream;
	}

	/**
	 * Retrieves the contents of a profile picture file as a Buffer.
	 * @param objectName The name of the object to retrieve.
	 * @returns The contents of the object as a Buffer.
	 */
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
