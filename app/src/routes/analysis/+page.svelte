<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import getRandomQuestions from './_clientServices/getRandomQuestions';
	import type { AnalysisDto } from '../../schemas/analysisSchema';

	const csvEscape = (value: unknown) => {
		if (value === null || value === undefined) return '';
		const str = String(value);
		if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
			return `"${str.replace(/"/g, '""')}"`;
		}
		return str;
	};

	const analysisToCsv = (rows: AnalysisDto[]): string => {
		const header = [
			'courseId',
			'userId',
			'questionId',
			'quizVersion',
			'questionText',
			'codeSnippet',
			'questionType',
			'options',
			'isCorrect',
			'time'
		].join(',');

		const dataRows = rows.map((row) => {
			const optionsStr = row.options
				.map((o) => `${o.optionId}|${o.optionText}|${o.isCorrect}`)
				.join(' || ');

			return [
				csvEscape(row.courseId),
				csvEscape(row.userId),
				csvEscape(row.questionId),
				csvEscape(row.version),
				csvEscape(row.questionText),
				csvEscape(row.codeSnippet ?? ''),
				csvEscape(row.questionType),
				csvEscape(optionsStr),
				csvEscape(row.isCorrect),
				csvEscape(row.time)
			].join(',');
		});

		return [header, ...dataRows].join('\r\n');
	};

	const downloadCsv = (rows: AnalysisDto[]) => {
		const csv = analysisToCsv(rows);
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = 'analysis.csv';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		URL.revokeObjectURL(url);
	};

	const getRandomQuestionsMutation = createMutation({
		mutationFn: async () => {
			const res = await getRandomQuestions({
				count: 800,
				courseId: 'uvth70x6u5o23twi85mgvs6j'
			});

			return res as unknown as AnalysisDto[];
		},
		onSuccess: (data) => {
			downloadCsv(data);
		}
	});
</script>

<Button
	variant="default"
	onclick={async () => {
		await $getRandomQuestionsMutation.mutateAsync();
	}}
>
	Run Analysis & Download CSV
</Button>
