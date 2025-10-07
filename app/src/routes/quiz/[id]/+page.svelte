<script>
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import getQuizById from './clientServices/getQuizById';

	const quizId = page.params.id ?? '';

	const getQuizByIdQuery = createQuery({
		queryKey: ['quiz', quizId],
		queryFn: async () => getQuizById(quizId)
	});

</script>

<div>{$getQuizByIdQuery.data?.quiz.id}</div>
