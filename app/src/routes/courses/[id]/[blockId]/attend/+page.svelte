<script lang="ts">
	const getComplexQuizUser = async (courseBlockId: string, id: string) => {
		const res = await fetch(`/api/courses/${id}/course-blocks/${courseBlockId}/complex-quiz-user`, {
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		});

		if (!res.ok) {
			throw new Error('Failed to fetch complex quiz user data');
		}

		return await res.json();
	};

</script>

Hello
