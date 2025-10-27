<script lang="ts">
	import type { ComplexAdaptiveQuiz } from '../../../../../../../../../schemas/adaptiveQuizSchema';

	let { complexAdaptiveQuiz }: { complexAdaptiveQuiz: ComplexAdaptiveQuiz } = $props();
</script>

<div class="question-container mt-10">
	{#each complexAdaptiveQuiz.questions as question, index}
		<p>{question.questionText}</p>
		<p>Your answer: {question.userAnswerText ?? 'No answer given'}</p>
		<p>Correct answer: {question.correctAnswerText}</p>

		<ul>
			{#each question.options as option}
				<li>{option.optionText}</li>
			{/each}
		</ul>

		{#if index < complexAdaptiveQuiz.questions.length - 1}
			<hr class="my-4" />
		{/if}
	{/each}
</div>
