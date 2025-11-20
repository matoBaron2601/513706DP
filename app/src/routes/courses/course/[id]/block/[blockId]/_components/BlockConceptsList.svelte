<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import BlockConceptCard from './BlockConceptCard.svelte';
	import getConceptProgressByUserBlockId from '../_clientServices/getConceptProgressByUserBlockId';
	import { page } from '$app/state';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';

	const blockId = page.params.blockId ?? '';
	const courseId = page.params.id ?? '';

	let { userBlockId }: { userBlockId: string } = $props();

	const getBlockConceptsQuery = createQuery({
		queryKey: ['blockConcepts', userBlockId],
		queryFn: async () => await getConceptProgressByUserBlockId({ userBlockId })
	});
</script>

{#if $getBlockConceptsQuery.data?.length !== 0}
	<Card.Title class="text-2xl">Concept progress:</Card.Title>
	<div class=" grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
		{#each $getBlockConceptsQuery.data as concept}
			<div class="w-full">
				<BlockConceptCard {concept} />
			</div>
		{/each}
	</div>
{/if}
