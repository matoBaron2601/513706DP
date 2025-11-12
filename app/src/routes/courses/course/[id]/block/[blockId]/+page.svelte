<script lang="ts">
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import { getUserByEmail } from '$lib/utils';
	import getUserBlock from './_clientServices/getUserBlock';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import AdaptiveQuizzesList from './_components/AdaptiveQuizzesList.svelte';
	import BlockConceptsList from './_components/BlockConceptsList.svelte';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import getCourseById from '../../../../../_clientServices/getCourseById';
	import getBlockById from '../../../../../_clientServices/getBlockById';
	import { History, File } from '@lucide/svelte';

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
		onclick={() => goto(`/courses/course/${courseId}/block/${blockId}/documents`)}><File />Documents</Button
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
		<div class="mt-4 flex flex-col">
			<BlockConceptsList userBlockId={$userBlockQuery.data.id} />
			{#if $userBlockQuery.data.completed}
				<p>COMPLETED</p>
			{:else}
				<AdaptiveQuizzesList userBlockId={$userBlockQuery.data.id} />
			{/if}
		</div>
	{/if}
</PageWrapper>
