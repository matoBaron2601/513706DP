import { TypesenseService } from '../typesenseService';

const run = async () => {
	const typesenseService = new TypesenseService();
	try {
		//TODO: pass real data instead of empty objects
		await typesenseService.populateOneTimeQuizCollection({});
		await typesenseService.populateComplexQuizCollection({});
	} catch (error) {
		console.error('Error populating collections:', error);
	}
};

run();
