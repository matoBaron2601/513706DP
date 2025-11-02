<script lang="ts">
	import Option from './Option.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button';
	import { type PageData } from '../$types';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form/index.js';
	import type { BaseQuestionWithOptions } from '../../../../../../../../../schemas/baseQuestionSchema';
	import { submitAnswerFormSchema } from '../submitAnswerFormSchema';

	let {
		index,
		question,
		handleSubmitQuestion,
		data
	}: {
		index: number;
		question: BaseQuestionWithOptions;
		handleSubmitQuestion: (optionText: string, baseQuestionId: string) => void;
		data: PageData;
	} = $props();

	const form = superForm(data.submitAnswerForm, {
		validators: zodClient(submitAnswerFormSchema)
	});
	const { form: formData, enhance, validateForm } = form;

	const handleOptionClick = (optionId: string) => {
		const selectedOption = question.options.find((option) => option.id === optionId);
		handleSubmitQuestion(
			selectedOption?.optionText ?? '',
			question.id
		);
	};

	const handleSubmitAnswer = () => {
		handleSubmitQuestion(
			$formData.text,
			question.id
		);
	};
</script>


<div class="flex flex-col gap-4 lg:max-w-[55%]">
	<h1 class="text-2xl font-bold">{`${index + 1}. ${question.questionText}`}</h1>
	{#if question.options.length > 0}
		{#each question.options as option}
			<Option
				optionText={option.optionText ?? ''}
				onOptionClick={() => handleOptionClick(option.id)}
				optionIndex={question.options.indexOf(option)}
			/>
		{/each}
	{:else if question.options.length === 0}
		<form method="POST"  use:enhance class="mx-auto p-4 md:w-[50%]" onsubmit={handleSubmitAnswer}>
			<Form.Field {form} name="text">
					<Form.Control>
						{#snippet children({ props })}
							<Input {...props} bind:value={$formData.text} />
						{/snippet}
					</Form.Control>
					<Form.Description>Specify your answer</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
			<Button type="submit" class={"cursor-pointer"}>Submit</Button>
		</form>
	{/if}
</div>
