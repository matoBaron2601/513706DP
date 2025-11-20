<script lang="ts">
	import { createMutation } from '@tanstack/svelte-query';
	import { type PageData } from '../$types';
	import createBlock from '../_clientServices.ts/createBlock';
	import { page } from '$app/state';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createBlockFormSchema } from '../formSchemas/createBlockFormSchema';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import Spinner from '$lib/components/Spinner.svelte';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import type { Step } from '../+page.svelte';
	import createPlacementQuiz from '../_clientServices.ts/createPlacementQuiz';
	import { goto } from '$app/navigation';
	import { TriangleAlert } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	const courseId = page.params.id ?? '';
	const blockId = page.params.blockId ?? '';

	let {
		data,
		documentPath,
		concepts,
		handleSetStep,
		handleSetBlockId
	}: {
		data: PageData;
		documentPath: string;
		concepts: { name: string; difficultyIndex: number }[];
		handleSetStep: (newStep: Step) => void;
		handleSetBlockId: (id: string) => void;
	} = $props();

	const form = superForm(data.createBlockForm, {
		validators: zodClient(createBlockFormSchema)
	});
	const { form: formData, enhance, validateForm } = form;

	const createPlacementQuizMutation = createMutation({
		mutationKey: ['createPlacementQuiz'],
		mutationFn: async (blockId: string) => {
			await createPlacementQuiz({
				blockId: blockId
			});
		},

		onSuccess: () => {
			goto(`/courses/course/${page.params.id}`);
			toast.success('Block and placement quiz created successfully');
		}
	});

	const createBlockMutation = createMutation({
		mutationKey: ['createBlock'],
		mutationFn: async () => {
			const { id: blockId } = await createBlock({
				courseId,
				name: $formData.name,
				documentPath,
				concepts,
				chunkingStrategy: $formData.chunkingStrategy,
				useLLMTransformation: $formData.useLLMTransformation
			});
			return blockId;
		},
		onSuccess: async (blockId: string) => {
			await $createPlacementQuizMutation.mutateAsync(blockId);
		}
	});

	const handleFormSubmit = async () => {
		const isValid = (await validateForm()).valid;
		if (!isValid) {
			return;
		}
		await $createBlockMutation.mutateAsync();
	};
</script>

<form class="p-4" onsubmit={handleFormSubmit}>
	<Card.Title class="text-xl font-semibold text-gray-900">3. Create block</Card.Title>
	<Card.Description class="mt-1 text-sm text-gray-500">
		Configure the block settings before creating it.
	</Card.Description>

	<Card.Card class="mx-auto mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
		<Card.Content class="flex flex-col gap-6 px-6 py-6">
			<!-- Name -->
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<div class="space-y-2">
							<Form.Label>Name</Form.Label>
							<Input {...props} bind:value={$formData.name} class="w-full" />
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- Chunking strategy -->
			<Form.Field {form} name="chunkingStrategy">
				<Form.Control>
					{#snippet children({ props })}
						<div class="space-y-3">
							<Form.Label>Chunking strategy</Form.Label>

							<Tabs.Root value={$formData.chunkingStrategy} {...props} class="w-full">
								<Tabs.List class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs">
									<Tabs.Trigger
										class="cursor-pointer flex-1 rounded-md px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-500"
										onclick={() => ($formData.chunkingStrategy = 'rtc')}
										value="rtc"
									>
										Recursive
									</Tabs.Trigger>
									<Tabs.Trigger
										class="cursor-pointer flex-1 rounded-md px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-500"
										onclick={() => ($formData.chunkingStrategy = 'semantic')}
										value="semantic"
									>
										Semantic
									</Tabs.Trigger>
								</Tabs.List>

								<Form.Description class="mt-2 text-xs text-gray-500">
									{#if $formData.chunkingStrategy === 'rtc'}
										Splits text by structure (paragraphs, sentences, punctuation) to keep natural
										flow within size limits. Use Recursive when you want fast, reliable splits that
										preserve text boundaries.
									{:else if $formData.chunkingStrategy === 'semantic'}
										Splits text by meaning using embeddings to group similar ideas together. Use
										Semantic when you need chunks that follow topics and meaning closely.
									{/if}
								</Form.Description>
							</Tabs.Root>
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- LLM transformation -->
			<Form.Field {form} name="useLLMTransformation">
				<Form.Control>
					{#snippet children({ props })}
						<div class="space-y-2">
							<div class="flex items-center justify-between gap-3">
								<Form.Label>Use LLM transformation</Form.Label>
								<Switch
									class="cursor-pointer"
									bind:checked={$formData.useLLMTransformation}
									{...props}
								/>
							</div>

							<Form.Description class="text-xs text-gray-500">
								Enable this to let the system use a Language Model to preprocess and transform the
								content before chunking.
							</Form.Description>

							{#if $formData.useLLMTransformation}
								<div
									class="mt-1 flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2"
								>
									<TriangleAlert class="mt-[2px] h-4 w-4 text-yellow-500" />
									<Form.Description class="text-[11px] font-medium text-yellow-700">
										This may significantly increase processing time, but can lead to better chunk
										quality.
									</Form.Description>
								</div>
							{/if}
						</div>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- Actions -->
			<div class="mt-2 flex justify-between pt-2">
				<Button
					type="button"
					class="cursor-pointer text-sm"
					variant="outline"
					onclick={() => handleSetStep('editConcepts')}
				>
					Go back
				</Button>

				<Button
					type="submit"
					class="cursor-pointer text-sm flex items-center"
					disabled={$createBlockMutation.isPending || $createPlacementQuizMutation.isPending}
				>
					{#if $createBlockMutation.isPending || $createPlacementQuizMutation.isPending}
						<Spinner />
					{:else}
						Submit
					{/if}
				</Button>
			</div>
		</Card.Content>
	</Card.Card>
</form>
