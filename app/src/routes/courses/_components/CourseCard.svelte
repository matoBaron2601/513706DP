<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Trash } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { goto } from '$app/navigation';
	import type { GetCoursesResponse } from '../../../schemas/courseSchema';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import getCreatorById from '../_clientServices/getCreatorById';
	import Spinner from '$lib/components/Spinner.svelte';
	import deleteCourse from '../_clientServices/deleteCourse';
	import queryClient from '../../queryClient';
	import { getUserFromPage } from '$lib/utils';
	import updateCourse from '../_clientServices/publishCourse';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { toast } from 'svelte-sonner';
	import unpublishCourse from '../_clientServices/unpublishCourse';
	let { course }: { course: GetCoursesResponse } = $props();
	const user = getUserFromPage();

	let published = $state(course.published);

	$effect(() => {
		published = course.published;
	});

	const creatorQuery = createQuery({
		queryKey: ['creator', course.creatorId],
		queryFn: async () => await getCreatorById(course.creatorId)
	});

	const deleteCourseMutation = createMutation({
		mutationKey: ['deleteCourse', course.id],
		mutationFn: async () => {
			return await deleteCourse(course.id);
		},
		onSuccess: async () => {
			toast.success('Course deleted successfully');
			await queryClient.invalidateQueries({ queryKey: ['courses'] });
		}
	});

	const updateCourseMutation = createMutation({
		mutationKey: ['updateCourse', course.id],
		mutationFn: async (nextPublished: boolean) => {
			if (nextPublished) {
				return await updateCourse(course.id);
			}
			return await unpublishCourse(course.id);
		},
		onSuccess: async () => {
			toast.success('Course updated successfully');
			await queryClient.invalidateQueries({ queryKey: ['courses'] });
		},
		onError: (error) => {
			published = !published;
			toast.error(error.message);
		}
	});

	const creatorName = $derived.by(() => {
		return $creatorQuery.data ? $creatorQuery.data.name : 'Unknown Creator';
	});

	const isCreator = $derived.by(() => {
		return $creatorQuery.data?.email === user?.email;
	});

	let deleteModalOpen = $state(false);

	async function handleSwitchChange(checked: boolean) {
		published = checked;
		await $updateCourseMutation.mutateAsync(checked);
	}
</script>

{#if isCreator || course.blocksCount != 0}
	<Card.Root class="relative">
		<Card.Content class="flex flex-col gap-2">
			{#if isCreator}
				<Switch
					checked={published}
					onCheckedChange={handleSwitchChange}
					class="absolute right-4 top-4 cursor-pointer bg-zinc-600 data-[state=checked]:bg-green-200 data-[state=unchecked]:bg-red-200"
				/>

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
			{/if}

			<Card.Title class="m-auto text-xl">{course.name}</Card.Title>
			<div class="flex items-center gap-2">
				{#if $creatorQuery.isLoading}
					<Spinner />
				{:else}
					<div class="space-y-0.5">
						<p class="truncate text-xs text-gray-500">
							<span class="font-medium text-gray-700">Created by:</span>
							{creatorName}
						</p>
						<p class="truncate text-xs text-gray-500">
							<span class="font-medium text-gray-700">Blocks:</span>
							{course.blocksCount}
						</p>
					</div>
				{/if}
			</div>
			<div class="flex gap-2">
				<Button
					onclick={() => {
						goto(`/courses/course/${course.id}`);
					}}
					variant="outline"
					class="flex-1 cursor-pointer bg-[#f8e8d2] hover:bg-[#f8e8d2] hover:shadow-md"
					>Open course</Button
				>
			</div>
		</Card.Content>
	</Card.Root>
{/if}
