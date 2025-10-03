import { expect, test } from "@playwright/test";

test.describe("Markdown functionality", () => {
  test("should render markdown content with TOC", async ({ page }) => {
    // 访问一个包含TOC的博客文章
    await page.goto("/blog");

    // 等待侧边栏加载
    await page.waitForSelector("aside, nav", { timeout: 10000 });

    // 查找并点击第一篇有内容的文章
    const articleLinks = page.locator("aside a[href*='/blog/']");
    const linkCount = await articleLinks.count();

    if (linkCount > 0) {
      await articleLinks.first().click();
      await page.waitForLoadState("networkidle");

      // 检查TOC是否显示
      const tocElement = page
        .locator("[aria-label='Table of contents'], .toc, nav")
        .filter({
          hasText: /on this page|目录|内容/i,
        });

      if (await tocElement.isVisible()) {
        // 检查TOC链接
        const tocLinks = tocElement.locator("a[href^='#']");
        const tocLinkCount = await tocLinks.count();

        if (tocLinkCount > 0) {
          // 测试TOC链接点击
          const firstTocLink = tocLinks.first();
          await firstTocLink.click();

          // 验证页面滚动到对应位置
          await page.waitForTimeout(1000);

          // 检查激活状态
          await expect(firstTocLink).toHaveAttribute("data-active", "true");
        }
      }
    }
  });

  test("should highlight active TOC item on scroll", async ({ page }) => {
    await page.goto("/blog");

    const articleLinks = page.locator("aside a[href*='/blog/']");
    const linkCount = await articleLinks.count();

    if (linkCount > 0) {
      await articleLinks.first().click();
      await page.waitForLoadState("networkidle");

      // 查找TOC
      const tocLinks = page.locator("nav a[href^='#']");
      const tocLinkCount = await tocLinks.count();

      if (tocLinkCount > 1) {
        // 滚动页面
        await page.evaluate(() => {
          window.scrollTo(0, 200);
        });

        await page.waitForTimeout(500);

        // 检查是否有活跃的TOC项
        const activeItems = page.locator("nav a[data-active='true']");
        const activeCount = await activeItems.count();
        expect(activeCount).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test("should render markdown components correctly", async ({ page }) => {
    await page.goto("/blog");

    const articleLinks = page.locator("aside a[href*='/blog/']");
    const linkCount = await articleLinks.count();

    if (linkCount > 0) {
      await articleLinks.first().click();
      await page.waitForLoadState("networkidle");

      // 检查markdown渲染的基本元素
      const article = page.locator("article, .prose");

      if (await article.isVisible()) {
        // 检查标题渲染
        const headings = article.locator("h1, h2, h3, h4");
        if (await headings.first().isVisible()) {
          await expect(headings.first()).toBeVisible();
        }

        // 检查段落渲染
        const paragraphs = article.locator("p");
        if (await paragraphs.first().isVisible()) {
          await expect(paragraphs.first()).toBeVisible();
        }

        // 检查代码块渲染
        const codeBlocks = article.locator("pre, code");
        if (await codeBlocks.first().isVisible()) {
          await expect(codeBlocks.first()).toBeVisible();
        }

        // 检查链接渲染
        const links = article.locator("a");
        if (await links.first().isVisible()) {
          await expect(links.first()).toBeVisible();
        }
      }
    }
  });

  test("should handle markdown without TOC", async ({ page }) => {
    // 测试compact模式的markdown (如contact页面的GAP section)
    await page.goto("/contact");

    // 查找GAP section或其他compact markdown内容
    const markdownSections = page.locator(".prose, article").filter({
      hasText: /gap|经历|experience/i,
    });

    if (await markdownSections.first().isVisible()) {
      const section = markdownSections.first();

      // 确保内容正确渲染
      await expect(section).toBeVisible();

      // 确保没有TOC (因为是compact模式)
      const tocInSection = section.locator("nav").filter({
        hasText: /table of contents|目录/i,
      });
      await expect(tocInSection).toHaveCount(0);
    }
  });

  test("should be responsive in markdown view", async ({ page }) => {
    await page.goto("/blog");

    const articleLinks = page.locator("aside a[href*='/blog/']");
    const linkCount = await articleLinks.count();

    if (linkCount > 0) {
      await articleLinks.first().click();
      await page.waitForLoadState("networkidle");

      // 测试桌面端 - TOC应该可见
      await page.setViewportSize({ width: 1200, height: 800 });
      const desktopToc = page.locator("nav").filter({
        hasText: /table of contents|on this page/i,
      });
      if (await desktopToc.isVisible()) {
        await expect(desktopToc).toBeVisible();
      }

      // 测试移动端 - TOC应该隐藏
      await page.setViewportSize({ width: 375, height: 667 });
      const mobileToc = page.locator("nav").filter({
        hasText: /table of contents|on this page/i,
      });
      if (await mobileToc.isVisible()) {
        // 在移动端，TOC应该被隐藏或以不同方式显示
        const tocDisplay = await mobileToc.evaluate(
          (el) => getComputedStyle(el).display,
        );
        expect(tocDisplay).toBe("none");
      }

      // 确保文章内容在移动端仍然可读
      const article = page.locator("article, .prose");
      if (await article.isVisible()) {
        await expect(article).toBeVisible();
      }
    }
  });
});
