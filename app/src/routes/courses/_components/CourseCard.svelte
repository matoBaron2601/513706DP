<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Clock, CircleArrowLeft, Tally5Icon, UserRoundPen, Trash, Mails } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { createMutation } from '@tanstack/svelte-query';
	import Spinner from '$lib/components/Spinner.svelte';
	import { goto } from '$app/navigation';
	import type { Course } from '../../../schemas/courseSchema';

	let { course }: { course: Course } = $props();

	let deleteModalOpen = $state(false);
</script>

<Card.Root class="min-w-50 relative max-w-80">
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
						onclick={() => (deleteModalOpen = false)}
						variant="outline"
						class="flex-1 cursor-pointer bg-red-400">Delete</Button
					>
				</div>
			</Popover.Content>
		</Popover.Root>

		<Mails size={16} class="absolute right-4 top-4 cursor-pointer" />
		<Card.Title class="m-auto text-xl">{course.name}</Card.Title>
		<div class="flex items-center gap-2">
			<Tally5Icon size={16} />
			<p class='truncate'>{`Created by: ${course.creatorId}`}</p>
		</div>
		<div class="flex gap-2">
			<Button
				onclick={() => {
					goto(`/courses/${course.id}`);
				}}
				variant="outline"
				class="flex-1 cursor-pointer bg-green-200">Open course</Button
			>
		</div>
	</Card.Content>
</Card.Root>
