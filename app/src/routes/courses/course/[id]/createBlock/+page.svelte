<script lang="ts">
	import type { PageData } from './$types.js';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import IdentifyConceptsForm from './_components/IdentifyConceptsForm.svelte';
	import CreateBlockForm from './_components/CreateBlockForm.svelte';
	import ConceptEditor from './_components/ConcepstEditor.svelte';

	let { data }: { data: PageData } = $props();

	export type Step = 'identifyConceptsForm' | 'editConcepts' | 'createBlock' | 'placementQuiz';
	let step = $state<Step>('identifyConceptsForm');

	let documentPath = $state('');
	let concepts = $state<{ name: string; difficultyIndex: number }[]>([]);

	const handleSetDocumentPath = (path: string) => {
		documentPath = path;
	};

	const handleSetConcepts = (identifiedConcepts: { name: string; difficultyIndex: number }[]) => {
		concepts = identifiedConcepts;
	};

	const handleSetStep = (newStep: Step) => {
		step = newStep;
	};
</script>

<PageWrapper>
	{#if step === 'identifyConceptsForm'}
		<IdentifyConceptsForm {data} {handleSetDocumentPath} {handleSetConcepts} {handleSetStep} />
	{:else if step === 'editConcepts'}
		<ConceptEditor
			{concepts}
			on:update={(e) => {
				concepts = e.detail.concepts;
			}}
			{handleSetStep}
		/>
	{:else if step === 'createBlock'}
		<CreateBlockForm {data} {documentPath} {concepts} {handleSetStep} />
	{:else if step === 'placementQuiz'}
		<p>Placement Quiz (to be implemented)</p>
	{/if}
</PageWrapper>
