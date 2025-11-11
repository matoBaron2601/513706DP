<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { onMount } from 'svelte';
	import type { ComplexConcept } from '../../../../../../../schemas/conceptSchema';
	import { CircleCheckBig } from '@lucide/svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';

	const { concept }: { concept: ComplexConcept } = $props();

	const completed = $derived.by(() => concept.conceptProgress.mastered);
	const asked = $derived.by(
		() =>
			concept.conceptProgress.askedA1 +
			concept.conceptProgress.askedA2 +
			concept.conceptProgress.askedB1 +
			concept.conceptProgress.askedB2
	);

	const correct = $derived.by(
		() =>
			concept.conceptProgress.correctA1 +
			concept.conceptProgress.correctA2 +
			concept.conceptProgress.correctB1 +
			concept.conceptProgress.correctB2
	);
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
				<span class="text-right font-mono">{asked}</span>
			</p>
			<p class="flex justify-between font-bold">
				<span>Correct:</span>
				<span class="text-right font-mono">{correct}</span>
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
				<span class="text-right font-mono">{concept.conceptProgress.mastered}</span>
			</p>
		</Popover.Content>
	</Popover.Root>
</Card.Root>
