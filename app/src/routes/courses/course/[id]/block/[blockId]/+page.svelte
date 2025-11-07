<script lang="ts">
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import { getUserByEmail } from '$lib/utils';
	import getUserBlock from './_clientServices/getUserBlock';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import AdaptiveQuizzesList from './_components/AdaptiveQuizzesList.svelte';
	import BlockConceptsList from './_components/BlockConceptsList.svelte';
	import { Button } from '$lib/components/ui/button';
	import queryClient from '../../../../../queryClient';
	import getCourseById from '../../_clientServices.ts/getCourseById';
	import getBlockByBlockId from './_clientServices/getBlockByBlockId';

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
			return await getBlockByBlockId(blockId);
		}
	});



</script>

<PageWrapper
	breadcrumbItems={[
		{ text: 'Courses', href: '/courses' },
		{ text: `Course: ${$courseQuery.data?.name}`, href: `/courses/course/${page.params.id}` },
		{ text: `Block: ${$blockQuery.data?.name}`, isCurrent: true }
	]}
>
	{#if $userBlockQuery.data}
		<div class="mt-4 flex flex-col">
			<BlockConceptsList userBlockId={$userBlockQuery.data.id} />
			<AdaptiveQuizzesList userBlockId={$userBlockQuery.data.id} />
		</div>
	{/if}
</PageWrapper>
