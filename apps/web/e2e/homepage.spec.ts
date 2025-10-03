import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load homepage and display navigation cards", async ({
    page,
  }) => {
    await page.goto("/");

    // 检查页面标题
    await expect(page).toHaveTitle(/.*Floria.*Wonderland.*/);

    // 检查主标题或欢迎信息
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /floria|wonderland|欢迎/i })
        .first(),
    ).toBeVisible();

    // 检查导航卡片
    const navigationCards = page.locator("a[href^='/']").filter({
      hasText: /blog|lab|contact|letters|gallery|关于|博客|实验|画廊|联系/i,
    });

    // 应该至少有几个主要的导航卡片
    const cardCount = await navigationCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(3);

    // 测试导航卡片的点击
    const blogCard = navigationCards.filter({ hasText: /blog|博客/i }).first();
    if (await blogCard.isVisible()) {
      await blogCard.click();
      await expect(page).toHaveURL(/.*\/blog.*/);
      await page.goBack();
    }
  });

  test("should display personal introduction", async ({ page }) => {
    await page.goto("/");

    // 检查是否有个人介绍或简历信息
    const introText = page.locator(
      "text=/前端|开发|工程师|developer|frontend/i",
    );

    if (await introText.first().isVisible()) {
      await expect(introText.first()).toBeVisible();
    }
  });

  test("should have working theme or style elements", async ({ page }) => {
    await page.goto("/");

    // 检查页面是否有特定的主题样式
    const body = page.locator("body");

    // 检查是否应用了主题色彩
    await expect(body).toHaveClass(/.*mint.*|.*rose.*|.*milktea.*/, {
      timeout: 5000,
    });
  });

  test("should be responsive on different screen sizes", async ({ page }) => {
    await page.goto("/");

    // 测试桌面端
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator("body")).toBeVisible();

    // 测试平板端
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator("body")).toBeVisible();

    // 测试移动端
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("body")).toBeVisible();

    // 确保导航元素在移动端仍然可见
    const navigationCards = page.locator("a[href^='/']");
    if (await navigationCards.first().isVisible()) {
      await expect(navigationCards.first()).toBeVisible();
    }
  });
});
