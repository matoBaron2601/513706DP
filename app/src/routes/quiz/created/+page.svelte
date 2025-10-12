<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import getCreatedQuizzesByUserEmail from './clientServices/getCreatedQuizzesByUserEmail';
	import Spinner from '$lib/components/Spinner.svelte';
	import QuizCard from './components/QuizCard.svelte';
	import { page } from '$app/state';
	import { getUserFromPage } from '$lib/utils';
	const user = getUserFromPage(page);

	const createdQuizzes = createQuery({
		queryKey: ['createdQuizzes'],
		queryFn: async () => getCreatedQuizzesByUserEmail(user?.email || '')
	});
</script>

<PageWrapper>
	{#if $createdQuizzes.isLoading}
		<Spinner />
	{:else if $createdQuizzes.isError}
		<p>Error loading quizzes.</p>
	{:else if $createdQuizzes.data}
		<div class="flex gap-4">
			{#each $createdQuizzes.data as quiz}
				<QuizCard {quiz} />
			{/each}
		</div>
	{:else}
		<p>No quizzes found.</p>
	{/if}
</PageWrapper>
