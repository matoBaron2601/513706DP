import { db } from '../client';
import { 
    oneTimeUserAnswer, 
    complexQuizUserAnswer, 
    oneTimeQuizUser, 
    complexQuizUser, 
    complexQuizQuestion, 
    concept, 
    courseBlock, 
    complexQuiz, 
    oneTimeQuiz, 
    baseAnswer, 
    baseOption, 
    baseQuestion, 
    baseQuiz, 
    course,        // Importing course table
    user 
} from '../schema';

async function deleteDatabaseTables() {
    try {
        // Start with answers given by users
        await db.delete(complexQuizUserAnswer).execute();
        await db.delete(oneTimeUserAnswer).execute();

        // Then delete user quiz associations
        await db.delete(oneTimeQuizUser).execute();
        await db.delete(complexQuizUser).execute();

        // Delete complex quiz questions
        await db.delete(complexQuizQuestion).execute();

        // Delete complex quizzes
        await db.delete(complexQuiz).execute();

        // Remove concepts
        await db.delete(concept).execute();

        // Remove course blocks
        await db.delete(courseBlock).execute();

        // Delete all courses before users
        await db.delete(course).execute();

        // Delete one-time quizzes
        await db.delete(oneTimeQuiz).execute();

        // Delete base answers and options
        await db.delete(baseAnswer).execute();
        await db.delete(baseOption).execute();

        // Delete base questions and base quizzes
        await db.delete(baseQuestion).execute();
        await db.delete(baseQuiz).execute();

        // Finally, delete users
        await db.delete(user).execute();

        console.log('All data deleted successfully');
    } catch (error) {
        console.error('Error deleting data', error);
    } finally {
        await db.$client.end();
    }
}

deleteDatabaseTables();