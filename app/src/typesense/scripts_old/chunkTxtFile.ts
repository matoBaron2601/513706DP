import { readFile, mkdir, writeFile } from 'fs/promises';
import { chunkRTC } from '../../chunker/chunkerRepository_old';
import path from 'path';

const run = async () => {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.log('No arguments provided.');
		return;
	}

	if (args.length !== 1) {
		console.log('Please provide exactly one argument.');
		return;
	}

	const inputFilePath = args[0];
	const outputDir = './src/typesense/scripts/finalJsonData'; // Directory where you want to save the JSON file

	// Get the base name and replace the extension with .json
	const baseName = path.basename(inputFilePath, path.extname(inputFilePath));
	const outputFilePath = path.join(outputDir, `${baseName}.json`); // Output file name with .json extension

	try {
		// Read the file data
		const data = await readFile(inputFilePath, 'utf-8');

		// Create a FormData instance and append the file data
		const formData = new FormData();
		formData.append('file', new Blob([data], { type: 'text/plain' }), 'file.txt');

		// Call the chunkRTC function with the form data
		const result = await chunkRTC(formData);

		// Parse the JSON response
		const responseData = await result.json();

		// Create the desired JSON structure
		const jsonResponse = {
			content: responseData // Assuming responseData is an array or you want it directly as content
		};

		// Log the JSON response to verify
		console.log(JSON.stringify(jsonResponse, null, 2));

		// Create the output directory if it does not exist
		await mkdir(outputDir, { recursive: true });

		// Write the JSON response to a file
		await writeFile(outputFilePath, JSON.stringify(jsonResponse, null, 2), 'utf-8');

		console.log(`JSON data saved to ${outputFilePath}`);
	} catch (error) {
		console.error('Error:', error);
	}
};

run();
