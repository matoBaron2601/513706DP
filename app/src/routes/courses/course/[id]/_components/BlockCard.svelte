<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Tally5Icon } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { BlockWithConcepts } from '../../../../../schemas/blockSchema';
	import { createQuery } from '@tanstack/svelte-query';
	import getUserBlocks from '../_clientServices.ts/getUserBlocks';
	import { getUserByEmail } from '$lib/utils';
	
	let { block }: { block: BlockWithConcepts } = $props();

	const userEmail = page.data.session?.user?.email ?? '';

	const userBlockQuery = createQuery({
		queryKey: ['userBlockStatus', block.id],
		queryFn: async () => {
			const { id: userId } = await getUserByEmail(userEmail);
			return await getUserBlocks(userId, block.id);
		}
	});
</script>

<Card.Root class="min-w-50 relative">
	<Card.Content class="flex flex-col gap-2">
		<Card.Title class="m-auto text-xl">{block.name}</Card.Title>
		<div class="flex items-center gap-2">
			<Tally5Icon size={16} />
			<p class="truncate">{`Concepts: ${block.concepts.length}`}</p>
		</div>
		<div class="flex items-center gap-2">
			<Tally5Icon size={16} />
			<p class="truncate">{`Status: ${$userBlockQuery.data?.completed ? 'Completed' : 'Not completed'}`}</p>
		</div>
		<div class="flex flex-col gap-2">
			<Button
				onclick={async () => {
					await goto(page.url.pathname + `/block/${block.id}`);
				}}
				variant="outline"
				class="flex-1 cursor-pointer"
			>
				Open
			</Button>
		</div>
	</Card.Content>
</Card.Root>
