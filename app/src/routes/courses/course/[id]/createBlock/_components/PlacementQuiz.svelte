<script lang="ts">
	import { createMutation } from '@tanstack/svelte-query';
	import { type PageData } from '../$types';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import Spinner from '$lib/components/Spinner.svelte';
	import { createPlacementQuizFormSchema } from '../formSchemas/createPlacementQuizFormSchema';
	import createPlacementQuiz from '../_clientServices.ts/createPlacementQuiz';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let {
		data,
		blockId
	}: {
		data: PageData;
		blockId: string;
	} = $props();

	const createPlacementQuizMutation = createMutation({
		mutationKey: ['createPlacementQuiz'],
		mutationFn: async () => {
			await createPlacementQuiz({
				questionsPerConcept: $formData.questionsPerConcept ?? 3,
				blockId: blockId
			});
			goto(`/courses/course/${page.params.id}`);
		}
	});

	const form = superForm(data.createPlacementQuizForm, {
		validators: zodClient(createPlacementQuizFormSchema)
	});
	const { form: formData, enhance, validateForm } = form;

	const handleFormSubmit = async () => {
		const isValid = (await validateForm()).valid;
		if (!isValid) {
			return;
		}
		await $createPlacementQuizMutation.mutateAsync();
	};
</script>

<form method="POST" use:enhance class="mx-auto p-4 md:w-[50%]" onsubmit={handleFormSubmit}>
	<Card.Title>4. Create Placement Quiz</Card.Title>
	<Card.Description class="mt-1">
		Define the number of questions per concept in the placement quiz.
	</Card.Description>
	<Card.Card class="mx-auto mt-4">
		<Card.Content class="flex flex-col gap-6">
			<Form.Field {form} name="questionsPerConcept">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Questions Per Concept</Form.Label>
						<Input
							{...props}
							type="number"
							min="1"
							placeholder="3"
							bind:value={$formData.questionsPerConcept}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<div class="flex w-full gap-4 lg:flex-row">
				<Button
					type="submit"
					class="mx-auto w-full cursor-pointer lg:w-[50%]"
					disabled={$createPlacementQuizMutation.isPending}
				>
					{#if $createPlacementQuizMutation.isPending}
						<Spinner />
					{:else}
						Create quiz
					{/if}
				</Button>
			</div>
		</Card.Content>
	</Card.Card>
</form>
