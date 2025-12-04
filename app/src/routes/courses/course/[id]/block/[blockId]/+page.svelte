<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import { getUserByEmail } from '$lib/utils';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import AdaptiveQuizzesList from './_components/AdaptiveQuizzesList.svelte';
	import BlockConceptsList from './_components/BlockConceptsList.svelte';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { History, File } from '@lucide/svelte';
	import { getCourseById } from '../../../../../_clientServices/getCourseById';
	import { getBlockById } from '../../../../../_clientServices/getBlockById';
	import { getUserBlock } from './_clientServices/getUserBlock';

	/**
	 * @fileoverview
	 * This Svelte component provides a user interface for viewing and interacting with a specific block within a course.
	 * It fetches the block and course data, as well as the user's progress on the block. The component displays the block's concepts
	 * and adaptive quizzes based on the user's progress. It also includes navigation breadcrumbs and action buttons for viewing history and documents.
	 * Route === '/courses/course/[id]/block/[blockId]'
	*/

	const courseId = page.params.id ?? '';
	const blockId = page.params.blockId ?? '';
	const userEmail = page.data.session?.user?.email ?? '';

	const courseQuery = createQuery({
		queryKey: ['course'],
		queryFn: async () => await getCourseById(courseId)
	});

	const userBlockQuery = createQuery({
		queryKey: ['userBlock', blockId],
		queryFn: async () => {
			const { id: userId } = await getUserByEmail(userEmail);
			return await getUserBlock({ userId, blockId, completed: false });
		}
	});

	const blockQuery = createQuery({
		queryKey: ['block', blockId],
		queryFn: async () => {
			return await getBlockById(blockId);
		}
	});
</script>

{#snippet ExtraButton()}
	<Button
		class="cursor-pointer"
		onclick={() => goto(`/courses/course/${courseId}/block/${blockId}/history`)}
	>
		<History />History</Button
	>
	<Button
		class="cursor-pointer"
		onclick={() => goto(`/courses/course/${courseId}/block/${blockId}/documents`)}
		><File />Documents</Button
	>
{/snippet}

<PageWrapper
	breadcrumbItems={[
		{ text: 'Courses', href: '/courses' },
		{ text: `Course: ${$courseQuery.data?.name}`, href: `/courses/course/${page.params.id}` },
		{ text: `Block: ${$blockQuery.data?.name}`, isCurrent: true }
	]}
	goBackUrl={`/courses/course/${courseId}`}
	extraButton={ExtraButton}
>
	{#if $userBlockQuery.data}
		<div class="mx-auto mt-4 flex max-w-5xl flex-col gap-6">
			<section
				class="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
			>
				<div>
					<h1 class="text-lg font-semibold text-gray-900">
						{$blockQuery.data?.name}
					</h1>
					<p class="text-xs text-gray-500">Progress and quizzes for this block.</p>
				</div>

				{#if $userBlockQuery.data.completed}
					<span
						class="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700"
					>
						✔ Block completed
					</span>
				{:else}
					<span
						class="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-[11px] font-medium text-yellow-700"
					>
						In progress
					</span>
				{/if}
			</section>

			<BlockConceptsList userBlockId={$userBlockQuery.data.id} />

			{#if $userBlockQuery.data.completed}
				<div class="flex flex-col gap-2 text-sm text-gray-700">
					<p class="font-medium">You’ve completed this block 🎉</p>
					<p class="text-xs text-gray-500">
						You can revisit quizzes or review concepts if you want to reinforce your knowledge.
					</p>
				</div>
			{:else}
				<AdaptiveQuizzesList userBlockId={$userBlockQuery.data.id} />
			{/if}
		</div>
	{/if}
</PageWrapper>
