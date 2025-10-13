import { populateDocumentsService } from '../typesenseService';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

const run = async () => {
	const directoryPath = 'src/typesense/scripts/finalJsonData';

	try {
		const files = await readdir(directoryPath);

		const jsonFiles = files.filter((file) => file.endsWith('.json'));

		for (const file of jsonFiles) {
			const filePath = path.join(directoryPath, file);
			const fileData = await readFile(filePath, 'utf-8');
			const jsonData = JSON.parse(fileData);
			const result = await populateDocumentsService({
				contentChunks: jsonData.content,
				is_default: true,
				name: file.split('.json')[0],
				source_file: file
			});

			console.log(`Collection populated successfully from ${file}:`, result);
		}
	} catch (error) {
		console.error('Error populating collection:', error);
	}
};

run();
