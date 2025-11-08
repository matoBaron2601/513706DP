<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import getAdaptiveQuizzesByUserBlockId from '../_clientServices/getAdaptiveQuizzesByUserBlockId';
	import Spinner from '$lib/components/Spinner.svelte';
	import AdaptiveQuizCard from '../../_components/AdaptiveQuizCard.svelte';

	const { userBlockId }: { userBlockId: string } = $props();
	const courseId = page.params.id ?? '';
	const blockId = page.params.blockId ?? '';

	const adaptiveQuizzesQuery = createQuery({
		queryKey: ['adaptiveQuizzes', blockId],
		queryFn: async () => {
			return await getAdaptiveQuizzesByUserBlockId(userBlockId);
		}
	});

	const adaptiveQuizzes = $derived.by(
		() => $adaptiveQuizzesQuery.data?.filter((quiz) => quiz.isCompleted === true).sort((a, b) => b.version - a.version) ?? []
	);
</script>

{#if $adaptiveQuizzesQuery.isLoading}
	<Spinner />
{:else}
	<div class="flex flex-col gap-4">
		{#each adaptiveQuizzes as adaptiveQuiz}
			<AdaptiveQuizCard {adaptiveQuiz} />
		{/each}
	</div>
{/if}
