<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { getUserByEmail } from '$lib/utils';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import getBlockById from '../../../../../../_clientServices/getBlockById';
	import getCourseById from '../../../../../../_clientServices/getCourseById';
	import getUserBlock from '../_clientServices/getUserBlock';
	import { page } from '$app/state';
	import getDocumentsByBlockId from './_clientServices/getDocumentsByBlockId';
	import Spinner from '$lib/components/Spinner.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { type PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { uploadDocumentFormSchema } from './uploadDocumentFormSchema';
	import { Button } from '$lib/components/ui/button';
	import { Upload } from '@lucide/svelte';
	import uploadDocument from './_clientServices/uploadDocument';
	import queryClient from '../../../../../../queryClient';
	import { Trash } from '@lucide/svelte';
	import deleteDocument from './_clientServices/deleteDocument';

	let { data }: { data: PageData } = $props();

	const courseId = page.params.id ?? '';
	const blockId = page.params.blockId ?? '';
	const userEmail = page.data.session?.user?.email ?? '';

	const userBlockQuery = createQuery({
		queryKey: ['userBlock', blockId],
		queryFn: async () => {
			const { id: userId } = await getUserByEmail(userEmail);
			return await getUserBlock({ userId, blockId, completed: false });
		}
	});

	const courseQuery = createQuery({
		queryKey: ['course'],
		queryFn: async () => await getCourseById(courseId)
	});

	const blockQuery = createQuery({
		queryKey: ['block', blockId],
		queryFn: async () => {
			return await getBlockById(blockId);
		}
	});
	const blockName = $derived.by(() => $blockQuery.data?.name ?? '');
	const courseName = $derived.by(() => $courseQuery.data?.name ?? '');

	const documentsQuery = createQuery({
		queryKey: ['documents', blockId],
		queryFn: async () => {
			return await getDocumentsByBlockId(blockId);
		}
	});

	const uploadDocumentMutation = createMutation({
		mutationKey: ['uploadDocument'],
		mutationFn: async () => {
			await uploadDocument({
				blockId,
				document: $formData.file
			});
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['documents', blockId] });
			form.reset();
		}
	});

	const deleteDocumentMutation = createMutation({
		mutationKey: ['deleteDocument'],
		mutationFn: async (documentPath: string) => {
			await deleteDocument({ documentPath });
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['documents', blockId] });
		}
	});

	const form = superForm(data.uploadDocumentForm, {
		validators: zodClient(uploadDocumentFormSchema)
	});

	const { form: formData, enhance, validateForm } = form;

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

	const handleFormSubmit = async () => {
		const isValid = (await validateForm()).valid;
		if (isValid) {
			await $uploadDocumentMutation.mutateAsync();
		}
	};
</script>

<PageWrapper
	breadcrumbItems={[
		{ text: 'Courses', href: '/courses' },
		{ text: `Course: ${courseName}`, href: `/courses/course/${courseId}` },
		{ text: `Block: ${blockName}`, href: `/courses/course/${courseId}/block/${blockId}` },
		{ text: `Documents`, isCurrent: true }
	]}
>
	<h1 class="mb-4 text-2xl font-bold">Block Documents</h1>
	{#each $documentsQuery.data as document}
		<div class="my-2 rounded border p-4 flex justify-between items-center">
			<h2 class="text-xl font-semibold">{document.filePath}</h2>
			<Trash class="text-red-500 cursor-pointer" onclick={async() => await $deleteDocumentMutation.mutateAsync(document.filePath)} />
		</div>
	{/each}

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
					<Upload class="mr-2 inline-block h-4 w-4" />
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
		disabled={$uploadDocumentMutation.isPending || !$formData.file}
	>
		{#if $uploadDocumentMutation.isPending}
			<Spinner />
		{:else}
			Upload file
		{/if}
	</Button>
</PageWrapper>
