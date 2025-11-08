<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { getUserByEmail } from '$lib/utils';
	import { createQuery } from '@tanstack/svelte-query';
	import getUserBlock from '../_clientServices/getUserBlock';
	import { page } from '$app/state';
	import HistoryList from './_components/HistoryList.svelte';
	import getCourseById from '../../../../../../_clientServices/getCourseById';
	import getBlockById from '../../../../../../_clientServices/getBlockById';

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
>
	{#if $userBlockQuery.data?.id}
		<HistoryList userBlockId={$userBlockQuery.data?.id} />
	{/if}
</PageWrapper>
