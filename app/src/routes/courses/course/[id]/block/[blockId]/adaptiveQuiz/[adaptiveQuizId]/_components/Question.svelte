<script lang="ts">
    import Option from './Option.svelte';
    import { Input } from '$lib/components/ui/input/index.js';
    import { Button } from '$lib/components/ui/button';
    import { type PageData } from '../$types';
    import { superForm } from 'sveltekit-superforms';
    import { zodClient } from 'sveltekit-superforms/adapters';
    import * as Form from '$lib/components/ui/form/index.js';
    import type { BaseQuestionWithOptions } from '../../../../../../../../../schemas/baseQuestionSchema';
    import { submitAnswerFormSchema } from '../submitAnswerFormSchema';

    let {
        index,
        question,
        handleSubmitQuestion,
        data
    }: {
        index: number;
        question: BaseQuestionWithOptions;
        handleSubmitQuestion: (optionText: string, baseQuestionId: string) => void;
        data: PageData;
    } = $props();

    const form = superForm(data.submitAnswerForm, {
        validators: zodClient(submitAnswerFormSchema)
    });
    const { form: formData, enhance, validateForm } = form;

    const handleOptionClick = (optionId: string) => {
        const selectedOption = question.options.find((option) => option.id === optionId);
        handleSubmitQuestion(selectedOption?.optionText ?? '', question.id);
        form.reset();
    };

    const handleSubmitAnswer = () => {
        handleSubmitQuestion($formData.text, question.id);
        form.reset();
    };
</script>

<div class="flex flex-col gap-4">
    <h1 class="text-2xl font-bold">{`${index + 1}. ${question.questionText}`}</h1>
    {#if question.codeSnippet}
        <pre class="overflow-x-auto whitespace-pre rounded-lg bg-[#f8e8d2] p-3 font-mono text-sm"><code
                >{question.codeSnippet}</code
            ></pre>
    {/if}
    {#if question.options.length > 0}
        {#each question.options as option}
            <Option
                optionText={option.optionText ?? ''}
                onOptionClick={() => handleOptionClick(option.id)}
                optionIndex={question.options.indexOf(option)}
            />
        {/each}
    {:else if question.options.length === 0}
        <form method="POST" use:enhance onsubmit={handleSubmitAnswer}>
            <Form.Field {form} name="text">
                <Form.Control>
                    {#snippet children({ props })}

                        <textarea
                            {...props}
                            bind:value={$formData.text}
                            rows="3"
                            class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        ></textarea>
                    {/snippet}
                </Form.Control>
                <Form.Description>Specify your answer</Form.Description>
                <Form.FieldErrors />
            </Form.Field>
            <Button type="submit" class={'cursor-pointer mt-4'}>Submit</Button>
        </form>
    {/if}
</div>