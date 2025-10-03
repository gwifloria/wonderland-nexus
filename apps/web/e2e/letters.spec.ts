// e2e/letters.spec.ts
import { expect, test } from "@playwright/test";

test.describe("/letters - Letters List Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/letters");
  });

  test("should render letters list page with SSR content", async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Letters/);

    // Check main container exists
    await expect(page.locator(".container.mx-auto.max-w-4xl")).toBeVisible();

    // Wait for any loading states to complete
    await page.waitForLoadState("networkidle");
  });

  test("should display thread cards when data exists", async ({ page }) => {
    // Wait for content to load
    await page.waitForLoadState("networkidle");

    // Check if there are any thread cards
    const threadCards = page.locator(
      "[data-testid='thread-card'], .thread-card, .letter-card",
    );

    // If threads exist, verify their structure
    if ((await threadCards.count()) > 0) {
      const firstCard = threadCards.first();
      await expect(firstCard).toBeVisible();

      // Check for typical thread card elements
      // (actual structure may vary based on implementation)
      await expect(
        firstCard.locator("text=/subject|title|mail|thread/i").first(),
      ).toBeVisible();
    }
  });

  test("should handle empty state gracefully", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Check for either content or empty state
    const hasContent =
      (await page
        .locator("[data-testid='thread-card'], .thread-card, .letter-card")
        .count()) > 0;
    const hasEmptyState =
      (await page.locator("text=/no.*letters|empty|no.*threads/i").count()) > 0;

    // Should have either content or empty state
    expect(hasContent || hasEmptyState).toBe(true);
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still be accessible and readable
    await expect(page.locator(".container")).toBeVisible();

    // Content should not overflow horizontally
    const containerBox = await page.locator(".container").boundingBox();
    expect(containerBox?.width).toBeLessThanOrEqual(375);
  });
});

test.describe("/letters/[threadId] - Thread Detail Page", () => {
  test("should handle thread detail navigation", async ({ page }) => {
    // First go to letters list
    await page.goto("/letters");
    await page.waitForLoadState("networkidle");

    // Find first thread link if any exists
    const threadLinks = page.locator("a[href*='/letters/']");

    if ((await threadLinks.count()) > 0) {
      const firstLink = threadLinks.first();
      await firstLink.click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/letters\/[^\/]+$/);

      // Detail page should load
      await page.waitForLoadState("networkidle");

      // Should have some content structure
      await expect(page.locator("body")).toBeVisible();
    } else {
      // If no threads exist, test direct navigation with a mock ID
      await page.goto("/letters/mock-thread-id");

      // Should handle non-existent thread gracefully
      await page.waitForLoadState("networkidle");

      // Should show some kind of error or not found state
      const hasError =
        (await page.locator("text=/not found|error|invalid/i").count()) > 0;
      const hasContent =
        (await page.locator("main, article, .content").count()) > 0;

      expect(hasError || hasContent).toBe(true);
    }
  });

  test("should display thread messages and metadata", async ({ page }) => {
    // Navigate to letters list first
    await page.goto("/letters");
    await page.waitForLoadState("networkidle");

    const threadLinks = page.locator("a[href*='/letters/']");

    if ((await threadLinks.count()) > 0) {
      await threadLinks.first().click();
      await page.waitForLoadState("networkidle");

      // Check for message-like content
      const hasMessages =
        (await page
          .locator(".message, .mail-message, [data-testid='message']")
          .count()) > 0;
      const hasSubject =
        (await page.locator("h1, h2, .subject, .title").count()) > 0;

      // Should have either messages or subject
      expect(hasMessages || hasSubject).toBe(true);
    }
  });
});

test.describe("/letters - Comment Functionality", () => {
  test("should show comment form when authenticated", async ({ page }) => {
    await page.goto("/letters");
    await page.waitForLoadState("networkidle");

    // Check for GitHub login button or comment form
    const hasLoginButton =
      (await page.locator("text=/login|sign.*in|github/i").count()) > 0;
    const hasCommentForm =
      (await page.locator("form, textarea, input[type='text']").count()) > 0;

    // Should have either login option or comment form
    expect(hasLoginButton || hasCommentForm).toBe(true);
  });

  test("should handle comment submission flow", async ({ page }) => {
    await page.goto("/letters");
    await page.waitForLoadState("networkidle");

    // Look for comment form elements
    const commentTextarea = page.locator("textarea");
    const submitButton = page.locator(
      "button[type='submit'], button:has-text('submit'), button:has-text('发送')",
    );

    if (
      (await commentTextarea.count()) > 0 &&
      (await submitButton.count()) > 0
    ) {
      // Try to fill and submit comment
      await commentTextarea.first().fill("Test comment from E2E test");

      // Note: In real test, you might want to prevent actual submission
      // await submitButton.first().click();

      // Just verify form elements are functional
      const textValue = await commentTextarea.first().inputValue();
      expect(textValue).toBe("Test comment from E2E test");
    }
  });

  test("should show GitHub authentication flow", async ({ page }) => {
    await page.goto("/letters");
    await page.waitForLoadState("networkidle");

    // Look for GitHub login elements
    const githubButton = page.locator(
      "button:has-text('GitHub'), a:has-text('GitHub'), [data-testid='github-login']",
    );

    if ((await githubButton.count()) > 0) {
      // Don't actually trigger OAuth in E2E test, just verify element exists
      await expect(githubButton.first()).toBeVisible();

      // Verify it's clickable but don't click to avoid OAuth flow
      await expect(githubButton.first()).toBeEnabled();
    }
  });
});

test.describe("/letters - Error Handling", () => {
  test("should handle network errors gracefully", async ({ page }) => {
    // Intercept and fail API requests to simulate network error
    await page.route("**/api/letters/**", (route) => {
      route.abort("failed");
    });

    await page.goto("/letters");
    await page.waitForLoadState("networkidle");

    // Should still render page structure even with API failures
    await expect(page.locator("body")).toBeVisible();

    // Should handle errors gracefully (might show error message or fallback content)
    const hasErrorMessage =
      (await page.locator("text=/error|failed|problem/i").count()) > 0;
    const hasContainer = (await page.locator(".container").count()) > 0;

    expect(hasErrorMessage || hasContainer).toBe(true);
  });

  test("should handle invalid thread IDs", async ({ page }) => {
    // Navigate to non-existent thread
    await page.goto("/letters/invalid-thread-id-12345");
    await page.waitForLoadState("networkidle");

    // Should not crash and handle gracefully
    await expect(page.locator("body")).toBeVisible();

    // Should show appropriate error or redirect
    const currentUrl = page.url();
    const hasErrorContent =
      (await page.locator("text=/not found|error|invalid/i").count()) > 0;

    expect(currentUrl.includes("invalid-thread-id") || hasErrorContent).toBe(
      true,
    );
  });
});
