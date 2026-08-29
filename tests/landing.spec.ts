import { test, expect } from "@playwright/test";

test("landing loads stllr", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.ok()).toBeTruthy();
  await expect(page.getByText(/stllr/i).first()).toBeVisible();
});
