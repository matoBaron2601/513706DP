<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import { page } from '$app/state';
	import type { AdaptiveQuiz } from '../../../../../../../schemas/adaptiveQuizSchema';
	import { Tally5Icon } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import Spinner from '$lib/components/Spinner.svelte';

	const { adaptiveQuiz }: { adaptiveQuiz: AdaptiveQuiz } = $props();

	const quizLabel = $derived.by(() =>
		adaptiveQuiz.version === 0 ? 'Placement Quiz' : `Adaptive Quiz v${adaptiveQuiz.version}`
	);
</script>

<Card.Root class="min-w-50 relative mx-auto w-full p-10">
	{#if !adaptiveQuiz.readyForAnswering}
		<Spinner />
	{:else}
		<Card.Content class="flex flex-col gap-2">
			<Card.Title class="m-auto text-xl">{quizLabel}</Card.Title>
			<div class="mx-auto">
				{#if adaptiveQuiz.isCompleted}
					<span
						class="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-200 px-4 py-1 text-[10px] font-semibold text-emerald-700"
					>
						Completed
					</span>
				{:else}
					<span
						class="inline-flex items-center rounded-full bg-[#f8e8d2] px-4 py-1 text-[10px] font-semibold text-yellow-700 hover:bg-[#f8e8d2]"
					>
						Not completed
					</span>
				{/if}
			</div>
			<div class="flex gap-2">
				{#if adaptiveQuiz.isCompleted}
					<Button
						onclick={() =>
							goto(
								`/courses/course/${page.params.id}/block/${page.params.blockId}/adaptiveQuiz/${adaptiveQuiz.id}/summary`
							)}
						variant="outline"
						class="flex-1 cursor-pointer">Review quiz</Button
					>
				{:else}
					<Button
						onclick={() => goto(page.url.pathname + `/adaptiveQuiz/${adaptiveQuiz.id}`)}
						variant="outline"
						class="flex-1 cursor-pointer">Start quiz</Button
					>
				{/if}
			</div>
		</Card.Content>
	{/if}
</Card.Root>
