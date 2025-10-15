import { TypesenseService } from '../typesenseService';

const run = async () => {
	const typesenseService = new TypesenseService();
	try {
		await typesenseService.deleteOneTimeQuizCollection();
		await typesenseService.deleteComplexQuizCollection();
	} catch (error) {
		console.error('Error deleting collections:', error);
	}
};

run();
