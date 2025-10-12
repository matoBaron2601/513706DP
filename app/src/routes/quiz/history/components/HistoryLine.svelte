<script lang="ts">
	import { goto } from '$app/navigation';
	import type { QuizHistory, QuizHistoryList } from '../../../../schemas/quizSchema';
	import { House } from '@lucide/svelte';
	const { historyItem }: { historyItem: QuizHistoryList } = $props();
</script>

<button
	type="button"
	class="flex w-full cursor-pointer items-center rounded-md p-2 text-left hover:bg-gray-100"
	onclick={() => goto(`/quiz/history/${historyItem.userQuizId}`)}
>
	<div class="flex flex-grow items-center">
		<span class="mr-2"><House size={14} /></span>
		<span>{historyItem.name}</span>
	</div>
	<div class="flex-grow text-center">
		<span>{historyItem.creatorName}</span>
	</div>
	<div class="flex-none">
		<span>{historyItem.submissionDate ?? 'Not submitted'}</span>
	</div>
</button>
