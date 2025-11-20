<script lang="ts">
	import type { ComplexAdaptiveQuiz } from '../../../../../../../../../schemas/adaptiveQuizSchema';
	import Option from './Option.svelte';

	let { complexAdaptiveQuiz }: { complexAdaptiveQuiz: ComplexAdaptiveQuiz } = $props();
</script>


<div class="flex flex-col gap-10">
	{#each complexAdaptiveQuiz.questions as question, index}
		<div>
			<h1 class="text-2xl font-bold">{`${index + 1}. ${question.questionText}`}</h1>
			{#if question.codeSnippet}
				<pre
					class="overflow-x-auto whitespace-pre rounded-lg bg-[#f8e8d2] p-3 font-mono text-sm"><code
						>{question.codeSnippet}</code
					>
  </pre>
			{/if}
			<div class="mt-4 flex flex-col gap-3">
				{#if question.options.length > 0}
					{#each question.options as option, index}
						<Option
							optionIndex={index}
							reviewCorrect={option.isCorrect}
							reviewSelected={option.optionText === question.userAnswerText}
							optionText={option.optionText ?? ''}
						/>
					{/each}
				{:else}
					<div class={`space-y-2 rounded-xl border border-gray-200  px-4 py-3 text-sm ${question.isCorrect ? 'bg-green-200' : 'bg-red-200'}`}>
						<p class="text-gray-700">
							<span class="font-medium text-gray-900">Your answer: </span>
							<span>{question.userAnswerText}</span>
						</p>

						<p class="text-gray-700">
							<span class="font-medium text-gray-900">Correct answer: </span>
							<span>{question.correctAnswerText}</span>
						</p>
					</div>
				{/if}
			</div>

			{#if index < complexAdaptiveQuiz.questions.length - 1}
				<hr class="my-4" />
			{/if}
		</div>
	{/each}
</div>
