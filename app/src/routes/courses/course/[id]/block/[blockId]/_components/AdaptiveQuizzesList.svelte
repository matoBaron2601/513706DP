<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import Spinner from '$lib/components/Spinner.svelte';
	import AdaptiveQuizCard from './AdaptiveQuizCard.svelte';
	import getAdaptiveQuizzesByUserBlockId from '../_clientServices/getAdaptiveQuizzesByUserBlockId';
	import queryClient from '../../../../../../queryClient';
	import { onDestroy } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import getLastAdaptiveQuizByUserBlockId from '../_clientServices/getLastAdaptiveQuizByUserBlockId';

	let { userBlockId }: { userBlockId: string } = $props();

	const queryKey = ['adaptiveQuizzes', userBlockId];

	const adaptiveQuizQuery = createQuery({
		queryKey: queryKey,
		queryFn: async () => await getLastAdaptiveQuizByUserBlockId(userBlockId)
	});

	let interval = $state<NodeJS.Timeout>();

	$effect(() => {
		if (!$adaptiveQuizQuery?.data?.readyForAnswering) {
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

{#if $adaptiveQuizQuery.isLoading}
	<div class="flex flex-col items-center justify-center gap-3 py-10 text-center">
		<Spinner />
		<p class="text-gray-600">Preparing your next quiz…</p>
		<p class="text-sm text-gray-500">We’re selecting the best questions to help you progress.</p>
	</div>
{:else}
	<div class="mt-8 flex w-full flex-col flex-wrap gap-4">
		<Card.Title class="text-2xl">Your next quiz is ready</Card.Title>
		{#if $adaptiveQuizQuery.data}
			<AdaptiveQuizCard adaptiveQuiz={$adaptiveQuizQuery.data} />
		{/if}
	</div>
{/if}
