<script lang="ts">
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { createMutation, createQuery } from '@tanstack/svelte-query';

	import { page } from '$app/state';
	import Spinner from '$lib/components/Spinner.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { type PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { uploadDocumentFormSchema } from './uploadDocumentFormSchema';
	import { Button } from '$lib/components/ui/button';
	import { Upload } from '@lucide/svelte';
	import queryClient from '../../../../../../queryClient';
	import { Trash } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { getDocumentsByBlockId } from './_clientServices/getDocumentsByBlockId';
	import { getBlockById } from '../../../../../../_clientServices/getBlockById';
	import { getCourseById } from '../../../../../../_clientServices/getCourseById';
	import { uploadDocument } from './_clientServices/uploadDocument';
	import { deleteDocument } from './_clientServices/deleteDocument';

	let { data }: { data: PageData } = $props();

	const courseId = page.params.id ?? '';
	const blockId = page.params.blockId ?? '';


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
			toast.success('Document uploaded successfully');
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
		},

		onError: () => {
			toast.error('Failed to delete document. Please try again.');
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
	goBackUrl={`/courses/course/${courseId}/block/${blockId}`}
>
	<div class="space-y-6">
		<header class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight text-gray-900">Block documents</h1>
			<p class="text-sm text-gray-500">
				Manage text documents attached to this block.
			</p>
		</header>

		<div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
			<section class="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-4 sm:px-5 sm:py-5 space-y-3">
				<div class="flex items-center justify-between">
					<h2 class="text-sm font-medium text-gray-900">Uploaded documents</h2>
					<p class="text-xs text-gray-400">
						{$documentsQuery.data?.length ?? 0} file(s)
					</p>
				</div>

				{#if $documentsQuery.data && $documentsQuery.data.length > 0}
					<div class="divide-y divide-gray-100">
						{#each $documentsQuery.data as document}
							<div class="flex items-center justify-between gap-3 py-3">
								<div class="min-w-0">
									<p class="truncate text-sm font-medium text-gray-900">
										{document.filePath}
									</p>
								</div>

								<button
									type="button"
									class="inline-flex items-center rounded-md p-2 text-xs font-medium text-red-500 hover:bg-red-50 transition"
									onclick={async () =>
										await $deleteDocumentMutation.mutateAsync(document.filePath)}
									aria-label="Delete document"
								>
									<Trash class="h-4 w-4 cursor-pointer" />
								</button>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-gray-500">
						No documents uploaded yet.
					</p>
				{/if}
			</section>

			<section class="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-5 sm:px-5 sm:py-6 space-y-4">
				<div class="space-y-1">
					<h2 class="text-sm font-medium text-gray-900">Upload new document</h2>
					<p class="text-xs text-gray-500">
						Upload a .txt file to add content to this block.
					</p>
				</div>

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
									class="flex w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-sm text-gray-600 hover:bg-gray-100 cursor-pointer transition"
									onclick={() => document.getElementById('fileInput')?.click()}
								>
									<Upload class="mr-2 h-4 w-4" />
									<span>
										{$formData.file ? 'Change file' : 'Select .txt file'}
									</span>
								</button>

								{#if $formData.file}
									<p class="mt-1 text-xs text-gray-500">
										Selected: <span class="font-medium text-gray-700">{$formData.file.name}</span>
									</p>
								{/if}
							</div>
						{/snippet}
					</Form.Control>

					<Form.FieldErrors />
				</Form.Field>

				<Button
					onclick={handleFormSubmit}
					class="mt-2 w-full cursor-pointer"
					disabled={$uploadDocumentMutation.isPending || !$formData.file}
				>
					{#if $uploadDocumentMutation.isPending}
						<Spinner />
					{:else}
						Upload file
					{/if}
				</Button>
			</section>
		</div>
	</div>
</PageWrapper>
