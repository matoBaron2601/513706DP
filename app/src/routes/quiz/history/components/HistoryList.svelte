<script lang="ts">
	import type { QuizHistory, QuizHistoryList } from '../../../../schemas/quizSchema';
	import HistoryLine from './HistoryLine.svelte';

	const { quizHistory }: { quizHistory: QuizHistoryList[] } = $props();
</script>

<div class="mx-auto max-w-3xl">
	{#each quizHistory as historyItem, index}
		<HistoryLine {historyItem} />
		{#if index < quizHistory.length - 1}
			<hr />
		{/if}
	{/each}
</div>
