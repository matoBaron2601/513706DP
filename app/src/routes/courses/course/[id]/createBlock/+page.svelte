<script lang="ts">
	import type { PageData } from './$types.js';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import IdentifyConceptsForm from './_components/IdentifyConceptsForm.svelte';
	import CreateBlockForm from './_components/CreateBlockForm.svelte';
	import ConceptEditor from './_components/ConcepstEditor.svelte';
	import { page } from '$app/state';
	import { createQuery } from '@tanstack/svelte-query';
	import { getCourseById } from '../../../../_clientServices/getCourseById.js';

	/**
	 * @fileoverview
	 * This Svelte component provides a user interface for creating a new block within a course. It includes
	 * a multi-step process: uploading a document to identify concepts, editing those concepts, and finally creating the block.
	 * The component manages state for the current step, document path, and identified concepts, and fetches course data for context.
	 * Route === '/courses/course/[id]/createBlock'
	 */

	let { data }: { data: PageData } = $props();

	export type Step = 'identifyConceptsForm' | 'editConcepts' | 'createBlock';
	let step = $state<Step>('identifyConceptsForm');

	let courseId = page.params.id;
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

	const courseQuery = createQuery({
		queryKey: ['course', courseId],
		queryFn: async () => await getCourseById(courseId)
	});
</script>

<PageWrapper
	breadcrumbItems={[
		{ text: 'Courses', href: '/courses' },
		{ text: `Course: ${$courseQuery.data?.name}`, href: `/courses/course/${page.params.id}` },
		{ text: 'Create Block', isCurrent: true }
	]}
	goBackUrl={`/courses/course/${page.params.id}`}
>
	<div class="mx-auto flex max-w-4xl flex-col gap-6">
		<header class="space-y-2">
			<h1 class="text-2xl font-semibold tracking-tight text-gray-900">Create block</h1>
			<p class="text-sm text-gray-500">
				Follow the steps to generate concepts from a document, refine them, and create a new block.
			</p>
		</header>

		<section class="rounded-2xl border border-gray-200 bg-white px-4 py-4 sm:px-6 sm:py-4">
			<ol
				class="flex flex-col gap-3 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between"
			>
				<li class="flex items-center gap-2">
					<div
						class="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold
							{step === 'identifyConceptsForm' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}"
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
							{step === 'editConcepts' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}"
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
							{step === 'createBlock' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'}"
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

		<section
			class="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6"
		>
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
				<CreateBlockForm {data} {documentPath} {concepts} handleSetStep={setStep} />
			{/if}
		</section>
	</div>
</PageWrapper>
