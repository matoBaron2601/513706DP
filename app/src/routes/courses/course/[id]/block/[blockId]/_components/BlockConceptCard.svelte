<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { onMount } from 'svelte';
	import type { ComplexConcept } from '../../../../../../../schemas/conceptSchema';
	import { CircleCheckBig } from '@lucide/svelte';
	const { concept }: { concept: ComplexConcept } = $props();
	const completed = concept.conceptProgress.completed;

	onMount(() => {
		console.log('concept in BlockConceptCard:', concept);
	});

	const totalCorrectCount = concept.conceptProgressRecords.reduce(
		(acc, record) => acc + record.correctCount,
		0
	);
	const totalCount = concept.conceptProgressRecords.reduce((acc, record) => acc + record.count, 0);
</script>

<Card.Root class={`relative`}>
	<Card.Content class="flex flex-col items-center justify-center">
		<p>{concept.concept.name}</p>
		{#if !completed}
			<div class="flex items-center gap-2">
				<p>{totalCorrectCount}/{totalCount}</p>
			</div>
		{/if}
		{#if completed}
			<CircleCheckBig class="absolute right-1 top-2 text-green-600" size={16} />
		{/if}
	</Card.Content>
</Card.Root>
