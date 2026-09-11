import { expect, test } from "@playwright/test";

test("loads the Bangla onboarding shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "ধারণাকে পরিকল্পনা, পরিকল্পনাকে দলে রূপ দিন" })).toBeVisible();
});
