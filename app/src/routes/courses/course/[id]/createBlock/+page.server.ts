import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types.js';
import { fail } from '@sveltejs/kit';
import { createBlockFormSchema } from './formSchemas/createBlockFormSchema.js';
import { identifyConceptsFormSchema } from './formSchemas/identifyConceptsFormSchema.js';
import { createPlacementQuizFormSchema } from './formSchemas/createPlacementQuizFormSchema.js';

export const load: PageServerLoad = async () => {
	const identifyConceptsForm = await superValidate(zod(identifyConceptsFormSchema));
	const createBlockForm = await superValidate(zod(createBlockFormSchema));
	const createPlacementQuizForm = await superValidate(zod(createPlacementQuizFormSchema));
	return { identifyConceptsForm, createBlockForm, createPlacementQuizForm };
};

export const actions: Actions = {
	identifyConcepts: async (event) => {
		const form = await superValidate(event, zod(identifyConceptsFormSchema));
		if (!form.valid) {
			return fail(400, { identifyConceptsForm: form });
		}
		return { identifyConceptsForm: form };
	},
	createBlock: async (event) => {
		const form = await superValidate(event, zod(createBlockFormSchema));
		if (!form.valid) {
			return fail(400, { createBlockForm: form });
		}
		return { createBlockForm: form };
	},
	createPlacementQuiz: async (event) => {
		const form = await superValidate(event, zod(createPlacementQuizFormSchema));
		if (!form.valid) {
			return fail(400, { createPlacementQuizForm: form });
		}
		return { createPlacementQuizForm: form };
	}
};
