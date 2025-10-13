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
	import createQuiz from '../clienServices/createQuiz';
	import { goto } from '$app/navigation';
	import { getUniqueDatasets } from '../../../clientServices/getUniqueDatasets';
	import Spinner from '$lib/components/Spinner.svelte';
	import { page } from '$app/state';
	import { Switch } from '$lib/components/ui/switch/index.js';

	let { data }: { data: { createQuizForm: SuperValidated<Infer<CreateQuizFormSchema>> } } =
		$props();

	const form = superForm(data.createQuizForm, {
		validators: zodClient(createQuizFormSchema)
	});

	const { form: formData, enhance, validateForm } = form;
	const createComplexQuizMutation = createMutation({
		mutationFn: () =>
			createQuiz({
				name: $formData.name,
				prompt: $formData.prompt,
				documents: $formData.documents,
				numberOfQuestions: $formData.numberOfQuestions,
				canGoBack: $formData.canGoBack,
				email: page.data.session?.user?.email ?? '',
				isDefaultDataset: $formData.activeTab === Dataset.DEFAULT
			})
	});

	const fetchDatasets = (datasetType: Dataset) =>
		createQuery({
			queryKey: ['unique-datasets', datasetType],
			queryFn: () => getUniqueDatasets(datasetType)
		});

	const handleSubmit = async () => {
		if (!(await validateForm()).valid) {
			return;
		}
		const quiz = await $createComplexQuizMutation.mutateAsync();
		if (quiz) {
			goto(`/quiz/created`);
		}
	};

	let datasets = $derived.by(() => fetchDatasets($formData.activeTab));
</script>

<form method="POST" use:enhance class="p-4" onsubmit={handleSubmit}>
	<Card.Title class="text-xl">Create Quiz</Card.Title>

	<Card.Card class="mx-auto mt-4">
		<Card.Content class="flex flex-col gap-6">
			<div class="gap-30 flex">
				<Card.Title class="w-full text-xl">Generation related</Card.Title>
				<Card.Title class="w-full text-xl">Other</Card.Title>
			</div>
			<div class="gap-30 flex">
				<div class="flex w-full flex-col gap-4">
					<Form.Field {form} name="activeTab" class="w-full">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Dataset Type</Form.Label>
								<Tabs.Root {...props} class="w-full" bind:value={$formData.activeTab}>
									<Tabs.List class="w-full">
										<Tabs.Trigger class="cursor-pointer" value={Dataset.DEFAULT}
											>Default</Tabs.Trigger
										>
										<Tabs.Trigger class="cursor-pointer" value={Dataset.CUSTOM}>Custom</Tabs.Trigger
										>
									</Tabs.List>
								</Tabs.Root>
							{/snippet}
						</Form.Control>
					</Form.Field>
					<Form.Field {form} name="documents">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Documents</Form.Label>
								<Select.Root {...props} type="multiple" bind:value={$formData.documents}>
									<Select.Trigger class="w-[180px] cursor-pointer">Documents</Select.Trigger>
									<Select.Content>
										{#if $datasets.isLoading}
											<Spinner />
										{:else if $datasets.data}
											{#each $datasets.data as dataset}
												<Select.Item class="cursor-pointer" value={dataset.name}
													>{dataset.name}</Select.Item
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
					<Form.Field {form} name="numberOfQuestions">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Number of Questions</Form.Label>
								<Input {...props} type="number" bind:value={$formData.numberOfQuestions} />
							{/snippet}
						</Form.Control>
						<Form.Description>Specify further instructions here</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="flex w-full flex-col gap-4">
					<Form.Field {form} name="name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Name</Form.Label>
								<Input {...props} bind:value={$formData.name} />
							{/snippet}
						</Form.Control>
						<Form.Description>Specify a name for the quiz</Form.Description>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="canGoBack">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Can go back</Form.Label>
								<Switch bind:checked={$formData.canGoBack} />
							{/snippet}
						</Form.Control>
						<Form.Description>Allow users to navigate back during the quiz</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
					{#if !$formData.canGoBack}
						<Form.Field {form} name="timePerQuestion">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Time per question in seconds</Form.Label>
									<Input {...props} type="number" bind:value={$formData.timePerQuestion} />
								{/snippet}
							</Form.Control>
							<Form.Description>Specify the seconds allowed for each question</Form.Description>
							<Form.FieldErrors />
						</Form.Field>
					{/if}
				</div>
			</div>

			<Form.Button type="submit" class="mx-auto w-[50%] cursor-pointer">
				{#if $createComplexQuizMutation.isPending}
					<Spinner classname="text-white w-6 h-6" />
				{:else}
					Create Quiz
				{/if}
			</Form.Button>
		</Card.Content>
	</Card.Card>
</form>
