/**
 * Texts for the home page explaining the adaptive learning system.
 */

export const principles = [
	{
		title: 'Mastery over completion',
		description:
			'The goal is not to “finish a block” but to master every concept in it. A block is completed only when all concepts reach the mastery criteria, not when a fixed number of quizzes has been done.'
	},
	{
		title: 'Concept-level skill modelling',
		description:
			'Each block is broken down into concepts extracted from a primary document. The system tracks a separate skill estimate for every concept and updates it after every quiz attempt.'
	},
	{
		title: 'Probabilistic, per-user adaptation',
		description:
			'User skill is estimated with a Bayesian Beta model based only on that user’s answers. All decisions (which concepts to ask, how many questions, which types) are made per user and are unaffected by other users.'
	},
	{
		title: 'Balanced theory and practice',
		description:
			'Each concept is tested across four question types (A1, A2, B1, B2), covering both theoretical understanding and practical application, so users do not overfit to one format.'
	},
	{
		title: 'Uncertainty-aware decisions',
		description:
			'The system considers both the estimated skill and its uncertainty. Concepts with low score or high uncertainty are prioritised, while confident high-skill concepts are gradually phased out.'
	},
	{
		title: 'Transparent, parameter-driven behaviour',
		description:
			'All key behaviours (mastery threshold, streak requirement, minimum questions, exploration strength) are controlled by explicit parameters that can be tuned without changing the core logic.'
	}
];

export const steps = [
	{
		label: 'Course setup',
		title: 'Create course, blocks and upload documents',
		description:
			'The course creator defines a course, splits it into blocks and uploads one primary document per block. Concepts are then extracted from each document and attached to the corresponding block.'
	},
	{
		label: 'Initial assessment',
		title: 'Run the block placement quiz',
		description:
			'For every concept in a block, the system generates exactly one question of each type (A1, A2, B1, B2). This placement quiz gives four answers per concept as the starting skill estimate.'
	},
	{
		label: 'Initial skill model',
		title: 'Estimate concept skills with a Beta prior',
		description:
			'Using a Beta(α0 = 1, β0 = 1) prior, correct and asked counts from the placement quiz are aggregated per concept. From these, the system computes an initial score (mean of the Beta) and variance for each concept.'
	},
	{
		label: 'Adaptive loop',
		title: 'Select concepts and allocate questions',
		description:
			'After every quiz, non-mastered concepts are scored by priority using their current skill and uncertainty. The top three concepts are picked, and an adaptive number of follow-up questions is allocated to each, then distributed across question types according to per-type deficits.'
	},
	{
		label: 'Update and re-evaluate',
		title: 'Update counts, Beta parameters and mastery',
		description:
			'Once the user submits a quiz, per-type counts (correct and asked) are updated. These are aggregated to update α, β, score, variance and the streak for each concept. The system then checks if mastery criteria are now satisfied.'
	},
	{
		label: 'Completion',
		title: 'Mark concepts and blocks as mastered',
		description:
			'When a concept meets all mastery conditions, it is marked as mastered and removed from further scheduling. A block is marked as completed when all its concepts are mastered, and the user can move on within the course.'
	}
];
