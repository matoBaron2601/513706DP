<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';

	import Spinner from '$lib/components/Spinner.svelte';
	import AdaptiveQuizCard from './AdaptiveQuizCard.svelte';
	import getAdaptiveQuizzesByUserBlockId from '../_clientServices/getAdaptiveQuizzesByUserBlockId';

	let { userBlockId }: { userBlockId: string } = $props();

	const adaptiveQuizzesQuery = createQuery({
		queryKey: ['adaptiveQuizzes'],
		queryFn: async () => {
			return await getAdaptiveQuizzesByUserBlockId(userBlockId);
		}
	});
</script>

{#if $adaptiveQuizzesQuery.isLoading}
	<Spinner />
{:else}
	<ul class="list-disc pl-5">
		{#each $adaptiveQuizzesQuery.data as adaptiveQuiz}
			<AdaptiveQuizCard {adaptiveQuiz} />
		{/each}
	</ul>
{/if}
