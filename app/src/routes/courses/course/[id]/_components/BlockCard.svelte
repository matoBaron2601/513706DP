<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
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

	const completed = $derived.by(() => $userBlockQuery.data?.completed ?? false);
</script>

<Card.Root class="relative">
	<Card.Content class="flex flex-col gap-2">
		<Card.Title class="m-auto text-xl">{block.name}</Card.Title>
		<div class="mx-auto">
			{#if completed}
				<span
					class="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-200 px-4 py-1 text-[10px] font-semibold text-emerald-700"
				>
					Completed
				</span>
			{:else}
				<span
					class="inline-flex items-center rounded-full bg-[#f8e8d2] px-4 py-1 text-[10px] font-semibold text-yellow-700 hover:bg-[#f8e8d2]"
				>
					Not completed
				</span>
			{/if}
		</div>
		<p class="text-center text-xs text-gray-500">
			{block.concepts.length} concepts
		</p>
		<div class="flex flex-col gap-2">
			{#if completed}
				<Button
					onclick={async () => {
						await goto(page.url.pathname + `/block/${block.id}/history`);
					}}
					variant="outline"
					class="flex-1 cursor-pointer"
				>
					Go to history
				</Button>
			{:else}
				<Button
					onclick={async () => {
						await goto(page.url.pathname + `/block/${block.id}`);
					}}
					variant="outline"
					class="flex-1 cursor-pointer"
				>
					Open
				</Button>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
