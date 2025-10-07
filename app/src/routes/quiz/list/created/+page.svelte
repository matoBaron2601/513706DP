<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import getQuizzesByUserId from '../clientServices/getQuizzesByUserId';
	import Spinner from '$lib/components/Spinner.svelte';
	import QuizCard from '../components/QuizCard.svelte';
	import { page } from '$app/state';
	import { getUserFromPage } from '$lib/utils';
	console.log(page.data.session)
	const user = getUserFromPage(page);

	const createdQuizzes = createQuery({
		queryKey: ['createdQuizzes'],
		queryFn: async () => getQuizzesByUserId(user?.email || ''),
	});
</script>

<PageWrapper>
	{#if $createdQuizzes.isLoading}
		<Spinner />
	{:else if $createdQuizzes.isError}
		<p>Error loading quizzes.</p>
	{:else if $createdQuizzes.data}
		<ul>
			{#each $createdQuizzes.data as quiz}
				<QuizCard {quiz} />
			{/each}
		</ul>
	{:else}
		<p>No quizzes found.</p>
	{/if}
</PageWrapper>
