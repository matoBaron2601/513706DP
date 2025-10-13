<script lang="ts">
	import type { Quiz } from "../../../../schemas/quizSchema";
	import QuizCard from "./QuizCard.svelte";
    let createdQuizzes : {createdQuizzes : Quiz[]} = $props()
</script>

<div class="grid grid-cols-4 gap-4 md:grid-cols-4 sm:grid-cols-2 xs:grid-cols-1">
	{#each createdQuizzes.createdQuizzes as quiz}
		<QuizCard {quiz} />
	{/each}
</div>
