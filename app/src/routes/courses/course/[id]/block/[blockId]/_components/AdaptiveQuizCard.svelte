<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import { page } from '$app/state';
	import type { AdaptiveQuiz } from '../../../../../../../schemas/adaptiveQuizSchema';

	const { adaptiveQuiz }: { adaptiveQuiz: AdaptiveQuiz } = $props();

	const quizLabel =
		adaptiveQuiz.version === 0 ? 'Placement Quiz' : `Adaptive Quiz v${adaptiveQuiz.version}`;
</script>

<Card.Root class="max-w-[400px] cursor-pointer" onclick={() => goto(page.url.pathname + `/adaptiveQuiz/${adaptiveQuiz.id}`)}>
	<Card.Content>
		<h2 class="text-lg font-semibold">
			{quizLabel}
		</h2>
	</Card.Content>
</Card.Root>
