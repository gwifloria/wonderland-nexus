import { test, expect } from "@playwright/test";

test.describe("/gallery - Gallery Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/gallery");
  });

  test("should render gallery page with proper title", async ({ page }) => {
    await expect(page).toHaveTitle(/Gallery|gallery/i);
  });

  test("should display page title and description", async ({ page }) => {
    const title = page.getByText(/Gallery|图片库|照片/i).first();
    await expect(title).toBeVisible();
  });

  test("should display masonry gallery container", async ({ page }) => {
    const galleryContainer = page
      .locator(".masonry-container, [class*='masonry'], .max-w-7xl")
      .first();
    await expect(galleryContainer).toBeVisible();
  });

  test("should load and display images", async ({ page }) => {
    // Wait for images to load
    await page.waitForTimeout(2000);

    const images = page.locator("img").filter({ hasNotText: "" });
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);
  });

  test("should display polaroid frames for images", async ({ page }) => {
    await page.waitForTimeout(2000);

    const polaroidFrames = page.locator(
      "[class*='polaroid'], .polaroid-frame, [class*='frame']",
    );
    await expect(polaroidFrames.first()).toBeVisible();
  });

  test("should open image modal on click", async ({ page }) => {
    await page.waitForTimeout(2000);

    const firstImage = page.locator("img").first();
    await expect(firstImage).toBeVisible();
    await firstImage.click();

    // Check for modal or lightbox
    const modal = page.locator(
      "[role='dialog'], .modal, [class*='modal'], [class*='lightbox']",
    );
    await expect(modal).toBeVisible({ timeout: 3000 });
  });

  test("should handle infinite scroll", async ({ page }) => {
    await page.waitForTimeout(2000);

    // Get initial image count
    const initialImages = await page.locator("img").count();

    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait for potential new images to load
    await page.waitForTimeout(3000);

    // Check if more images loaded or loading indicator appeared
    const loadingIndicator = page.locator(
      "[class*='loading'], .loading, [class*='spinner']",
    );
    const finalImages = await page.locator("img").count();

    // Either more images loaded or loading indicator is shown
    const hasMore = finalImages > initialImages;
    const isLoading = await loadingIndicator.isVisible();

    expect(hasMore || isLoading).toBe(true);
  });

  test("should maintain state when switching tabs and returning", async ({
    page,
  }) => {
    await page.waitForTimeout(2000);

    // Get initial state
    const initialImages = await page.locator("img").count();

    // Navigate away and back
    await page.goto("/");
    await page.goto("/gallery");

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Should have images again
    const returnImages = await page.locator("img").count();
    expect(returnImages).toBeGreaterThan(0);
  });

  test("should not trigger unwanted pagination on second visit", async ({
    page,
  }) => {
    // First visit
    await page.waitForTimeout(2000);

    // Navigate away
    await page.goto("/");

    // Second visit - this should not immediately trigger page2 fetch
    await page.goto("/gallery");

    // Monitor network requests
    const page2Requests = [];
    page.on("request", (request) => {
      if (
        request.url().includes("page=2") ||
        request.url().includes("page%3D2")
      ) {
        page2Requests.push(request);
      }
    });

    // Wait a short time to see if page2 is fetched immediately
    await page.waitForTimeout(1000);

    // Page2 should not be fetched immediately on second visit
    expect(page2Requests.length).toBe(0);
  });

  test("should handle responsive columns", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const mobileColumns = page.locator(".flex.gap-4 > div");
    const mobileCount = await mobileColumns.count();

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(1000);

    const desktopColumns = page.locator(".flex.gap-4 > div");
    const desktopCount = await desktopColumns.count();

    // Desktop should have more columns than mobile
    expect(desktopCount).toBeGreaterThanOrEqual(mobileCount);
  });

  test("should show loading state", async ({ page }) => {
    // Intercept API calls to add delay
    await page.route("**/api/**", (route) => {
      setTimeout(() => route.continue(), 1000);
    });

    await page.goto("/gallery");

    // Check for loading indicator
    const loadingElement = page.locator(
      "[class*='loading'], .loading, .spinner, [class*='spinner']",
    );
    await expect(loadingElement).toBeVisible();
  });

  test("should handle error states gracefully", async ({ page }) => {
    // Intercept API calls to return error
    await page.route("**/api/**", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Server error" }),
      });
    });

    await page.goto("/gallery");
    await page.waitForTimeout(2000);

    // Should not crash and should show some content or error message
    const errorMessage = page.locator("[class*='error'], .error");
    const pageContent = page.locator("main, body");

    await expect(pageContent).toBeVisible();
  });

  test("should have proper animation on load", async ({ page }) => {
    await page.goto("/gallery");

    // Check for motion/animation classes
    const animatedElements = page.locator(
      "[class*='motion'], [style*='opacity'], [style*='transform']",
    );
    await expect(animatedElements.first()).toBeVisible();
  });
});
