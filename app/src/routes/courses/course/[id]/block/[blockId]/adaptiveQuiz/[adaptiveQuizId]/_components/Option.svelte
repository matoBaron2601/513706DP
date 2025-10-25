<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';

	let {
		onOptionClick,
		optionText,
		optionIndex
	}: {
		onOptionClick: () => void;
		optionText: string;
		optionIndex: number;
	} = $props();

</script>

<Card.Root
	class={`h-16 w-full cursor-pointer p-0`}
	onclick={onOptionClick}
>
	<Card.Content class="m-0 flex h-full items-center p-1 pl-2">
		<div class="flex w-12 items-center justify-center rounded bg-gray-200 p-1">
			<span class="text-4xl font-bold text-gray-800"
				>{String.fromCharCode('A'.charCodeAt(0) + optionIndex)}</span
			>
		</div>
		<p class="ml-4 text-gray-700">
			{optionText}
		</p>
	</Card.Content>
</Card.Root>
