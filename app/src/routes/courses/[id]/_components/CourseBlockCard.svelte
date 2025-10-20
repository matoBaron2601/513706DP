<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Tally5Icon, UserRoundPen, Trash, Mails } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { BlockWithConcepts, CourseBlock } from '../../../../schemas/blockSchema';
	import { createMutation } from '@tanstack/svelte-query';
	import createInitialComplexQuiz from '../_clientServices.ts/createInitialQuiz';
	import Spinner from '$lib/components/Spinner.svelte';
	import { goto } from '$app/navigation';

	let { courseBlock }: { courseBlock: BlockWithConcepts } = $props();

	const createInitialQuizMutation = createMutation({
		mutationKey: ['createInitialQuiz', courseBlock.id],
		mutationFn: async () => await createInitialComplexQuiz({ courseBlockId: courseBlock.id })
	});
</script>

<Card.Root class="min-w-50 relative">
	<Card.Content class="flex flex-col gap-2">
		<Card.Title class="m-auto text-xl">{courseBlock.name}</Card.Title>
		<div class="flex items-center gap-2">
			<Tally5Icon size={16} />
			<p class="truncate">{`Concepts: ${courseBlock.concepts.length}`}</p>
		</div>
		<div class="flex flex-col gap-2">
			<Button
				onclick={async (event) => {
					event.preventDefault();
					event.stopPropagation();
					await $createInitialQuizMutation.mutateAsync();
				}}
				disabled={$createInitialQuizMutation.isPending}
				variant="outline"
				class="flex-1 cursor-pointer bg-green-200"
			>
				{#if $createInitialQuizMutation.isPending}
					<Spinner />
				{:else}
					Create initial quiz
				{/if}
			</Button>
			<Button
				onclick={async (event) => {
					goto(`/courses/${courseBlock.courseId}/${courseBlock.id}/attend`);
				}}
				disabled={$createInitialQuizMutation.isPending}
				variant="outline"
				class="flex-1 cursor-pointer bg-green-200"
			>
				{#if $createInitialQuizMutation.isPending}
					<Spinner />
				{:else}
					Attend quiz
				{/if}
			</Button>
		</div>
	</Card.Content>
</Card.Root>
