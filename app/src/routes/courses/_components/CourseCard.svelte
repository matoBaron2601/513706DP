<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Tally5Icon, Trash, Mails } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { goto } from '$app/navigation';
	import type { Course } from '../../../schemas/courseSchema';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import getCreatorById from '../_clientServices/getCreatorById';
	import Spinner from '$lib/components/Spinner.svelte';
	import deleteCourse from '../_clientServices/deleteCourse';
	import queryClient from '../../queryClient';

	let { course }: { course: Course } = $props();

	const creatorQuery = createQuery({
		queryKey: ['creator', course.creatorId],
		queryFn: async () => await getCreatorById(course.creatorId)
	});

	const deleteCourseMutation = createMutation({
		mutationKey: ['deleteCourse', course.id],
		mutationFn: async () => await deleteCourse(course.id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['courses'] });
		}
	});

	let deleteModalOpen = $state(false);
</script>

<Card.Root class="min-w-50 relative max-w-80">
	<Card.Content class="flex flex-col gap-2">
		<Popover.Root bind:open={deleteModalOpen}>
			<Popover.Trigger>
				<Trash size={16} class="absolute left-4 top-4 cursor-pointer self-start text-red-500" />
			</Popover.Trigger>
			<Popover.Content class="w-80 border bg-gray-200 ">
				<h1 class="font-bold">
					Progress of users will be lost and they will not be able to access blocks withing the
					course anymore
				</h1>
				<div class="flex gap-2">
					<Button
						onclick={() => (deleteModalOpen = false)}
						variant="outline"
						class="flex-1 cursor-pointer bg-white"
					>
						Cancel
					</Button>
					<Button
						onclick={async () => await $deleteCourseMutation.mutateAsync()}
						variant="outline"
						class="flex-1 cursor-pointer bg-red-400"
					>
						{#if $deleteCourseMutation.isPending}
							<Spinner />
						{:else}
							Delete
						{/if}
					</Button>
				</div>
			</Popover.Content>
		</Popover.Root>

		<Card.Title class="m-auto text-xl">{course.name}</Card.Title>
		<div class="flex items-center gap-2">
			<Tally5Icon size={16} />
			{#if $creatorQuery.isLoading}
				<Spinner />
			{:else}
				<p class="truncate">{`By: ${$creatorQuery.data?.name}`}</p>
			{/if}
		</div>
		<div class="flex gap-2">
			<Button
				onclick={() => {
					goto(`/courses/course/${course.id}`);
				}}
				variant="outline"
				class="flex-1 cursor-pointer bg-[#f8e8d2] hover:bg-[#f8e8d2] hover:shadow-md">Open course</Button
			>
		</div>
	</Card.Content>
</Card.Root>
