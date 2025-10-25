<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';

	let { adaptiveQuizId }: { adaptiveQuizId: string } = $props();

	const getQuizSummaryQuery = createQuery({
		queryKey: ['quizSummary'],
		queryFn: async () => 'test'
	});
</script>

<div>
	<h2>Quiz Summary</h2>
	<p>{$getQuizSummaryQuery.data}</p>
</div>
