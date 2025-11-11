<script lang="ts">
	import type { PageData } from './$types.js';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import IdentifyConceptsForm from './_components/IdentifyConceptsForm.svelte';
	import CreateBlockForm from './_components/CreateBlockForm.svelte';
	import ConceptEditor from './_components/ConcepstEditor.svelte';
	import { page } from '$app/state';

	let { data }: { data: PageData } = $props();

	export type Step = 'identifyConceptsForm' | 'editConcepts' | 'createBlock'
	let step = $state<Step>('identifyConceptsForm');

	let blockId = $state('');
	let documentPath = $state('');
	let concepts = $state<{ name: string; difficultyIndex: number }[]>([]);

	const setDocumentPath = (path: string) => {
		documentPath = path;
	};

	const setConcepts = (identifiedConcepts: { name: string; difficultyIndex: number }[]) => {
		concepts = identifiedConcepts;
	};

	const setStep = (newStep: Step) => {
		step = newStep;
	};

	const setBlockId = (id: string) => {
		blockId = id;
	};
</script>

<PageWrapper breadcrumbItems={[
		{ text: 'Courses', href: '/courses' },
		{ text: `Course: ${page.params.id}`, href: `/courses/course/${page.params.id}` },
		{ text: 'Create Block', isCurrent: true }
	]}>
	{#if step === 'identifyConceptsForm'}
		<IdentifyConceptsForm
			{data}
			handleSetDocumentPath={setDocumentPath}
			handleSetConcepts={setConcepts}
			handleSetStep={setStep}
		/>
	{:else if step === 'editConcepts'}
		<ConceptEditor
			{concepts}
			on:update={(e) => {
				concepts = e.detail.concepts;
			}}
			handleSetStep={setStep}
		/>
	{:else if step === 'createBlock'}
		<CreateBlockForm
			{data}
			{documentPath}
			{concepts}
			handleSetStep={setStep}
			handleSetBlockId={setBlockId}
		/>

	{/if}
</PageWrapper>
