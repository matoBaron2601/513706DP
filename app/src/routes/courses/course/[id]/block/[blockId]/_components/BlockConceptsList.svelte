<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import BlockConceptCard from './BlockConceptCard.svelte';
	import getConceptProgressByUserBlockId from '../_clientServices/getConceptProgressByUserBlockId';
	import { page } from '$app/state';

	const blockId = page.params.blockId ?? '';

	let { userBlockId }: { userBlockId: string } = $props();

	const getBlockConceptsQuery = createQuery({
		queryKey: ['blockConcepts', userBlockId],
		queryFn: async () => await getConceptProgressByUserBlockId({ userBlockId })
	});
</script>

<div class="flex w-full gap-4">
	{#each $getBlockConceptsQuery.data as concept}
		<BlockConceptCard {concept} />
	{/each}
</div>
