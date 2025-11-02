<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import { getUserByEmail } from '$lib/utils';
	import getUserBlock from './_clientServices/getUserBlock';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import AdaptiveQuizzesList from './_components/AdaptiveQuizzesList.svelte';
	import BlockConceptsList from './_components/BlockConceptsList.svelte';

	const blockId = page.params.blockId ?? '';
	const userEmail = page.data.session?.user?.email ?? '';

	const userBlockQuery = createQuery({
		queryKey: ['userBlock', blockId],
		queryFn: async () => {
			const { id: userId } = await getUserByEmail(userEmail);
			return await getUserBlock({ userId, blockId, completed: false });
		}
	});
</script>

<PageWrapper
	breadcrumbItems={[
		{ text: 'Courses', href: '/courses' },
		{ text: `React Hooks`, href: `/courses/course/${page.params.id}` },
		{ text: 'Block', isCurrent: true },
		{ text: blockId, isCurrent: true }
	]}
>
	{#if $userBlockQuery.data}
		<div class="mt-4 flex flex-col gap-8">
			<BlockConceptsList userBlockId={$userBlockQuery.data.id} />
			<AdaptiveQuizzesList userBlockId={$userBlockQuery.data.id} />
		</div>
	{/if}
</PageWrapper>
