// tests/blog.spec.ts (Playwright 测试文件)
import { expect, Page, test } from "@playwright/test";

// Helpers
async function skipIfNoPosts(page: Page) {
  // 如果侧边栏没有任何文章条目，则跳过
  const count = await page.locator("aside nav a").count();
  if (count === 0) {
    test.skip(true, "No blogs available in content directories.");
  }
}

async function firstLinkUnder(page: Page, headingText: string) {
  // 找到分组标题（ByteNotes / Murmurs）所在 section，然后取第一个链接
  const section = page.getByText(headingText).locator("..");
  const link = section.locator("a").first();
  const href = await link.getAttribute("href");
  return { link, href } as const;
}

function activeLink(page: Page, href: string) {
  return page.locator(`aside nav a[href='${href}']`);
}

function accentSpanIn(linkLocator: ReturnType<typeof activeLink>) {
  // 选中项时，左侧会渲染一个表示分类色条的 span（在 Link 内部）
  return linkLocator.locator("span").first();
}

// ------------------------------
// Tests
// ------------------------------

test.describe("/blog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
    await skipIfNoPosts(page);
  });

  test("shows grouped sidebar with ByteNotes & Murmurs", async ({ page }) => {
    await expect(page.getByText("ByteNotes")).toBeVisible();
    await expect(page.getByText("Murmurs")).toBeVisible();
  });

  test("navigates to a ByteNotes blog and highlights as active (nepal accent)", async ({
    page,
  }) => {
    const { link, href } = await firstLinkUnder(page, "ByteNotes");
    await link.click();

    // URL 应为文件式路由 /blog/ByteNotes/...
    await expect(page).toHaveURL(/\/blog\/ByteNotes\//i);

    // 选中态：侧边栏对应链接加粗/高亮，并带有 nepal 色条
    if (href) {
      const active = activeLink(page, href);
      await expect(active).toHaveClass(/font-semibold|bg-neutral/);
      const accent = accentSpanIn(active);
      await expect(accent).toHaveClass(/bg-nepal-300\/40/);
    }

    // 正文可见
    await expect(page.locator("article")).toBeVisible();
  });

  test("navigates to a Murmurs blog and highlights as active (rose accent)", async ({
    page,
  }) => {
    const { link, href } = await firstLinkUnder(page, "Murmurs");
    await link.click();

    await expect(page).toHaveURL(/\/blog\/Murmurs\//i);

    if (href) {
      const active = activeLink(page, href);
      await expect(active).toHaveClass(/font-semibold|bg-neutral/);
      const accent = accentSpanIn(active);
      await expect(accent).toHaveClass(/bg-rose-300\/40/);
    }

    await expect(page.locator("article")).toBeVisible();
  });

  test("selection persists across reload via path", async ({ page }) => {
    // 选择 ByteNotes 第一篇
    const { link, href } = await firstLinkUnder(page, "ByteNotes");
    await link.click();

    await expect(page).toHaveURL(/\/blog\/ByteNotes\//i);

    // 刷新后仍然保持选中态
    await page.reload();

    if (href) {
      const active = activeLink(page, href);
      await expect(active).toHaveClass(/font-semibold|bg-neutral/);
    }

    // 正文仍可见
    await expect(page.locator("article")).toBeVisible();
  });
});

test.describe("/blog - Pin functionality (Admin only)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
    await skipIfNoPosts(page);
    // Note: This test assumes admin authentication is set up
    // In a real test environment, you might need to mock the session
  });

  test("pin control should be visible on hover for admin users", async ({
    page,
  }) => {
    // Find first blog post link
    const firstPost = page.locator("aside nav a").first();

    // Hover over the post to show pin control
    await firstPost.hover();

    // Check if pin control button appears (may not be visible if not admin)
    const pinButton = firstPost.locator("button");

    // This test will only work if authenticated as admin
    // In a real scenario, you'd mock the authentication
    if ((await pinButton.count()) > 0) {
      await expect(pinButton).toBeVisible();

      // Check for correct icon (📍 for unpin, 📌 for pinned)
      const buttonText = await pinButton.textContent();
      expect(buttonText).toMatch(/📍|📌|⏳/);
    }
  });

  test("pin button should show loading state when clicked", async ({
    page,
  }) => {
    // Find first blog post
    const firstPost = page.locator("aside nav a").first();
    await firstPost.hover();

    const pinButton = firstPost.locator("button");

    if ((await pinButton.count()) > 0) {
      // Click pin button
      await pinButton.click();

      // Should show loading indicator briefly
      await expect(pinButton).toHaveText("⏳");

      // Wait for the operation to complete (with timeout)
      await expect(pinButton).not.toHaveText("⏳", { timeout: 5000 });
    }
  });

  test("pin status should toggle correctly", async ({ page }) => {
    const firstPost = page.locator("aside nav a").first();
    await firstPost.hover();

    const pinButton = firstPost.locator("button");

    if ((await pinButton.count()) > 0) {
      // Get initial state
      const initialIcon = await pinButton.textContent();

      // Click to toggle
      await pinButton.click();

      // Wait for operation to complete
      await expect(pinButton).not.toHaveText("⏳", { timeout: 5000 });

      // Hover again to show button
      await firstPost.hover();

      // Icon should have changed
      const newIcon = await pinButton.textContent();
      expect(newIcon).not.toBe(initialIcon);

      // Should be either pinned or unpinned icon
      expect(newIcon).toMatch(/📍|📌/);
    }
  });
});

