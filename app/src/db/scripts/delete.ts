import { db } from '../client';
import { table } from '../schema'; 

// Deletes all records from every table in the configured order
const run = async () => {
	try {
		await db.delete(table.document);
		await db.delete(table.adaptiveQuizAnswer);
		await db.delete(table.conceptProgress);
		await db.delete(table.adaptiveQuiz);
		await db.delete(table.userBlock);
		await db.delete(table.placementQuiz);
		await db.delete(table.baseOption);
		await db.delete(table.baseQuestion);
		await db.delete(table.baseQuiz);
		await db.delete(table.concept);
		await db.delete(table.block);
		await db.delete(table.course);
		console.log('All data deleted successfully');
	} catch (error) {
		console.error('Error deleting data: ', error);
	}
};

run();
