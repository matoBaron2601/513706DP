import { Elysia, t } from 'elysia';
import fs from 'fs';
import path from 'path';
import { BlockFacade } from '../../../facades/blockFacade';
import { createBlockWithDocumentSchema } from '../../../schemas/blockSchema';

const blockFacade = new BlockFacade();

export const blockApi = new Elysia({ prefix: 'block' })
	.get('/courseId/:id', async (req) => {
		return await blockFacade.getManyByCourseId(req.params.id);
	})
	.post(
		'/',
		async (req) => {
			const documentName = await saveFile(req.body.document);
			return await blockFacade.createBlockWithDocument({
				courseId: req.body.courseId,
				name: req.body.name,
				document: documentName
			});
		},
		{
			body: createBlockWithDocumentSchema
		}
	);

export default blockApi;

async function saveFile(file: File): Promise<string> {
	const uploadDir = path.resolve(process.cwd(), 'uploads');
	await fs.promises.mkdir(uploadDir, { recursive: true });

	const formData = new FormData();
	formData.append('file', file);
	const fileName = `${Date.now()}_${file.name}`;
	const filePath = path.join(uploadDir, fileName);

	let dataToWrite: Buffer | string;
	if (typeof file === 'string') {
		dataToWrite = file;
	} else if (typeof (file as any)?.arrayBuffer === 'function') {
		const ab = await (file as any).arrayBuffer();
		dataToWrite = Buffer.from(ab);
	} else if (Buffer.isBuffer(file)) {
		dataToWrite = file;
	} else {
		dataToWrite = JSON.stringify(file);
	}

	await fs.promises.writeFile(filePath, dataToWrite);
	return fileName;
}
