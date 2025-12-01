<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';

	let {
		onOptionClick,
		optionText,
		optionIndex,
		reviewCorrect = false,
		reviewSelected = false
	}: {
		onOptionClick?: () => void;
		optionText: string;
		optionIndex: number;
		reviewCorrect?: boolean;
		reviewSelected?: boolean;
	} = $props();
</script>

<Card.Root
	class={`h-16 w-full cursor-pointer p-0 ${reviewSelected ? 'bg-red-200' : ''} ${reviewCorrect ? 'bg-green-200' : ''} `}
	onclick={onOptionClick}
>
	<Card.Content class="m-0 flex h-full items-center p-1 pl-2">
		<div class="flex min-w-12 items-center justify-center rounded bg-[#f8e8d2] p-1">
			<span class="text-4xl font-bold text-gray-800"
				>{String.fromCharCode('A'.charCodeAt(0) + optionIndex)}</span
			>
		</div>
		<p class="ml-4 text-gray-700">
			{optionText}
		</p>
	</Card.Content>
</Card.Root>
