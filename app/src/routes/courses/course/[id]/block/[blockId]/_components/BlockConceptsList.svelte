<script lang="ts">
	import type { Concept } from '../../../../../schemas/conceptSchema';
	import BlockConceptCard from './BlockConceptCard.svelte';

	let { concepts }: { concepts: Concept[] } = $props();
</script>

<div class="flex gap-4">
	{#each concepts as concept}
		<BlockConceptCard {concept} />
	{/each}
</div>
