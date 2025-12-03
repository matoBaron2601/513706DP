import { test, expect } from '@playwright/test';

test('Home page loads', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Overview', { exact: true })).toBeVisible();
});

test.describe('Home Page Content', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('shows Overview section title and description', async ({ page }) => {
		await expect(page.getByText('Overview', { exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Application overview' })).toBeVisible();
		await expect(
			page.getByText('The application organises learning into courses, blocks and concepts.')
		).toBeVisible();
	});

	test('shows Core principles section title', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Core principles', exact: true })).toBeVisible();
	});

	test('renders all core principles titles', async ({ page }) => {
		const principles = [
			'Mastery over completion',
			'Concept-level skill modelling',
			'Probabilistic, per-user adaptation',
			'Balanced theory and practice',
			'Uncertainty-aware decisions',
			'Transparent, parameter-driven behaviour'
		];

		for (const item of principles) {
			await expect(page.getByRole('heading', { level: 3, name: item })).toBeVisible();
		}
	});

	test('shows How the system works header and subtitle', async ({ page }) => {
		await expect(
			page.getByRole('heading', { name: 'How the system works', exact: true })
		).toBeVisible();
		await expect(
			page.getByText('High-level flow from course creation to everyday usage.')
		).toBeVisible();
	});

	test('steps list labels and titles are visible', async ({ page }) => {
		const stepDetails = [
			{ label: 'Course setup', title: 'Create course, blocks and upload documents' },
			{ label: 'Initial assessment', title: 'Run the block placement quiz' },
			{ label: 'Initial skill model', title: 'Estimate concept skills with a Beta prior' },
			{ label: 'Adaptive loop', title: 'Select concepts and allocate questions' },
			{ label: 'Update and re-evaluate', title: 'Update counts, Beta parameters and mastery' },
			{ label: 'Completion', title: 'Mark concepts and blocks as mastered' }
		];

		for (const step of stepDetails) {
			await expect(page.getByText(step.label, { exact: true })).toBeVisible();
			await expect(page.getByRole('heading', { name: step.title, level: 3 })).toBeVisible();
		}
	});
});
