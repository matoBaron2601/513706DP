<script lang="ts">
	import type { PageData } from './$types.js';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import identifyConcepts from './_clientServices.ts/identifyConcepts';
	import IdentifyConceptsForm from './_components/IdentifyConceptsForm.svelte';
	import CreateBlockForm from './_components/CreateBlockForm.svelte';
	import ConceptEditor from './_components/ConcepstEditor.svelte';

	let { data }: { data: PageData } = $props();

	let documentPath = $state('');
	let concepts = $state<{ name: string; difficultyIndex: number }[]>([]);
	let conceptsOk = $state(false);

	const handleSetDocumentPath = (path: string) => {
		documentPath = path;
	};

	const handleSetConcepts = (identifiedConcepts: { name: string; difficultyIndex: number }[]) => {
		concepts = identifiedConcepts;
	};

	const handleSetConceptsOk = (ok: boolean) => {
		conceptsOk = ok;
	};
</script>

<PageWrapper>
	{#if !documentPath || concepts.length === 0}
		<IdentifyConceptsForm {data} {handleSetDocumentPath} {handleSetConcepts} />
	{:else if !conceptsOk}
		<ConceptEditor
			{concepts}
			on:update={(e) => {
				concepts = e.detail.concepts;
			}}
			{handleSetConceptsOk}
		/>
	{:else}
		<CreateBlockForm {data} {documentPath} {concepts} />
	{/if}
</PageWrapper>
