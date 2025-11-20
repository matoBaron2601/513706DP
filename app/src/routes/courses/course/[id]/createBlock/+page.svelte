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

<PageWrapper
	breadcrumbItems={[
		{ text: 'Courses', href: '/courses' },
		{ text: `Course: ${page.params.id}`, href: `/courses/course/${page.params.id}` },
		{ text: 'Create Block', isCurrent: true }
	]}
	goBackUrl={`/courses/course/${page.params.id}`}
>
	<div class="mx-auto flex max-w-4xl flex-col gap-6">
		<!-- Header -->
		<header class="space-y-2">
			<h1 class="text-2xl font-semibold tracking-tight text-gray-900">
				Create block
			</h1>
			<p class="text-sm text-gray-500">
				Follow the steps to generate concepts from a document, refine them, and create a new block.
			</p>
		</header>

		<!-- Stepper -->
		<section class="rounded-2xl border border-gray-200 bg-white px-4 py-4 sm:px-6 sm:py-4">
			<ol class="flex flex-col gap-3 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between">
				<li class="flex items-center gap-2">
					<div
						class="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold
							{step === 'identifyConceptsForm'
								? 'bg-gray-900 text-white'
								: 'bg-gray-200 text-gray-700'}"
					>
						1
					</div>
					<div>
						<p class="font-medium text-gray-900">Upload file</p>
						<p class="hidden text-[11px] text-gray-500 sm:block">
							Upload document and detect concepts.
						</p>
					</div>
				</li>

				<li class="flex items-center gap-2">
					<div
						class="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold
							{step === 'editConcepts'
								? 'bg-gray-900 text-white'
								: 'bg-gray-200 text-gray-700'}"
					>
						2
					</div>
					<div>
						<p class="font-medium text-gray-900">Edit concepts</p>
						<p class="hidden text-[11px] text-gray-500 sm:block">
							Review and adjust the identified concepts.
						</p>
					</div>
				</li>

				<li class="flex items-center gap-2">
					<div
						class="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold
							{step === 'createBlock'
								? 'bg-gray-900 text-white'
								: 'bg-gray-200 text-gray-700'}"
					>
						3
					</div>
					<div>
						<p class="font-medium text-gray-900">Create block</p>
						<p class="hidden text-[11px] text-gray-500 sm:block">
							Confirm details and save the new block.
						</p>
					</div>
				</li>
			</ol>
		</section>

		<!-- Content card -->
		<section class="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-5 sm:px-6 sm:py-6">
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
		</section>
	</div>
</PageWrapper>

