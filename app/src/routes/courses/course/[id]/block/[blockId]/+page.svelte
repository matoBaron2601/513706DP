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

	const blockId = page.params.blockId ?? '';
	const userEmail = page.data.session?.user?.email ?? '';

	const userBlockQuery = createQuery({
		queryKey: ['userBlock', blockId],
		queryFn: async () => {
			const { id: userId } = await getUserByEmail(userEmail);
			return await getUserBlock({ userId, blockId });
		}
	});
</script>

<PageWrapper>
	{#if $userBlockQuery.data}
		<div class="mt-4 flex flex-col gap-8">
			<BlockConceptsList userBlockId={$userBlockQuery.data.id} />
			<AdaptiveQuizzesList userBlockId={$userBlockQuery.data.id} />
		</div>
	{/if}
</PageWrapper>
