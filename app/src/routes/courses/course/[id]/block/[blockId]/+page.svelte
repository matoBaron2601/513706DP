<script lang="ts">
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import { getUserByEmail } from '$lib/utils';
	import getUserBlock from './_clientServices/getUserBlock';
	import getAdaptiveQuizzesByBlockId from './_clientServices/getAdaptiveQuizzesByUserBlockId';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import getBlockConcepts from './_clientServices/getConceptProgressByUserBlockId';
	import AdaptiveQuizzesList from './_components/AdaptiveQuizzesList.svelte';
	import BlockConceptsList from './_components/BlockConceptsList.svelte';
	import { Button } from '$lib/components/ui/button';

	const blockId = page.params.blockId ?? '';
	const userEmail = page.data.session?.user?.email ?? '';

	const userBlockQuery = createQuery({
		queryKey: ['userBlock', blockId],
		queryFn: async () => {
			const { id: userId } = await getUserByEmail(userEmail);
			return await getUserBlock({ userId, blockId });
		}
	});

	const testMutation = createMutation({
		mutationKey: ['adaptiveQuizzes', blockId],
		mutationFn: async () => {
			await fetch(`/api/adaptiveQuiz/generate/${$userBlockQuery.data.id}`, {
				method: 'POST'
			});
		}
	});
	
</script>

<PageWrapper>
	{#if $userBlockQuery.isLoading}
		<Spinner />
	{:else if $userBlockQuery.data}
		<div class="flex flex-col gap-8 mt-4">
			<BlockConceptsList userBlockId={$userBlockQuery.data.id} />
			<hr/>
			<AdaptiveQuizzesList userBlockId={$userBlockQuery.data.id} />
		</div>
	{/if}

	<Button class="mt-40"
		onclick={async () => await $testMutation.mutateAsync()}
	>
		Generate Adaptive Quiz
	</Button>
</PageWrapper>
