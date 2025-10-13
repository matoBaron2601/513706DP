const deleteQuizById = async (quizId: string) => {
	const response = await fetch(`/api/quiz/${quizId}`, {
		method: 'DELETE'
	});
	if (!response.ok) {
		throw new Error('Failed to delete quiz');
	}

	return;
};
export default deleteQuizById;
