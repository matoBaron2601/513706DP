<script lang="ts">
	import { createMutation } from '@tanstack/svelte-query';
	import { type PageData } from '../$types';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { identifyConceptsFormSchema } from '../formSchemas/identifyConceptsFormSchema';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Button } from '$lib/components/ui/button';
	import Spinner from '$lib/components/Spinner.svelte';
	import type { Step } from '../+page.svelte';
	import { Upload } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { identifyConcepts } from '../_clientServices.ts/identifyConcepts';

	/**
	 * @fileoverview
	 * This Svelte component provides an interface for uploading a .txt file to identify key concepts
	 * for a course block. It includes a form for file upload, handles form submission, and triggers
	 * a mutation to process the file using an AI service. Upon successful identification, it updates
	 * the parent component with the document path and identified concepts, and navigates to the next step.
	 */

	let {
		data,
		handleSetDocumentPath,
		handleSetConcepts,
		handleSetStep
	}: {
		data: PageData;
		handleSetDocumentPath: (path: string) => void;
		handleSetConcepts: (identifiedConcepts: { name: string; difficultyIndex: number }[]) => void;
		handleSetStep: (newStep: Step) => void;
	} = $props();

	const identifyConceptsMutation = createMutation({
		mutationKey: ['identifyConcepts'],
		mutationFn: async () => {
			const result = await identifyConcepts({
				document: $formData.file
			});
			handleSetDocumentPath(result.documentPath);
			handleSetConcepts(
				result.concepts.map((concept, index) => ({
					name: concept,
					difficultyIndex: index + 1
				}))
			);
			handleSetStep('editConcepts');
		},
		onError: () => {
			toast.error(`There was a problem with the AI service. 
			Try it again. If the problem persists, please try uploading a shorter document that does not exceed your plan's token limit.`);
		}
	});

	const form = superForm(data.identifyConceptsForm, {
		validators: zodClient(identifyConceptsFormSchema)
	});
	const { form: formData, enhance, validateForm } = form;

	const handleFormSubmit = async () => {
		const isValid = (await validateForm()).valid;
		if (isValid) {
			await $identifyConceptsMutation.mutateAsync();
		}
	};

	const handleFileUpload = async (event: Event) => {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			const file = input.files[0];
			if (file.type !== 'text/plain') {
				alert('Please upload a valid .txt file.');
				return;
			}
			formData.update((data) => ({ ...data, file }));
		}
	};
</script>

<form method="POST" enctype="multipart/form-data" use:enhance class="p-4">
	<Card.Title class="text-xl font-semibold text-gray-900">1. Upload file</Card.Title>
	<Card.Description class="mt-1 text-sm text-gray-500">
		Upload a .txt file containing the main content of the block you want to create. The system will
		analyze the content and identify key concepts for you to review and edit.
	</Card.Description>

	<Card.Card class="mx-auto mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
		<Card.Content class="flex flex-col gap-6 px-6 py-6">
			<Form.Field {form} name="file">
				<Form.Control>
					{#snippet children({ props })}
						<div class="space-y-2">
							<Form.Label>File</Form.Label>

							<input
								{...props}
								id="fileInput"
								type="file"
								accept=".txt"
								class="hidden"
								onchange={(event) => handleFileUpload(event)}
							/>

							<button
								type="button"
								class="flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-600 transition hover:bg-gray-100"
								onclick={() => document.getElementById('fileInput')?.click()}
							>
								<Upload class="mr-2 inline-block h-4 w-4" />
								<span>{$formData.file ? 'Change file' : 'Select .txt file'}</span>
							</button>

							{#if $formData.file}
								<p class="mt-1 text-xs text-gray-500">
									Selected: <span class="font-medium text-gray-700">{$formData.file.name}</span>
								</p>
							{/if}
						</div>
					{/snippet}
				</Form.Control>

				<p class="mt-1 text-xs text-gray-400">Upload block content as a single .txt file.</p>

				<Form.FieldErrors />
			</Form.Field>

			<Button
				type="button"
				onclick={handleFormSubmit}
				class="mx-auto w-full cursor-pointer lg:w-[50%]"
				disabled={$identifyConceptsMutation.isPending || !$formData.file}
			>
				{#if $identifyConceptsMutation.isPending}
					<Spinner />
				{:else}
					Upload file
				{/if}
			</Button>
		</Card.Content>
	</Card.Card>
</form>
