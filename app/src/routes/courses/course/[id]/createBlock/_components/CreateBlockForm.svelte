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
	import { goto } from '$app/navigation';
	import type { Step } from '../+page.svelte';

	const courseId = page.params.id ?? '';

	let {
		data,
		documentPath,
		concepts,
		handleSetStep
	}: {
		data: PageData;
		documentPath: string;
		concepts: { name: string; difficultyIndex: number }[];
		handleSetStep: (newStep: Step) => void;
	} = $props();

	const form = superForm(data.createBlockForm, {
		validators: zodClient(createBlockFormSchema)
	});
	const { form: formData, enhance, validateForm } = form;

	const createBlockMutation = createMutation({
		mutationKey: ['createBlock'],
		mutationFn: async () =>
			await createBlock({
				courseId,
				name: $formData.name,
				documentPath,
				concepts,
				chunkingStrategy: $formData.chunkingStrategy,
				retrievalMethod: $formData.retrievalMethod,
				useLLMTransformation: $formData.useLLMTransformation
			}),
		onSuccess: async () => {
			handleSetStep('placementQuiz');
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

<form method="POST" class="mx-auto p-4 md:w-[50%]" use:enhance onsubmit={handleFormSubmit}>
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
						<Tabs.Root value={$formData.chunkingStrategy} {...props} class="w-[400px]">
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
						</Tabs.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="retrievalMethod">
				<Form.Control>
					{#snippet children({ props })}
						<Tabs.Root value={$formData.retrievalMethod} {...props} class="w-[400px]">
							<Form.Label>Retrieval method</Form.Label>
							<Tabs.List>
								<Tabs.Trigger
									class="cursor-pointer"
									onclick={() => ($formData.retrievalMethod = 'sparse')}
									value="sparse">Sparse</Tabs.Trigger
								>
								<Tabs.Trigger
									class="cursor-pointer"
									onclick={() => ($formData.retrievalMethod = 'hybrid')}
									value="hybrid">Hybrid</Tabs.Trigger
								>
							</Tabs.List>
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
							This may dramatically increase the processing time, but can lead to better results.
						</Form.Description>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Button
				type="submit"
				class="mx-auto w-full cursor-pointer lg:w-[50%]"
				disabled={$createBlockMutation.isPending}
			>
				{#if $createBlockMutation.isPending}
					<Spinner />
				{:else}
					Submit
				{/if}
			</Button>
		</Card.Content>
	</Card.Card>
</form>
