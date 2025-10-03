import { expect, test } from "@playwright/test";

test.describe("Lab page", () => {
  test("should load lab page and display experiments", async ({ page }) => {
    await page.goto("/lab");

    // 检查页面标题
    await expect(page).toHaveTitle(/.*Lab.*/);

    // 检查页面加载完成
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /lab|实验/i })
        .first(),
    ).toBeVisible();

    // 检查是否有实验项目
    const experimentCards = page.locator("[data-testid='lab-item'], .lab-card");

    // 如果有实验项目，测试交互
    const count = await experimentCards.count();
    if (count > 0) {
      // 测试第一个实验项目的点击
      await experimentCards.first().click();

      // 根据实际情况调整期望，可能是跳转到详情页或展开内容
      await page.waitForTimeout(1000);
    }
  });

  test("should have working add experiment functionality (if admin)", async ({
    page,
  }) => {
    await page.goto("/lab");

    // 检查是否有添加实验的按钮（可能只对管理员显示）
    const addButton = page
      .locator("button")
      .filter({ hasText: /add|添加|新增/i });

    if (await addButton.isVisible()) {
      await addButton.click();

      // 检查是否出现添加表单或模态框
      await expect(page.locator("form, [role='dialog']")).toBeVisible();
    }
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/lab");

    // 检查移动端布局
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /lab|实验/i })
        .first(),
    ).toBeVisible();

    // 检查卡片在移动端的响应式布局
    const experimentCards = page.locator("[data-testid='lab-item'], .lab-card");
    if (await experimentCards.first().isVisible()) {
      const firstCard = experimentCards.first();
      const boundingBox = await firstCard.boundingBox();

      // 确保卡片宽度适合移动端
      expect(boundingBox?.width).toBeLessThan(400);
    }
  });
});
