<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import { createMutation } from '@tanstack/svelte-query';
	import type { UserDto } from '../../../../db/schema';
	import createCourseBlock from './_clientServices.ts/createCourseBlock';
	import { page } from '$app/state';
	import { userDataStore } from '$lib/stores/userDataStore';
	import type { PageData } from './$types.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createCourseBlockFormSchema } from './createCourseBlockSchema';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Spinner from '$lib/components/Spinner.svelte';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	let { data }: { data: PageData } = $props();

	const courseId = page.params.id ?? '';
	const userData = $userDataStore;

	const createCourseBlockMutation = createMutation({
		mutationKey: ['createCourseBlock'],
		mutationFn: async () => {
			await createCourseBlock({
				name: $formData.name,
				courseId: courseId,
				document: $formData.file
			});
			goto(`/courses/${courseId}`);
		}
	});

	const form = superForm(data.createCourseBlockForm, {
		validators: zodClient(createCourseBlockFormSchema)
	});
	const { form: formData, enhance, validateForm } = form;

	const handleFormSubmit = async () => {
		const isValid = (await validateForm()).valid;
		if (isValid) {
			await $createCourseBlockMutation.mutateAsync();
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

<PageWrapper>
	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance
		class="mx-auto p-4 md:w-[50%]"
	>
		<Card.Title class="text-xl">Create New Course Block</Card.Title>
		<Card.Card class="mx-auto mt-4">
			<Card.Content class="flex flex-col gap-6">
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input {...props} bind:value={$formData.name} />
						{/snippet}
					</Form.Control>
					<Form.Description>Specify course block name</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
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
					<Form.Description>Upload course block content as .txt file</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Button
					onclick={handleFormSubmit}
					class="mx-auto w-full cursor-pointer lg:w-[50%]"
					disabled={$createCourseBlockMutation.isPending}
				>
					{#if $createCourseBlockMutation.isPending}
						<Spinner />
					{:else}
						Create Course Block
					{/if}
				</Button>
			</Card.Content>
		</Card.Card>
	</form>
</PageWrapper>
