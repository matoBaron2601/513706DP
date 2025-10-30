<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import { page } from '$app/state';
	import type { AdaptiveQuiz } from '../../../../../../../schemas/adaptiveQuizSchema';
	import { Tally5Icon } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import Spinner from '$lib/components/Spinner.svelte';

	const { adaptiveQuiz }: { adaptiveQuiz: AdaptiveQuiz } = $props();

	const quizLabel =
		adaptiveQuiz.version === 0 ? 'Placement Quiz' : `Adaptive Quiz v${adaptiveQuiz.version}`;
</script>

<Card.Root class="min-w-50 relative max-w-80">
	{#if !adaptiveQuiz.readyForAnswering}
		<Spinner />
	{:else}
		<Card.Content class="flex flex-col gap-2">
			<Card.Title class="m-auto text-xl">{quizLabel}</Card.Title>
			<div class="flex items-center gap-2">
				<Tally5Icon size={16} />

				<p class="truncate">
					{`Status: ${adaptiveQuiz.isCompleted ? 'Completed' : 'Not completed'}`}
				</p>
			</div>
			<div class="flex gap-2">
				{#if adaptiveQuiz.isCompleted}
					<Button
						onclick={() => goto(page.url.pathname + `/adaptiveQuiz/${adaptiveQuiz.id}`)}
						variant="outline"
						class="flex-1 cursor-pointer bg-green-200">Review quiz</Button
					>
				{:else}
					<Button
						onclick={() => goto(page.url.pathname + `/adaptiveQuiz/${adaptiveQuiz.id}`)}
						variant="outline"
						class="flex-1 cursor-pointer bg-green-200">Start quiz</Button
					>
				{/if}
			</div>
		</Card.Content>
	{/if}
</Card.Root>
