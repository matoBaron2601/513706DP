<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import getCreatedQuizzesByUserEmail from './clientServices/getCreatedQuizzesByUserEmail';
	import Spinner from '$lib/components/Spinner.svelte';
	import { page } from '$app/state';
	import { getUserFromPage } from '$lib/utils';
	import QuizCardList from './components/QuizCardList.svelte';
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
		<QuizCardList createdQuizzes={$createdQuizzes.data} />
	{:else}
		<p>No quizzes found.</p>
	{/if}
</PageWrapper>
