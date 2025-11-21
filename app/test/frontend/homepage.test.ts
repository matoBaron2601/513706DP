import { test, expect } from '@playwright/test';

test('Home page loads', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Overview', { exact: true })).toBeVisible();
});

test.describe('Home Page Content', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('shows Overview section title', async ({ page }) => {
		await expect(page.getByText('Overview', { exact: true })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Application overview' })).toBeVisible();
	});

	test('shows Core principles section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Core principles' })).toBeVisible();
		await expect(page.getByText('How the system behaves')).toBeVisible();
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
		await expect(page.getByRole('heading', { name: 'How the system works' })).toBeVisible();
		await expect(
			page.getByText('High-level flow from course creation to everyday usage.')
		).toBeVisible();
	});

	test('steps list labels are visible', async ({ page }) => {
		const stepLabels = [
			'Course setup',
			'Initial assessment',
			'Initial skill model',
			'Adaptive loop',
			'Update and re-evaluate',
			'Completion'
		];

		for (const label of stepLabels) {
			await expect(page.getByText(label, { exact: true })).toBeVisible();
		}
	});

	test('shows Decision logic section', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Decision logic' })).toBeVisible();
		await expect(page.getByText('When and why the app changes concepts')).toBeVisible();
	});

	test('shows key decision logic cards', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Adaptive difficulty' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Content ordering' })).toBeVisible();
	});
});
