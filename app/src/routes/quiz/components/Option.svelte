<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { QuestionType } from '../../../schemas/questionSchema';
	import type { OptionIcon } from '../[id]/types';
	import { CircleCheck } from '@lucide/svelte';

	let {
		optionIcon,
		questionText,
		onSelect,
		isSelected
	}: {
		optionIcon: OptionIcon;
		questionText: string;
		onSelect: (optionId: string) => void;
		isSelected: boolean;
	} = $props();
</script>

<Card.Root
	class={`h-16 w-full cursor-pointer p-0 ${isSelected ? 'outline-2 outline-green-500' : ''}`}
	onclick={() => onSelect(optionIcon)}
>
	<Card.Content class="m-0 flex h-full items-center p-1 pl-2">
		<div class="flex w-12 items-center justify-center rounded bg-gray-200 p-1">
			<span class="text-4xl font-bold text-gray-800">{optionIcon}</span>
		</div>
		<p class="ml-4 text-gray-700">
			{questionText}
		</p>
		{#if isSelected}
			<span class="ml-auto mr-4 text-green-500"><CircleCheck size={28} /> </span>
		{/if}
	</Card.Content>
</Card.Root>
