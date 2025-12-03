import { test, expect } from '@playwright/test';

test.describe('Courses page and course creation', () => {
	test('shows loading state initially', async ({ page }) => {
		await page.goto('/courses');
		await expect(page.getByText('Loading…')).toBeVisible();
	});

	test('shows empty state when no courses are available', async ({ page }) => {
		await page.goto('/courses');

		await expect(page.getByText('Loading…')).toBeHidden();

		const emptyStateHeading = page.getByRole('heading', { name: 'No courses to attend yet' });
		await expect(emptyStateHeading).toBeVisible();

		await expect(
			page.getByText('Start by creating your first course. You can add blocks and concepts later.')
		).toBeVisible();

		const createButton = page.getByRole('button', { name: 'Create new course' });
		await expect(createButton).toBeVisible();
	});

	test('go to create course page when clicking create button and create a course', async ({
		page
	}) => {
		await page.goto('/courses');
		await expect(page.getByRole('heading', { name: 'No courses to attend yet' })).toBeVisible();

		const createButton = page.getByRole('button', { name: 'Create new course' });
		await createButton.click();

		await expect(page).toHaveURL('/courses/create');
		await expect(page.getByRole('heading', { name: 'Create new course' })).toBeVisible();

		const courseName = 'Test Course Title ' + Date.now();
		const nameInput = page.getByLabel('Name');
		await nameInput.fill(courseName);

		const submitButton = page.getByRole('button', { name: 'Create course' });
		await submitButton.click();

		await expect(page).toHaveURL('/courses');

		await expect(page.getByText(courseName)).toBeVisible();

		await expect(page.getByRole('heading', { name: 'No courses to attend yet' })).not.toBeVisible();
	});

	test('go to course page and verify empty state', async ({ page }) => {
		await page.goto('/courses');

		const coursePageButton = page.getByRole('button', { name: 'Open course' });
		await coursePageButton.click();

		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		const emptyStateHeading = page.getByRole('heading', { name: 'No blocks yet', level: 2 });
		await expect(emptyStateHeading).toBeVisible();
	});

	test('create block', async ({ page }) => {
		await page.goto('/courses');
		const coursePageButton = page.getByRole('button', { name: 'Open course' });
		await coursePageButton.click();
		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		const createBlockButton = page.getByRole('button', { name: 'Create new block' }).first();
		await createBlockButton.click();
		await expect(page).toHaveURL(/\/courses\/course\/.+\/createBlock/);
		await expect(page.getByText('1. Upload file')).toBeVisible();

		const selectFileButton = page.getByRole('button', { name: 'Select .txt file' });
		await expect(selectFileButton).toBeVisible();

		await expect(page.getByText('Selected:')).not.toBeVisible();

		const fileInput = page.locator('#fileInput');

		await fileInput.setInputFiles({
			name: 'my_awesome_block.txt',
			mimeType: 'text/plain',
			buffer: Buffer.from('This is the content of the block.')
		});

		await expect(page.getByRole('button', { name: 'Change file' })).toBeVisible();

		await expect(page.getByText('Selected: my_awesome_block.txt')).toBeVisible();

		await expect(page.getByRole('button', { name: 'Upload file' })).toBeVisible();

		page.getByRole('button', { name: 'Upload file' }).click();

		const [uploadFileResponse] = await Promise.all([
			page.waitForResponse('**/block/identifyConcepts', { timeout: 30000 }),
			page.getByRole('button', { name: 'Upload file' }).click()
		]);

		await page.waitForTimeout(10000);

		await page.getByRole('button', { name: 'Upload file' }).click();

		await expect(page.getByText('2. Edit concepts')).toBeVisible();
		await page.getByRole('button', { name: 'Submit concepts' }).click();

		await expect(page.getByText('3. Create block')).toBeVisible();
		await page.getByLabel('Name').fill('Test block');
		await page.getByRole('button', { name: 'Submit' }).click();
		await page.waitForTimeout(10000);
		await expect(page).toHaveURL(/\/courses\/course\/.+$/);
		await page.waitForTimeout(10000);
	});

	test('verify created block is visible on course page', async ({ page }) => {
		await page.goto('/courses');
		const coursePageButton = page.getByRole('button', { name: 'Open course' });
		await coursePageButton.click();
		await page.waitForTimeout(3000);

		await expect(page).toHaveURL(/\/courses\/course\/.+/);
		await page.waitForTimeout(3000);

		console.log(await page.content());
	});
});
