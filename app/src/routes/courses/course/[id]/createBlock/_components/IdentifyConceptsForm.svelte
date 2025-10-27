<script lang="ts">
	import { createMutation } from '@tanstack/svelte-query';
	import identifyConcepts from '../_clientServices.ts/identifyConcepts';
	import { type PageData } from '../$types';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { identifyConceptsFormSchema } from '../formSchemas/identifyConceptsFormSchema';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import Spinner from '$lib/components/Spinner.svelte';
	let {
		data,
		handleSetDocumentPath,
		handleSetConcepts
	}: {
		data: PageData;
		handleSetDocumentPath: (path: string) => void;
		handleSetConcepts: (identifiedConcepts: { name: string; difficultyIndex: number }[]) => void;
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

<form method="POST" enctype="multipart/form-data" use:enhance class="mx-auto p-4 md:w-[50%]">
	<Card.Title class="text-xl">Create New Block</Card.Title>
	<Card.Card class="mx-auto mt-4">
		<Card.Content class="flex flex-col gap-6">
			<Form.Field {form} name="file">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>File</Form.Label>
						<input
							{...props}
							id="fileInput"
							type="file"
							accept=".txt"
							class="hidden w-full"
							onchange={(event) => handleFileUpload(event)}
						/>
						<Button
							type="button"
                            variant="outline"
							class="w-full cursor-pointer"
							onclick={() => document.getElementById('fileInput')?.click()}
						>
                        
							Select File
						</Button>
						{#if $formData.file}
							<p class="text-muted-foreground mt-2 text-sm">Selected: {$formData.file.name}</p>
						{/if}
					{/snippet}
				</Form.Control>
				<Form.Description>Upload block content as .txt file</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Button
				onclick={handleFormSubmit}
				class="mx-auto w-full cursor-pointer lg:w-[50%]"
				disabled={$identifyConceptsMutation.isPending}
			>
				{#if $identifyConceptsMutation.isPending}
					<Spinner />
				{:else}
					Submit
				{/if}
			</Button>
		</Card.Content>
	</Card.Card>
</form>
