const deleteQuizById = async (quizId: string) => {
	const response = await fetch(`/api/quiz/${quizId}`, {
		method: 'DELETE'
	});
	if (!response.ok) {
		throw new Error('Failed to delete quiz');
	}
	return await response.json();
};
export default deleteQuizById;
