<script lang="ts">
	import Option from './Option.svelte';
	import type { BaseQuestionWithOptions } from '../../../../../../schemas/baseQuestionSchema';

	let selectedOptionId = $state('');

	let {
		index,
		question,
		handleSubmitQuestion
	}: {
		index: number;
		question: BaseQuestionWithOptions;
		handleSubmitQuestion: (optionText: string, isCorrect: boolean, baseQuestionId: string) => void;
	} = $props();

	const handleOptionClick = (optionId: string) => {
		selectedOptionId = optionId;
		const selectedOption = question.options.find((option) => option.id === optionId);
		handleSubmitQuestion(
			selectedOption?.optionText ?? '',
			selectedOption?.optionText === question.correctAnswerText,
			question.id
		);
	};
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-bold">{`${index + 1}. ${question.questionText}`}</h1>
	{#each question.options as option}
		<Option
			optionText={option.optionText ?? ''}
			onOptionClick={() => handleOptionClick(option.id)}
			isCorrect={option.optionText === question.correctAnswerText}
			isSelected={selectedOptionId === option.id}
		/>
	{/each}
</div>
