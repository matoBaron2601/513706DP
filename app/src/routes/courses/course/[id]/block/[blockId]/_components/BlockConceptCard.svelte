<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import type { ComplexConcept } from '../../../../../../../schemas/conceptSchema';
	const { concept }: { concept: ComplexConcept } = $props();
	const completed = concept.conceptProgress.completed;

	const totalCorrectCount = concept.conceptProgressRecords.reduce(
		(acc, record) => acc + record.correctCount,
		0
	);
	const totalCount = concept.conceptProgressRecords.reduce((acc, record) => acc + record.count, 0);
</script>

<Card.Root class={`${completed ? 'bg-green-200' : 'bg-white'}`}>
	<Card.Content class="flex flex-col items-center justify-center">
		<p class="font-bold">{concept.concept.name}</p>
		<div class="flex items-center gap-2">
			<p>{totalCorrectCount}/{totalCount}</p>
		</div>
	</Card.Content>
</Card.Root>
