<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { onMount } from 'svelte';
	import type { ComplexConcept } from '../../../../../../../schemas/conceptSchema';
	import { CircleCheckBig } from '@lucide/svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';

	const { concept }: { concept: ComplexConcept } = $props();

	const completed = $derived.by(() => concept.conceptProgress.completed);
</script>

<Card.Root class="relative cursor-pointer p-0 hover:bg-[#f7e7d0] hover:shadow-2xl">
	<Popover.Root>
		<Popover.Trigger>
			<Card.Content class="flex cursor-pointer items-center justify-center px-2 py-1">
				<p>{concept.concept.name}</p>
				{#if completed}
					<CircleCheckBig class="absolute right-1 top-1 text-green-600" size={16} />
				{/if}
			</Card.Content></Popover.Trigger
		>
		<Popover.Content class="flex flex-col gap-2 bg-[#f7e7d0] p-4 text-sm shadow-2xl">
			<p class="flex justify-between font-bold">
				<span>Asked:</span>
				<span class="text-right font-mono">{concept.conceptProgress.asked}</span>
			</p>
			<p class="flex justify-between font-bold">
				<span>Correct:</span>
				<span class="text-right font-mono">{concept.conceptProgress.correct}</span>
			</p>
			<p class="flex justify-between font-bold">
				<span>Score:</span>
				<span class="text-right font-mono">{concept.conceptProgress.score}</span>
			</p>
			<p class="flex justify-between font-bold">
				<span>Variance:</span>
				<span class="text-right font-mono">{concept.conceptProgress.variance}</span>
			</p>
			<p class="flex justify-between font-bold">
				<span>Alfa:</span>
				<span class="text-right font-mono">{concept.conceptProgress.alfa}</span>
			</p>
			<p class="flex justify-between font-bold">
				<span>Beta:</span>
				<span class="text-right font-mono">{concept.conceptProgress.beta}</span>
			</p>
			<p class="flex justify-between font-bold">
				<span>Streak:</span>
				<span class="text-right font-mono">{concept.conceptProgress.streak}</span>
			</p>
			<p class="flex justify-between font-bold">
				<span>Completed:</span>
				<span class="text-right font-mono">{concept.conceptProgress.completed}</span>
			</p>
		</Popover.Content>
	</Popover.Root>
</Card.Root>
