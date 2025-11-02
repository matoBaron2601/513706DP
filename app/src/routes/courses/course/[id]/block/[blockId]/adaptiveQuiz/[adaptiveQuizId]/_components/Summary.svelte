<script lang="ts">
	import type { ComplexAdaptiveQuiz } from '../../../../../../../../../schemas/adaptiveQuizSchema';
	import Option from './Option.svelte';

	let { complexAdaptiveQuiz }: { complexAdaptiveQuiz: ComplexAdaptiveQuiz } = $props();
</script>

<div class="flex max-w-[55%] flex-col gap-10">
	{#each complexAdaptiveQuiz.questions as question, index}
		<div>
			<h1 class="text-2xl font-bold">{`${index + 1}. ${question.questionText}`}</h1>
			<div class="mt-4 flex flex-col gap-2">
				{#if question.options.length > 0}
					{#each question.options as option}
						<Option
							optionIndex={question.options.indexOf(option)}
							reviewCorrect={option.optionText === question.correctAnswerText}
							reviewSelected={option.optionText === question.userAnswerText}
							optionText={option.optionText ?? ''}
						/>
					{/each}
				{:else}
					<p class="text-gray-700">User Answer: {question.userAnswerText}</p>
					<p class="text-gray-700">Correct Answer: {question.correctAnswerText}</p>
				{/if}
			</div>

			{#if index < complexAdaptiveQuiz.questions.length - 1}
				<hr class="my-4" />
			{/if}
		</div>
	{/each}
</div>
