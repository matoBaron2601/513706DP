import { TypesenseService } from '../typesenseService';

const run = async () => {
	const typesenseService = new TypesenseService();
	try {
		await typesenseService.deleteQuizCollection();
	} catch (error) {
		console.error('Error deleting collections:', error);
	}
};

run();
