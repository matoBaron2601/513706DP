<script lang="ts">
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import Spinner from '$lib/components/Spinner.svelte';
	import AdaptiveQuizCard from './AdaptiveQuizCard.svelte';
	import queryClient from '../../../../../../queryClient';
	import { onDestroy } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import getLastAdaptiveQuizByUserBlockId from '../_clientServices/getLastAdaptiveQuizByUserBlockId';
	import { Button } from '$lib/components/ui/button';
	import regenerateAdaptiveQuiz from '../_clientServices/regenerateAdaptiveQuiz';

	let { userBlockId }: { userBlockId: string } = $props();

	const queryKey = ['adaptiveQuizzes', userBlockId];

	const adaptiveQuizQuery = createQuery({
		queryKey: queryKey,
		queryFn: async () => await getLastAdaptiveQuizByUserBlockId(userBlockId)
	});

	const regenerateAdaptiveQuizMutation = createMutation({
		mutationFn: async (adaptiveQuizId: string) => {
			return await regenerateAdaptiveQuiz(adaptiveQuizId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey });
		}
	});

	let interval = $state<NodeJS.Timeout>();

	$effect(() => {
		console.log($adaptiveQuizQuery?.data);
		if (
			!$adaptiveQuizQuery?.data?.readyForAnswering &&
			$adaptiveQuizQuery?.data?.version !== 9999
		) {
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

	const handleRetry = async () => {
		if ($adaptiveQuizQuery.data) {
			await $regenerateAdaptiveQuizMutation.mutateAsync($adaptiveQuizQuery.data.id);
		}
	};
</script>

{#if $adaptiveQuizQuery.isLoading || (!$adaptiveQuizQuery.data?.readyForAnswering && $adaptiveQuizQuery.data?.version !== 9999)}
	<div class="flex flex-col items-center justify-center gap-3 py-10 text-center">
		<Spinner />
		<p class="text-gray-600">Preparing your next quiz…</p>
		<p class="text-sm text-gray-500">We’re selecting the best questions to help you progress.</p>
	</div>
{:else if $adaptiveQuizQuery.data?.readyForAnswering && $adaptiveQuizQuery.data?.version !== 9999}
	<div class="mt-8 flex w-full flex-col flex-wrap gap-4">
		<Card.Title class="text-2xl">Your next quiz is ready</Card.Title>
		{#if $adaptiveQuizQuery.data}
			<AdaptiveQuizCard adaptiveQuiz={$adaptiveQuizQuery.data} />
		{/if}
	</div>
{:else}
	Error preparing the quiz. Please try again.
	<Button onclick={handleRetry}>Retry</Button>
{/if}
