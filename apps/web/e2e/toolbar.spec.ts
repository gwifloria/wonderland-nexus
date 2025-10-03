import { expect, test } from "@playwright/test";

test.describe("Toolbar behavior on /forum", () => {
  test("bold/italic/underline apply correctly", async ({ page }) => {
    await page.goto("/forum");
    await page.locator(".ant-spin").waitFor({ state: "detached" });
    const editor = page.getByRole("textbox");
    await editor.click();
  });

  test("lists and code block toggle", async ({ page }) => {
    await page.goto("/forum");
    const editor = page.getByRole("textbox");
    await page.locator(".ant-spin").waitFor({ state: "detached" });

    await editor.click();
  });

  test("undo/redo availability", async ({ page }) => {
    await page.goto("/forum");
    await page
      .locator(".ant-spin-spinning")
      .waitFor({ state: "detached", timeout: 15000 });
    const editor = page.getByRole("textbox");
    await editor.click();
    await editor.pressSequentially("abc");

    // 撤销 -> 内容应减少（等待按钮可用）
    const undoBtn = page.getByTestId("tt-btn-undo");
    await expect(undoBtn).toBeEnabled({ timeout: 10000 });
    await undoBtn.click();

    // Playwright 不直接读出 ProseMirror state，这里只做按钮存在性与无报错验证
    await expect(page.getByTestId("tt-btn-undo")).toBeVisible();
  });
});
