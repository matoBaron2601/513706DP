import { db } from '../client';
import { option, question, quiz, user, answer, userQuiz } from '../schema';

async function deleteDatabaseTables() {
	try {
		await db.delete(answer).execute();
		await db.delete(option).execute();
		await db.delete(question).execute();
		await db.delete(userQuiz).execute();
		await db.delete(quiz).execute();
		await db.delete(user).execute();
		console.log('All data deleted successfully');
	} catch (error) {
		console.error('Error deleting data', error);
	} finally {
		await db.$client.end();
	}
}

deleteDatabaseTables();
