<script lang="ts">
	import type { SuperFormData } from 'sveltekit-superforms/client';
	import { QuestionType, type Question } from '../../../schemas/questionSchema';
	import { OptionIcon } from '../[id]/types';
	import Option from './Option.svelte';

	let {
		index,
		question,
		formData
	}: {
		index: number;
		question: Question;
		formData: SuperFormData<{
			answers: {
				questionId: string;
				optionId: string;
			}[];
		}>;
	} = $props();

	const optionIcons = Object.values(OptionIcon);

	const isSelected = (optionId: string): boolean => {
		return $formData.answers.some(
			(answer) => answer.questionId === question.questionId && answer.optionId === optionId
		);
	};

	const handleClick = (optionId: string) => {
		const isAlreadySelected = isSelected(optionId);

		if (question.type === QuestionType.SingleChoice) {
			$formData.answers = [
				...$formData.answers.filter((answer) => answer.questionId !== question.questionId),
				{ questionId: question.questionId, optionId }
			];
		} else {
			if (isAlreadySelected) {
				$formData.answers = $formData.answers.filter(
					(answer) => answer.questionId !== question.questionId || answer.optionId !== optionId
				);
			} else {
				$formData.answers = [...$formData.answers, { questionId: question.questionId, optionId }];
			}
		}
	};
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-bold">{`${index + 1}. ${question.text}`}</h1>
	<p>{question.type === QuestionType.SingleChoice ? 'Single Choice' : 'Multiple Choice'}</p>
	{#each question.options as option, index}
		<Option
			optionIcon={optionIcons[index]}
			questionText={option.text}
			onSelect={() => handleClick(option.optionId)}
			isSelected={isSelected(option.optionId)}
		/>
	{/each}
</div>
