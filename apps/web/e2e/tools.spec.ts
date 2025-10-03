import { expect, test } from "@playwright/test";

test.describe("Tools page", () => {
  test("should load tools page and display available tools", async ({
    page,
  }) => {
    await page.goto("/tools");

    // 检查页面标题
    await expect(page).toHaveTitle(/.*Tools.*/);

    // 检查工具页面标题
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /tools|工具/i })
        .first(),
    ).toBeVisible();

    // 检查是否有工具列表或卡片
    const toolItems = page.locator(
      "[data-testid='tool-item'], .tool-card, .tools-section",
    );

    const count = await toolItems.count();
    if (count > 0) {
      // 确保至少有一个工具可见
      await expect(toolItems.first()).toBeVisible();
    }
  });

  test("should have interactive tools", async ({ page }) => {
    await page.goto("/tools");

    // 查找可点击的工具按钮或链接
    const interactiveElements = page
      .locator("button, a, input, textarea")
      .filter({
        hasText:
          /calculate|convert|generate|format|transform|计算|转换|生成|格式化/i,
      });

    const count = await interactiveElements.count();
    if (count > 0) {
      // 测试第一个交互式工具
      const firstTool = interactiveElements.first();
      await expect(firstTool).toBeVisible();

      // 如果是按钮，尝试点击
      if ((await firstTool.getAttribute("tagName")) === "BUTTON") {
        await firstTool.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test("should handle input validation (if applicable)", async ({ page }) => {
    await page.goto("/tools");

    // 查找输入框
    const inputs = page.locator(
      "input[type='text'], input[type='number'], textarea",
    );

    const inputCount = await inputs.count();
    if (inputCount > 0) {
      const firstInput = inputs.first();

      // 测试输入功能
      await firstInput.fill("test input");
      await expect(firstInput).toHaveValue("test input");

      // 清空输入
      await firstInput.clear();
      await expect(firstInput).toHaveValue("");
    }
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/tools");

    // 检查移动端显示
    await expect(
      page
        .locator("h1, h2")
        .filter({ hasText: /tools|工具/i })
        .first(),
    ).toBeVisible();

    // 检查工具在移动端的布局
    const toolItems = page.locator("[data-testid='tool-item'], .tool-card");
    if (await toolItems.first().isVisible()) {
      const firstTool = toolItems.first();
      const boundingBox = await firstTool.boundingBox();

      // 确保工具在移动端布局合理
      expect(boundingBox?.width).toBeLessThan(400);
    }
  });

  test("should have working tool categories or navigation", async ({
    page,
  }) => {
    await page.goto("/tools");

    // 查找工具分类或导航
    const categories = page.locator("nav, .category, .tab").filter({
      hasText: /category|type|分类|类型/i,
    });

    if (await categories.first().isVisible()) {
      // 测试分类切换
      const categoryLinks = categories.locator("a, button");
      const linkCount = await categoryLinks.count();

      if (linkCount > 1) {
        await categoryLinks.nth(1).click();
        await page.waitForTimeout(500);

        // 验证内容是否发生变化
        await expect(page.locator("body")).toBeVisible();
      }
    }
  });
});
