import { Elysia } from 'elysia';
import { BucketService } from '../../../services/bucketService';
import { Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export const createBucketApi = (deps?: { bucketService?: BucketService }) => {
	const bucketService = deps?.bucketService ?? new BucketService();

	return new Elysia({ prefix: 'bucket' })
		.post('/profilePic', async ({ request }) => {
			const formData = await request.formData();
			const file = formData.get('file');

			if (!(file instanceof File)) {
				throw new Error('No file uploaded');
			}

			const objectName = await bucketService.uploadProfilePicFile(file);

			return { objectName };
		})

		.get('/profilePic/:objectName', async ({ params }) => {
			try {
				const nodeStream = await bucketService.getProfilePicFileStream(
					decodeURIComponent(params.objectName)
				);

				const { readable, writable } = new TransformStream();

				pipeline(nodeStream, Writable.fromWeb(writable)).catch((err) => {
					console.error('Pipeline error:', err);
				});

				return new Response(readable, {
					headers: {
						'Content-Type': 'image/jpeg',
						'Cache-Control': 'public, max-age=3600'
					}
				});
			} catch (err) {
				console.error('Profile pic error:', err);
				return new Response(null, { status: 404 });
			}
		});
};

export const bucketApi = createBucketApi();
export default bucketApi;
