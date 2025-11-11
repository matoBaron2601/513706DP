<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Step } from '../+page.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	type Concept = { name: string; difficultyIndex: number };

	let { concepts, handleSetStep }: { concepts: Concept[]; handleSetStep: (newStep: Step) => void } =
		$props();

	const dispatch = createEventDispatcher<{
		update: { concepts: Concept[] };
	}>();

	let items = $state<Concept[]>([]);

	const renumber = (arr: Concept[]) => arr.map((c, i) => ({ ...c, difficultyIndex: i + 1 }));

	const emit = (next: Concept[]) => {
		const cleaned = renumber(next);
		items = cleaned;
		dispatch('update', { concepts: cleaned });
	};

	$effect(() => {
		items = renumber(Array.isArray(concepts) ? [...concepts] : []);
	});

	const add = () => {
		emit([...items, { name: '', difficultyIndex: 0 }]);
	};

	const removeAt = (i: number) => {
		if(items.length < 2) return;
		const copy = [...items];
		copy.splice(i, 1);
		emit(copy);
	};

	const move = (i: number, dir: -1 | 1) => {
		const j = i + dir;
		if (j < 0 || j >= items.length) return;
		const copy = [...items];
		[copy[i], copy[j]] = [copy[j], copy[i]];
		emit(copy);
	};

	let dragIndex: number | null = null;
	const onDragStart = (i: number, ev: DragEvent) => {
		dragIndex = i;
		ev.dataTransfer?.setData('text/plain', String(i));
	};
	const onDragOver = (ev: DragEvent) => ev.preventDefault();
	const onDrop = (i: number, ev: DragEvent) => {
		ev.preventDefault();
		const from = dragIndex ?? Number(ev.dataTransfer?.getData('text/plain'));
		if (!Number.isInteger(from) || from === i) return;
		const copy = [...items];
		const [moved] = copy.splice(from, 1);
		copy.splice(i, 0, moved);
		dragIndex = null;
		emit(copy);
	};

	const updateName = (i: number, v: string) => {
		const copy = [...items];
		copy[i] = { ...copy[i], name: v };
		emit(copy);
	};

	const finalize = () => {
		const cleaned = items.map((c, i) => ({
			name: c.name.trim().replace(/\s{2,}/g, ' '),
			difficultyIndex: i + 1
		}));
		items = cleaned;
		dispatch('update', { concepts: cleaned });
		handleSetStep('createBlock');
	};
</script>

<div class="p-4">
	<Card.Title>2. Specify concepts</Card.Title>
	<Card.Description class="mt-1">
		You can modify the identified concepts below. You can change their names, reorder them by
		drag-and-drop or using the arrows, and remove any unnecessary concepts. You can also add new
		concepts if needed. For best results, ensure that each concept has a clear and distinct name.
	</Card.Description>
	<Card.Card class="mx-auto mt-4">
		<Card.Content>
			<div class="space-y-3">
				{#if items.length === 0}
					<p class="text-sm opacity-70">No concepts yet.</p>
				{/if}

				{#each items as c, i}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="flex cursor-pointer items-center gap-2 rounded"
						draggable="true"
						ondragstart={(e) => onDragStart(i, e)}
						ondragover={onDragOver}
						ondrop={(e) => onDrop(i, e)}
					>
						<span class="w-6 select-none text-xs opacity-60">{i + 1}.</span>
						<Input
							class=" w-60 rounded border px-2 py-1"
							placeholder="Concept name"
							value={c.name}
							oninput={(e) => updateName(i, (e.target as HTMLInputElement).value)}
						/>
						<span class="w-28 text-right text-sm tabular-nums" title="difficultyIndex">
							{c.difficultyIndex}
						</span>

						<div class="flex gap-1">
							<button
								class="cursor-pointer rounded border px-2 py-1"
								onclick={() => move(i, -1)}
								disabled={i === 0}>↑</button
							>
							<button
								class="cursor-pointer rounded border px-2 py-1"
								onclick={() => move(i, +1)}
								disabled={i === items.length - 1}>↓</button
							>
							<button
								class="cursor-pointer rounded border px-2 py-1"
								onclick={() => removeAt(i)}
								aria-label="Delete">✕</button
							>
						</div>
					</div>
				{/each}
				<Button class="cursor-pointer rounded border px-3 py-1" variant="outline" onclick={add}
					>+ Add concept</Button
				>
				<div class="flex justify-between pt-2">
					<Button
						class="cursor-pointer rounded border px-3 py-1"
						onclick={() => handleSetStep('identifyConceptsForm')}>Go back</Button
					>

					<Button class="cursor-pointer rounded border px-3 py-1" onclick={finalize}>
						Submit concepts
					</Button>
				</div>
			</div>
		</Card.Content>
	</Card.Card>
</div>
