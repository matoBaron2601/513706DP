<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { getUserByEmail } from '$lib/utils';
	import { createQuery } from '@tanstack/svelte-query';
	import getBlockById from '../../../../../../_clientServices/getBlockById';
	import getCourseById from '../../../../../../_clientServices/getCourseById';
	import getUserBlock from '../_clientServices/getUserBlock';
	import { page } from '$app/state';
	import getDocumentsByBlockId from './_clientServices/getDocumentsByBlockId';

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

	const documentsQuery = createQuery({
		queryKey: ['documents', blockId],
		queryFn: async () => {
			return await getDocumentsByBlockId(blockId);
		}
	});
</script>

<PageWrapper
	breadcrumbItems={[
		{ text: 'Courses', href: '/courses' },
		{ text: `Course: ${courseName}`, href: `/courses/course/${courseId}` },
		{ text: `Block: ${blockName}`, href: `/courses/course/${courseId}/block/${blockId}` },
		{ text: `History`, isCurrent: true }
	]}
>
	<h1 class="mb-4 text-2xl font-bold">Block Documents</h1>
	{#each $documentsQuery.data as document}
		<div class="my-2 rounded border p-4">
			<h2 class="text-xl font-semibold">{document.filePath}</h2>
		</div>
	{/each}
</PageWrapper>
