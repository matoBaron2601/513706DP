<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import Spinner from '$lib/components/Spinner.svelte';
	import { page } from '$app/state';
	import { getUserFromPage } from '$lib/utils';
	import getQuizHistoryListByUserEmail from './clientServices.ts/getQuizHistoryListByUserEmail';
	import HistoryLine from './components/HistoryLine.svelte';
	import HistoryList from './components/HistoryList.svelte';
	const user = getUserFromPage(page);

	const quizHistory = createQuery({
		queryKey: ['quizHistory'],
		queryFn: async () => await getQuizHistoryListByUserEmail(user?.email || '')
	});
</script>

<PageWrapper>
	{#if $quizHistory.isLoading}
		<Spinner />
	{:else if $quizHistory.isError}
		<p>Error loading quizzes.</p>
	{:else if $quizHistory.data}
		<HistoryList quizHistory={$quizHistory.data} />
	{:else}
		<p>No quizzes found.</p>
	{/if}
</PageWrapper>
