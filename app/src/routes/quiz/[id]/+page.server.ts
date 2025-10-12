import { z } from 'zod';
import { superForm, superValidate } from 'sveltekit-superforms';
import { zod, zodClient } from 'sveltekit-superforms/adapters';
import type { Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { quizFormSchema } from './quizFormSchema.js';

export const load = async () => {
    const quizForm = await superValidate(zod(quizFormSchema));

    return { quizForm };
};

export const actions: Actions = {
    default: async (event) => {
        const form = await superValidate(event, zod(quizFormSchema));
        if (!form.valid) {
            return fail(400, {
                form
            });
        }
        return {
            form
        };
    }
};