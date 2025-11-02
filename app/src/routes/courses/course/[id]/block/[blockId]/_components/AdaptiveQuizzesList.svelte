<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import Spinner from '$lib/components/Spinner.svelte';
	import AdaptiveQuizCard from './AdaptiveQuizCard.svelte';
	import getAdaptiveQuizzesByUserBlockId from '../_clientServices/getAdaptiveQuizzesByUserBlockId';
	import queryClient from '../../../../../../queryClient';
	import { onDestroy } from 'svelte';

	let { userBlockId }: { userBlockId: string } = $props();

	const queryKey = ['adaptiveQuizzes', userBlockId];

	const adaptiveQuizzesQuery = createQuery({
		queryKey,
		queryFn: async () => await getAdaptiveQuizzesByUserBlockId(userBlockId)
	});

	let interval = $state<NodeJS.Timeout>();

	$effect(() => {
		if ($adaptiveQuizzesQuery?.data?.some((q) => q.readyForAnswering === false)) {
			if (!interval) {
				interval = setInterval(() => {
					queryClient.invalidateQueries({ queryKey });
				}, 1000);
			}
		} else if (interval) {
			clearInterval(interval);
			interval = undefined;
		}
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

{#if $adaptiveQuizzesQuery.isLoading}
	<Spinner />
{:else}
	<div class="flex flex-wrap w-full gap-4 lg:max-w-[80%]">
		{#each $adaptiveQuizzesQuery.data?.sort((a, b) => a.version - b.version) as adaptiveQuiz}
			<AdaptiveQuizCard {adaptiveQuiz} />
		{/each}
	</div>
{/if}
