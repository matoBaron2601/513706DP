<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Tally5Icon, UserRoundPen, Trash, Mails } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { CourseBlock } from '../../../../schemas/complexQuizSchemas/courseBlockSchema';
	import { createMutation } from '@tanstack/svelte-query';
	import createInitialComplexQuiz from '../_clientServices.ts/createInitialQuiz';
	import Spinner from '$lib/components/Spinner.svelte';
	import { goto } from '$app/navigation';

	let { courseBlock }: { courseBlock: CourseBlock } = $props();

	const createInitialQuizMutation = createMutation({
		mutationKey: ['createInitialQuiz', courseBlock.id],
		mutationFn: async () => await createInitialComplexQuiz({ courseBlockId: courseBlock.id })
	});
</script>

<Card.Root
	class="min-w-50 relative cursor-pointer"
	onclick={() => goto(`/courses/${courseBlock.courseId}/${courseBlock.id}`)}
>
	<Card.Content class="flex flex-col gap-2">
		<Card.Title class="m-auto text-xl">{courseBlock.name}</Card.Title>
		<div class="flex items-center gap-2">
			<Tally5Icon size={16} />
			<p class="truncate">{'Some info'}</p>
		</div>
		<div class="flex gap-2">
			<Button
				onclick={async (event) => {
					event.preventDefault();
					event.stopPropagation();
					await $createInitialQuizMutation.mutateAsync();
				}}
				variant="outline"
				class="flex-1 cursor-pointer bg-green-200"
			>
				{#if $createInitialQuizMutation.isPending}
					<Spinner />
				{:else}
					Create initial quiz
				{/if}
			</Button>
		</div>
	</Card.Content>
</Card.Root>
