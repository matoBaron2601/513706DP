<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { getUserByEmail } from '$lib/utils';
	import { createQuery } from '@tanstack/svelte-query';
	import getUserBlock from '../_clientServices/getUserBlock';
	import { page } from '$app/state';
	import HistoryList from './_components/HistoryList.svelte';
	import getCourseById from '../../../../../../_clientServices/getCourseById';
	import getBlockById from '../../../../../../_clientServices/getBlockById';
	import { Button } from '$lib/components/ui/button'; // adjust path if needed

	const courseId = page.params.id ?? '';
	const blockId = page.params.blockId ?? '';
	const userEmail = page.data.session?.user?.email ?? '';

	const userBlockQuery = createQuery({
		queryKey: ['userBlock', blockId],
		queryFn: async () => {
			const { id: userId } = await getUserByEmail(userEmail);
			return await getUserBlock({ userId, blockId, completed: false });
		}
	});

	const courseQuery = createQuery({
		queryKey: ['course'],
		queryFn: async () => await getCourseById(courseId)
	});

	const blockQuery = createQuery({
		queryKey: ['block', blockId],
		queryFn: async () => {
			return await getBlockById(blockId);
		}
	});

	const blockName = $derived.by(() => $blockQuery.data?.name ?? '');
	const courseName = $derived.by(() => $courseQuery.data?.name ?? '');
</script>

<PageWrapper
	breadcrumbItems={[
		{ text: 'Courses', href: '/courses' },
		{ text: `Course: ${courseName}`, href: `/courses/course/${courseId}` },
		{ text: `Block: ${blockName}`, href: `/courses/course/${courseId}/block/${blockId}` },
		{ text: `History`, isCurrent: true }
	]}
	goBackUrl={`/courses/course/${courseId}/block/${blockId}`}
>
	{#if $userBlockQuery.data?.id}
		<HistoryList userBlockId={$userBlockQuery.data?.id} />
	{:else}
		<div class="mx-auto mt-10 max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
			<div class="mb-3 text-4xl select-none">📜</div>
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
	{/if}
</PageWrapper>
