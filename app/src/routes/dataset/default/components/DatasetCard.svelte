<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	let { name, count }: { name: string; count: number } = $props();
</script>

<Card.Root class="mt-4 h-20 w-20">
	<Card.Content class="flex h-full flex-col items-center justify-center">
		<p class="mb-2 font-bold">{name}</p>
		<p class="text-sm text-gray-500">{count}</p>
	</Card.Content>
</Card.Root>
