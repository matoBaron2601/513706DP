import { test, expect } from '@playwright/test';
import { createTestCourse } from './scripts/createTestCourse';
import { createTestBlock } from './scripts/createTestBlock';

test.describe('Home Page Content', async () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('Home page loads', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Overview', { exact: true })).toBeVisible();
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

test.describe('Courses Page', async () => {
	test('Courses page loads and shows no courses', async ({ page }) => {
		await page.goto('/courses');
		await expect(page.getByText('No courses to attend yet')).toBeVisible();
	});

	test('Create new course button works', async ({ page }) => {
		await page.goto('/courses');
		await page.getByRole('button', { name: 'Create new course' }).click();
		await expect(page).toHaveURL('/courses/create');
	});
});

test.describe('Course page', async () => {
	test('Created course is showing', async ({ page }) => {
		await page.goto('/courses');
		await createTestCourse();
		await expect(page.getByText('Test Course')).toBeVisible();
	});

	test('Go to course page', async ({ page }) => {
		await page.goto('/courses');
		await page.getByRole('button', { name: 'Open course' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		await expect(page.getByText('Test Course')).toBeVisible();
	});

	test('Verify course page blocks empty state', async ({ page }) => {
		await page.goto('/courses');
		await page.getByRole('button', { name: 'Open course' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		const emptyStateHeading = page.getByText('No blocks yet');
		await expect(emptyStateHeading).toBeVisible();
	});

	test('Created block is visible on course page', async ({ page }) => {
		await createTestBlock();
		await page.goto('/courses');
		await page.getByRole('button', { name: 'Open course' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		await expect(page.getByText('Test Block')).toBeVisible();
	});

	test('Navigate to block page from course page', async ({ page }) => {
		await page.goto('/courses');
		await page.getByRole('button', { name: 'Open course' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		await page.getByRole('button', { name: 'Open' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+/);
	});
});

test.describe('Block Page', async () => {
	test('Block name is visible', async ({ page }) => {
		await page.goto('/courses');
		await page.getByRole('button', { name: 'Open course' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		await page.getByRole('button', { name: 'Open' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+/);
		await expect(page.getByText('Progress and quizzes for this block.')).toBeVisible();
		await expect(page.getByText('Test Block').first()).toBeVisible();
	});
	test('Concept progress is visible', async ({ page }) => {
		await page.goto('/courses');
		await page.getByRole('button', { name: 'Open course' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		await page.getByRole('button', { name: 'Open' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+/);
		await expect(page.getByText('Concept Progress')).toBeVisible();
	});
});

test.describe('Adaptive Quiz Page', async () => {
	test('Placement quiz is visible and can be started', async ({ page }) => {
		await page.goto('/courses');
		await page.getByRole('button', { name: 'Open course' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		await page.getByRole('button', { name: 'Open' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+/);
		await page.getByRole('button', { name: 'Start quiz' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+\/adaptiveQuiz\/.+/);
	});

	test('Quiz page shows question', async ({ page }) => {
		await page.goto('/courses');
		await page.getByRole('button', { name: 'Open course' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		await page.getByRole('button', { name: 'Open' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+/);
		await page.getByRole('button', { name: 'Start quiz' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+\/adaptiveQuiz\/.+/);
		await expect(page.getByText('Sample Question?')).toBeVisible();
	});

	test('Can select option', async ({ page }) => {
		await page.goto('/courses');
		await page.getByRole('button', { name: 'Open course' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		await page.getByRole('button', { name: 'Open' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+/);
		await page.getByRole('button', { name: 'Start quiz' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+\/adaptiveQuiz\/.+/);
		await page.getByText('Answer1').click();
		await page.waitForTimeout(2000);
	});
});

test.describe('History Page', async () => {
	test('History page loads', async ({ page }) => {
		await page.goto('/courses');
		await page.getByRole('button', { name: 'Open course' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		await page.getByRole('button', { name: 'Open' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+/);
		await page.getByRole('button', { name: 'History' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+\/history/);
	});

	test('History page shows Placement quiz history', async ({ page }) => {
		await page.goto('/courses');
		await page.getByRole('button', { name: 'Open course' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		await page.getByRole('button', { name: 'Open' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+/);
		await page.getByRole('button', { name: 'History' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+\/history/);
		await page.getByRole('button', { name: 'Review quiz' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+\/adaptiveQuiz\/.+\/summary$/);
	});

	test('Summary page shows correct question and answer', async ({ page }) => {
		await page.goto('/courses');
		await page.getByRole('button', { name: 'Open course' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		await page.getByRole('button', { name: 'Open' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+/);
		await page.getByRole('button', { name: 'History' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+\/history/);
		await page.getByRole('button', { name: 'Review quiz' }).click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/block\/.+\/adaptiveQuiz\/.+\/summary$/);
		await expect(page.getByText('Sample Question?')).toBeVisible();
		await expect(page.getByText('Answer1')).toBeVisible();
	});
});
