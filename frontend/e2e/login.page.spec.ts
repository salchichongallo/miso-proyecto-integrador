import { test, expect } from '@playwright/test';

test('has a greeting', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/MediSupply/);
  await expect(page.getByText(/Hola/)).toBeVisible();
});
