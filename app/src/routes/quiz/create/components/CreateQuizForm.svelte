<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createQuizFormSchema, type CreateQuizFormSchema } from '../createQuizFormSchema';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Dataset } from '../../../types';
	import * as Select from '$lib/components/ui/select/index.js';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import createComplexQuiz from '../clienServices/createComplexQuiz';
	import { goto } from '$app/navigation';
	import { getUniqueDatasets } from '../../../clientServices/getUniqueDatasets';
	import Spinner from '$lib/components/Spinner.svelte';
	import { page } from '$app/state';
	let { data }: { data: { createQuizForm: SuperValidated<Infer<CreateQuizFormSchema>> } } =
		$props();

	const form = superForm(data.createQuizForm, {
		validators: zodClient(createQuizFormSchema)
	});

	const { form: formData, enhance } = form;
	const createComplexQuizMutation = createMutation({
		mutationFn: () =>
			createComplexQuiz($formData.prompt, $formData.technologies, page.data.session?.user?.email ?? '')
	});

	const fetchDatasets = (datasetType: Dataset) =>
		createQuery({
			queryKey: ['unique-datasets', datasetType],
			queryFn: () => getUniqueDatasets(datasetType)
		});

	const handleSubmit = async () => {
		const quiz = await $createComplexQuizMutation.mutateAsync();
		if (quiz) {
			goto(`/quiz/created`);
		}
	};

	let datasets = $derived.by(() => fetchDatasets($formData.activeTab));
</script>

<form method="POST" use:enhance class="p-4" onsubmit={handleSubmit}>
	<Card.Card class="mx-auto max-w-2xl">
		<Card.Content class="flex flex-col gap-6">
			<Card.Title class="text-xl">Create Quiz</Card.Title>

			<Form.Field {form} name="activeTab" class="w-full">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Dataset Type</Form.Label>
						<Tabs.Root {...props} class="w-full" bind:value={$formData.activeTab}>
							<Tabs.List class="w-full">
								<Tabs.Trigger class="cursor-pointer" value={Dataset.DEFAULT}>Default</Tabs.Trigger>
								<Tabs.Trigger class="cursor-pointer" value={Dataset.CUSTOM}>Custom</Tabs.Trigger>
							</Tabs.List>
						</Tabs.Root>
					{/snippet}
				</Form.Control>
			</Form.Field>

			<Form.Field {form} name="technologies">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Technologies</Form.Label>
						<Select.Root {...props} type="multiple" bind:value={$formData.technologies}>
							<Select.Trigger class="w-[180px] cursor-pointer">Technologies</Select.Trigger>
							<Select.Content>
								{#if $datasets.isLoading}
									<Spinner />
								{:else if $datasets.data}
									{#each $datasets.data as dataset}
										<Select.Item class="cursor-pointer" value={dataset.technology}
											>{dataset.technology}</Select.Item
										>
									{/each}
								{/if}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
			</Form.Field>

			<Form.Field {form} name="prompt">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Prompt</Form.Label>
						<Input {...props} bind:value={$formData.prompt} />
					{/snippet}
				</Form.Control>
				<Form.Description>Specify further instructions here</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button type="submit" class="cursor-pointer">
				{#if $createComplexQuizMutation.isPending}
					<Spinner classname="text-white w-6 h-6" />
				{:else}
					Create Quiz
				{/if}
			</Form.Button>
		</Card.Content>
	</Card.Card>
</form>
