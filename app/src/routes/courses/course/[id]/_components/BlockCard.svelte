<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Tally5Icon } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { page } from '$app/state';

	import { goto } from '$app/navigation';
	import type { BlockWithConcepts } from '../../../../../schemas/blockSchema';

	let { block }: { block: BlockWithConcepts } = $props();
</script>

<Card.Root class="min-w-50 relative">
	<Card.Content class="flex flex-col gap-2">
		<Card.Title class="m-auto text-xl">{block.name}</Card.Title>
		<div class="flex items-center gap-2">
			<Tally5Icon size={16} />
			<p class="truncate">{`Concepts: ${block.concepts.length}`}</p>
		</div>
		<div class="flex flex-col gap-2">
			<Button
				onclick={async () => {
					await goto(page.url.pathname + `/block/${block.id}`);
				}}
				variant="outline"
				class="flex-1 cursor-pointer bg-green-200"
			>
				Open
			</Button>
		</div>
	</Card.Content>
</Card.Root>
