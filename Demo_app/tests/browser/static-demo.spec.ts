import { test, expect } from "@playwright/test";

test("static home, search, notebook cases and saved places work without API requests", async ({ page, baseURL }) => {
  const externalRequests: string[] = [];
  const failures: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== baseURL) externalRequests.push(request.url());
  });
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });
  await page.goto("/");
  await expect(page.locator("article.business-card")).toHaveCount(30);
  await expect(page.getByText("Demo user 3279 · Frozen KGRec-MM recommendations · New Orleans")).toBeVisible();
  await expect(page.locator('article[data-mm-rank="6"]')).toContainText("Herbsaint");
  await page.getByRole("textbox", { name: "Find restaurants" }).fill("emeril");
  await page.getByRole("textbox", { name: "Find restaurants" }).press("Enter");
  await expect(page.getByText('2 matches for “emeril” · Demo user 3279 · Original catalogue ranks')).toBeVisible();
  await page.locator('#mm-ranking button[data-business-id="u7uFQCoHFtBKCtbWUm6yZw"]').click();
  await expect(page.getByRole("heading", { name: "Emeril's", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Notebook case · User 672", exact: true }).click();
  await expect(page.getByText("KGRec-NV #19 → KGRec-MM #49")).toBeVisible();
  await page.reload();
  await expect(page.getByText("KGRec-NV #19 → KGRec-MM #49")).toBeVisible();
  await page.getByRole("link", { name: "Back to results" }).click();
  await page.getByRole("textbox", { name: "Find restaurants" }).fill("Ruby Slipper");
  await page.getByRole("textbox", { name: "Find restaurants" }).press("Enter");
  await page.locator('#mm-ranking button[data-business-id="oBNrLz4EDhiscSlbOl8uAw"]').click();
  await page.getByRole("link", { name: "Notebook case · User 3072", exact: true }).click();
  await expect(page.getByText("KGRec-NV #52 → KGRec-MM #13")).toBeVisible();
  await page.getByRole("button", { name: "Why this place?", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Russell's Marina Grill" })).toBeVisible();
  await expect(page.getByText(/selected user’s history \(60%\)/)).toBeVisible();
  for (const name of ["Knowledge Graph", "Text Evidence", "Visual Evidence", "Model Behaviour"]) {
    await page.getByRole("tab", { name, exact: true }).click();
    await expect(page.getByRole("tab", { name, exact: true })).toHaveAttribute("aria-selected", "true");
  }
  await expect(page.getByText("+713 positions", { exact: true })).toBeVisible();
  await expect(page.getByText(/Here: #13 → #726/)).toBeVisible();
  await page.screenshot({ path: "test-results/static-ruby-case.png" });
  await page.getByRole("button", { name: "Close explanation" }).click();
  await page.getByRole("link", { name: "Demo user 3279", exact: true }).click();
  await expect(page.getByText("KGRec-NV #64 → KGRec-MM #20")).toBeVisible();
  await page.getByRole("button", { name: "Why this place?", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Commander's Palace" })).toBeVisible();
  await page.getByRole("button", { name: "Close explanation" }).click();
  await page.getByRole("button", { name: "Save place", exact: true }).click();
  await page.getByRole("button", { name: "Saved places", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your saved places" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ruby Slipper - New Orleans" })).toBeVisible();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("article.business-card")).toHaveCount(30);
  await page.screenshot({ path: "test-results/static-home-mobile.png" });
  expect(externalRequests).toEqual([]);
  expect(failures).toEqual([]);
});

test("a missing JSON file shows an honest error and can be retried", async ({ page }) => {
  await page.route("**/data/feed.json", (route) => route.fulfill({ status: 503, body: "Unavailable" }));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Recommendations are unavailable" })).toBeVisible();
  await page.unroute("**/data/feed.json");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator("article.business-card")).toHaveCount(30);
});