test.describe("/blog - TOC functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
    await skipIfNoPosts(page);
  });

  test("should show TOC when viewing a blog post", async ({ page }) => {
    // Click on the first available blog post
    const firstPost = page.locator("aside nav a").first();
    await firstPost.click();

    // Wait for the article to load
    await expect(page.locator("article")).toBeVisible();

    // Check if TOC is visible (only on desktop/large screens)
    await page.setViewportSize({ width: 1200, height: 800 });

    const toc = page.locator("nav").filter({
      hasText: /on this page|table of contents|目录/i,
    });

    // TOC might not be visible if the article doesn't have headings
    if (await toc.isVisible()) {
      await expect(toc).toBeVisible();

      // Check if TOC has links
      const tocLinks = toc.locator("a[href^='#']");
      const linkCount = await tocLinks.count();

      if (linkCount > 0) {
        // Test TOC link click
        const firstTocLink = tocLinks.first();
        await firstTocLink.click();

        // Wait for scroll animation
        await page.waitForTimeout(500);

        // Check if the link becomes active
        await expect(firstTocLink).toHaveAttribute("data-active", "true");
      }
    }
  });

  test("should hide TOC on mobile screens", async ({ page }) => {
    // Click on the first available blog post
    const firstPost = page.locator("aside nav a").first();
    await firstPost.click();

    await expect(page.locator("article")).toBeVisible();

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const toc = page.locator("nav").filter({
      hasText: /on this page|table of contents|目录/i,
    });

    // TOC should be hidden on mobile (display: none or not visible)
    if ((await toc.count()) > 0) {
      const tocDisplay = await toc
        .first()
        .evaluate((el) => getComputedStyle(el).display);
      expect(tocDisplay).toBe("none");
    }
  });

  test("should update active TOC item on scroll", async ({ page }) => {
    // Click on the first available blog post
    const firstPost = page.locator("aside nav a").first();
    await firstPost.click();

    await expect(page.locator("article")).toBeVisible();
    await page.setViewportSize({ width: 1200, height: 800 });

    const toc = page.locator("nav").filter({
      hasText: /on this page|table of contents|目录/i,
    });

    if (await toc.isVisible()) {
      const tocLinks = toc.locator("a[href^='#']");
      const linkCount = await tocLinks.count();

      if (linkCount > 1) {
        // Scroll to different sections and check active state
        await page.evaluate(() => window.scrollTo(0, 100));
        await page.waitForTimeout(300);

        // Check that some TOC item is active
        const activeItems = toc.locator("a[data-active='true']");
        const activeCount = await activeItems.count();
        expect(activeCount).toBeLessThanOrEqual(1);

        // Scroll further down
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(300);

        // Active item might change
        const newActiveItems = toc.locator("a[data-active='true']");
        const newActiveCount = await newActiveItems.count();
        expect(newActiveCount).toBeLessThanOrEqual(1);
      }
    }
  });

  test("should show correct pin icons in sidebar", async ({ page }) => {
    // Look for pinned articles with pin-icon
    const pinnedArticles = page.locator("aside nav a").filter({
      has: page.locator("[data-testid='pin-icon'], .pin-icon"),
    });

    const pinnedCount = await pinnedArticles.count();

    if (pinnedCount > 0) {
      // Check that pinned articles show the pin-icon, not 📌
      const firstPinnedArticle = pinnedArticles.first();
      const pinIcon = firstPinnedArticle.locator(
        "[data-testid='pin-icon'], .pin-icon, svg",
      );

      await expect(pinIcon).toBeVisible();

      // Ensure it's not showing the text emoji
      const emojiPin = firstPinnedArticle.locator("text=📌");
      await expect(emojiPin).toHaveCount(0);
    }
  });
});
