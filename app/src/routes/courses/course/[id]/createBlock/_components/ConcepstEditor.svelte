<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type Concept = { name: string; difficultyIndex: number };

	// props (Svelte 5 runes ekvivalent):
	let {
		concepts,
		handleSetConceptsOk
	}: { concepts: Concept[]; handleSetConceptsOk: (ok: boolean) => void } = $props();

	// DISPATCHER S TYPOM EVENTOV
	const dispatch = createEventDispatcher<{
		update: { concepts: Concept[] };
	}>();

	let items = $state<Concept[]>(concepts ?? []);
	$effect(() => {
		items = Array.isArray(concepts) ? [...concepts] : [];
	});

	const emit = (next: Concept[]) => {
		const cleaned = next.map((c) => ({
			name: c.name.trim(),
			difficultyIndex: Number.isFinite(+c.difficultyIndex) ? +c.difficultyIndex : 0
		}));
		dispatch('update', { concepts: cleaned }); // ✅ typovo správne
	};

	const add = () => {
		items = [...items, { name: '', difficultyIndex: 0 }];
		emit(items);
	};
	const removeAt = (i: number) => {
		items = items.toSpliced(i, 1);
		emit(items);
	};
	const move = (i: number, dir: -1 | 1) => {
		const j = i + dir;
		if (j < 0 || j >= items.length) return;
		const copy = [...items];
		[copy[i], copy[j]] = [copy[j], copy[i]];
		items = copy;
		emit(items);
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
		items = copy;
		dragIndex = null;
		emit(items);
	};

	const updateName = (i: number, v: string) => {
		items = items.with(i, { ...items[i], name: v });
		emit(items);
	};
	const updateDiff = (i: number, v: string) => {
		const n = Math.max(0, Number(v) || 0);
		items = items.with(i, { ...items[i], difficultyIndex: n });
		emit(items);
	};
</script>

<div class="space-y-3">
	{#if items.length === 0}
		<p class="text-sm opacity-70">Zatiaľ žiadne koncepty.</p>
	{/if}

	{#each items as c, i}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="flex items-center gap-2 rounded border p-2"
			draggable="true"
			ondragstart={(e) => onDragStart(i, e)}
			ondragover={onDragOver}
			ondrop={(e) => onDrop(i, e)}
		>
			<span class="w-6 select-none text-xs opacity-60">{i + 1}</span>

			<input
				class="flex-1 rounded border px-2 py-1"
				placeholder="Názov"
				value={c.name}
				oninput={(e) => updateName(i, (e.target as HTMLInputElement).value)}
			/>

			<input
				class="w-28 rounded border px-2 py-1 text-right"
				type="number"
				min="0"
				step="1"
				value={c.difficultyIndex}
				oninput={(e) => updateDiff(i, (e.target as HTMLInputElement).value)}
				title="difficultyIndex"
			/>

			<div class="flex gap-1">
				<button class="rounded border px-2 py-1" onclick={() => move(i, -1)} disabled={i === 0}
					>↑</button
				>
				<button
					class="rounded border px-2 py-1"
					onclick={() => move(i, +1)}
					disabled={i === items.length - 1}>↓</button
				>
				<button class="rounded border px-2 py-1" onclick={() => removeAt(i)} aria-label="Delete"
					>✕</button
				>
			</div>
		</div>
	{/each}

	<div class="flex justify-between pt-2">
		<button class="rounded border px-3 py-1 cursor-pointer" onclick={add}>+ Pridať koncept</button>
		<button class="rounded border px-3 py-1 cursor-pointer" onclick={() => handleSetConceptsOk(true)}>Submit</button>
	</div>
</div>
