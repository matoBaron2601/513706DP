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
	<Card.Title>3. Create block</Card.Title>
	<Card.Description class="mt-1">Configure the block settings before creating it.</Card.Description>
	<Card.Card class="mx-auto mt-4">
		<Card.Content class="flex flex-col gap-6">
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input {...props} bind:value={$formData.name} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="chunkingStrategy">
				<Form.Control>
					{#snippet children({ props })}
						<Tabs.Root value={$formData.chunkingStrategy} {...props} class="w-full">
							<Form.Label>Chunking strategy</Form.Label>
							<Tabs.List>
								<Tabs.Trigger
									class="cursor-pointer"
									onclick={() => ($formData.chunkingStrategy = 'rtc')}
									value="rtc">Recursive</Tabs.Trigger
								>
								<Tabs.Trigger
									class="cursor-pointer"
									onclick={() => ($formData.chunkingStrategy = 'semantic')}
									value="semantic">Semantic</Tabs.Trigger
								>
							</Tabs.List>
							<Form.Description class="w-full">
								{#if $formData.chunkingStrategy === 'rtc'}
									Splits text by structure (paragraphs, sentences, punctuation) to keep natural flow
									within size limits. Use Recursive when you want fast, reliable splits that keep
									natural text boundaries.
								{:else if $formData.chunkingStrategy === 'semantic'}
									Splits text by meaning using embeddings to group similar ideas together. Use
									Semantic when you need the chunks to reflect meaning or topic changes accurately.
								{/if}
							</Form.Description>
						</Tabs.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="useLLMTransformation">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Use LLM Transformation</Form.Label>
						<Switch class="cursor-pointer" bind:checked={$formData.useLLMTransformation} />
						<Form.Description>
							Enable this to have the system use a Language Model to preprocess and transform the
							content before chunking.
						</Form.Description>
						{#if $formData.useLLMTransformation}
							<div class="flex items-center gap-2 text-yellow-500">
								<TriangleAlert class="text-yellow-500" />
								<Form.Description class="font-bold text-yellow-500">
									This may dramatically increase the processing time, but can lead to better
									results.
								</Form.Description>
							</div>
						{/if}
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="flex justify-between pt-2">
				<Button
					class="cursor-pointer rounded border px-3 py-1"
					onclick={() => handleSetStep('editConcepts')}>Go back</Button
				>
				<Button
					type="submit"
					class="cursor-pointer"
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
