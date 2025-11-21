<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import getAdaptiveQuizzesByUserBlockId from '../_clientServices/getAdaptiveQuizzesByUserBlockId';
	import Spinner from '$lib/components/Spinner.svelte';
	import AdaptiveQuizCard from '../../_components/AdaptiveQuizCard.svelte';
	import { Button } from '$lib/components/ui/button';

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
		() =>
			$adaptiveQuizzesQuery.data
				?.filter((quiz) => quiz.isCompleted === true)
				.sort((a, b) => b.version - a.version) ?? []
	);
</script>

{#if $adaptiveQuizzesQuery.isLoading}
	<Spinner />
{:else if adaptiveQuizzes.length === 0}
	<div
		class="mx-auto mt-10 max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm"
	>
		<div class="mb-3 select-none text-4xl">📜</div>
		<h2 class="mb-1 text-lg font-semibold text-gray-900">No history yet</h2>
		<p class="mb-6 text-sm text-gray-500">
			Once you start working on this block, your progress history will appear here.
		</p>
		<Button
			href={`/courses/course/${courseId}/block/${blockId}`}
			class="cursor-pointer px-4 py-2 text-sm"
			variant="outline"
		>
			Go to block
		</Button>
	</div>
{:else}
	<div class="flex flex-col gap-4">
		{#each adaptiveQuizzes as adaptiveQuiz}
			<AdaptiveQuizCard {adaptiveQuiz} />
		{/each}
	</div>
{/if}
