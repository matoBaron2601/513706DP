<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import type { Quiz } from '../../../../schemas/quizSchema';
	import { Clock, CircleArrowLeft, Tally5Icon, UserRoundPen, Trash, Mails } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import ConfirmDeleteQuizModal from './ConfirmDeleteQuizModal.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { createMutation } from '@tanstack/svelte-query';
	import Spinner from '$lib/components/Spinner.svelte';
	import deleteQuizById from '../clientServices/deleteQuizById';
	import queryClient from '../../../queryClient';
	import { goto } from '$app/navigation';

	let { quiz }: { quiz: Quiz } = $props();

	let deleteModalOpen = $state(false);

	const deleteQuizMutation = createMutation({
		mutationFn: async () => await deleteQuizById(quiz.quiz.id),
		onSuccess: async () => {
			deleteModalOpen = false;
			await queryClient.invalidateQueries({ queryKey: ['createdQuizzes'] });
		}
	});
</script>

<Card.Root class="relative w-80">
	<Card.Content class="flex flex-col gap-2">
		<Popover.Root bind:open={deleteModalOpen}>
			<Popover.Trigger>
				<Trash size={16} class="absolute left-4 top-4 cursor-pointer self-start text-red-500" />
			</Popover.Trigger>
			<Popover.Content class="w-80 border bg-gray-200">
				<h1 class="font-bold">Do you want to delete the quiz?</h1>
				<div class="flex gap-2">
					<Button
						onclick={() => (deleteModalOpen = false)}
						variant="outline"
						class="flex-1 cursor-pointer bg-white"
					>
						Cancel
					</Button>

					<Button
						onclick={async () => $deleteQuizMutation.mutateAsync()}
						variant="outline"
						class="flex-1 cursor-pointer bg-red-400"
					>
						{#if $deleteQuizMutation.isPending}
							<Spinner />
						{:else}
							Delete
						{/if}
					</Button>
				</div>
			</Popover.Content>
		</Popover.Root>

		<Mails size={16} class="absolute right-4 top-4 cursor-pointer" />
		<Card.Title class="m-auto text-xl">Quiz name</Card.Title>
		<div class="flex items-center gap-2">
			<Tally5Icon size={16} />
			<p>{'Number of questions:'}</p>
			<p>{quiz.questions.length}</p>
		</div>
		<div class="flex items-center gap-2">
			<UserRoundPen size={16} />
			<p>{'Options per question:'}</p>
			<p>{quiz.questions[0].options.length}</p>
		</div>
		<div class="flex items-center gap-2">
			<Clock size={16} />
			<p>{'Time per question:'}</p>
			<p>{quiz.quiz.timePerQuestion ?? 'Not limited'}</p>
		</div>
		<div class="flex items-center gap-2">
			<CircleArrowLeft size={16} />
			<p>{'Can go back:'}</p>
			<p>{quiz.quiz.canGoBack ? 'Yes' : 'No'}</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" class="flex-1 cursor-pointer bg-blue-200">Edit quiz</Button>
			<Button onclick={() => {goto(`/quiz/${quiz.quiz.id}`)}} variant="outline" class="flex-1 cursor-pointer bg-green-200">Start quiz</Button>
		</div>
	</Card.Content>
</Card.Root>
