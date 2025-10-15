import { TypesenseService } from '../typesenseService';

const run = async () => {
	const typesenseService = new TypesenseService();
	try {
		await typesenseService.createOneTimeQuizCollection();
		await typesenseService.createComplexQuizCollection();
	} catch (error) {
		console.error('Error creating collections:', error);
	}
};

run();
