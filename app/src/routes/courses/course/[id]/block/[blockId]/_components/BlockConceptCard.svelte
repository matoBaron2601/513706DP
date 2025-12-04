<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import type { ComplexConcept } from '../../../../../../../schemas/conceptSchema';
	import { CircleCheckBig } from '@lucide/svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import beta from '@stdlib/stats-base-dists-beta';

	/**
	 * @fileoverview
	 * This Svelte component represents a card for a concept within a course block. It displays the concept's name
	 * and provides detailed statistics about the user's progress with the concept via a popover. The card visually indicates
	 * whether the concept has been mastered and if it meets certain learning criteria.	
	 */

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

	const ciWidth = $derived.by(() => {
		const alfaValue = concept.conceptProgress.alfa ?? 0;
		const betaValue = concept.conceptProgress.beta ?? 0;

		if (alfaValue <= 0 || betaValue <= 0) {
			return 0;
		}

		const upper = beta.quantile(0.975, alfaValue, betaValue);
		const lower = beta.quantile(0.025, alfaValue, betaValue);

		return upper - lower;
	});

	const streakOk = $derived.by(() => concept.conceptProgress.streak > 3);
	const scoreOk = $derived.by(() => concept.conceptProgress.score > 0.8);
	const askedOk = $derived.by(() => asked > 5);
	const ciOk = $derived.by(() => ciWidth < 0.15 && asked > 0);

	const meetsAll = $derived.by(() => streakOk && scoreOk && askedOk && ciOk);
</script>

<Card.Root
	class={`relative cursor-pointer p-0 hover:bg-[#f7e7d0] hover:shadow-2xl
		${meetsAll ? 'border-2 border-green-500 bg-green-50' : ''}
	`}
>
	<Popover.Root>
		<Popover.Trigger>
			<Card.Content class="flex cursor-pointer items-center justify-center px-2 py-1">
				<p class={meetsAll ? 'font-semibold text-green-800' : ''}>
					{concept.concept.name}
				</p>

				{#if completed}
					<CircleCheckBig class="absolute right-1 top-1 text-green-600" size={16} />
				{/if}

				{#if meetsAll}
					<CircleCheckBig class="absolute left-1 top-1 text-green-600" size={14} />
				{/if}
			</Card.Content>
		</Popover.Trigger>

		<Popover.Content class="flex flex-col gap-2 bg-[#f7e7d0] p-4 text-sm shadow-2xl">
			<p class="flex justify-between">
				<span>Correct:</span>
				<span class="text-right font-mono">{correct}</span>
			</p>

			<p class="flex justify-between">
				<span>Variance:</span>
				<span class="text-right font-mono">{concept.conceptProgress.variance}</span>
			</p>

			<p class="flex justify-between">
				<span>Alfa:</span>
				<span class="text-right font-mono">{concept.conceptProgress.alfa}</span>
			</p>

			<p class="flex justify-between">
				<span>Beta:</span>
				<span class="text-right font-mono">{concept.conceptProgress.beta}</span>
			</p>

			<hr class="border border-black" />

			<p class="flex justify-between font-bold">
				<span>Score:</span>
				<span class={`text-right font-mono ${scoreOk ? 'text-green-700' : 'text-red-700'}`}>
					{`${concept.conceptProgress.score.toFixed(2)} >= 0.80`}
				</span>
			</p>

			<p class="flex justify-between font-bold">
				<span>Streak:</span>
				<span class={`text-right font-mono ${streakOk ? 'text-green-700' : 'text-red-700'}`}>
					{`${concept.conceptProgress.streak} >= 3`}
				</span>
			</p>

			<p class="flex justify-between font-bold">
				<span>Asked:</span>
				<span class={`text-right font-mono ${askedOk ? 'text-green-700' : 'text-red-700'}`}>
					{`${asked} >= 5`}
				</span>
			</p>

			<p class="flex justify-between font-bold">
				<span>BetaCI (width):</span>
				<span
					class={`text-right font-mono ${ciOk  ? 'text-green-700' : 'text-red-700'}`}
				>
					{`${ciWidth.toFixed(2)} <= 0.15`}
				</span>
			</p>

			<hr class="border border-black" />

			<p class="flex justify-between font-bold">
				<span>Completed:</span>
				<span class="text-right font-mono">
					{concept.conceptProgress.mastered}
				</span>
			</p>
		</Popover.Content>
	</Popover.Root>
</Card.Root>
