import { Elysia, t } from 'elysia';
import { CourseBlockService } from '../../../services/complexQuizServices/courseBlockService';
import { createCourseBlockExtendedSchema } from '../../../schemas/complexQuizSchemas/courseBlockSchema';
import fs from 'fs';
import path from 'path';
import { CourseBlockFacade } from '../../../facades/complexQuizFacades/courseBlockFacade';

const courseBlockService = new CourseBlockService();
const courseBlockFacade = new CourseBlockFacade();

export const courseBlockApi = new Elysia({ prefix: 'courseBlock' })
	.get('/courseId/:id', async (req) => {
		return await courseBlockService.getByCourseId(req.params.id);
	})
	.post(
		'/',
		async (req) => {
			const documentName = await saveFile(req.body.document);
			return await courseBlockFacade.create({
				courseId: req.body.courseId,
				name: req.body.name,
				document: documentName
			});
		},
		{
			body: createCourseBlockExtendedSchema
		}
	);

export default courseBlockApi;

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
