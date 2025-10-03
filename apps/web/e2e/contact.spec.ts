import { test, expect } from "@playwright/test";

test.describe("/contact - Contact Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("should render contact page with proper title", async ({ page }) => {
    await expect(page).toHaveTitle(/contact|Contact/i);
  });

  test("should display hero section", async ({ page }) => {
    const heroSection = page
      .locator("[data-testid='hero-section'], .hero-section, h1")
      .first();
    await expect(heroSection).toBeVisible();
  });

  test("should display personal info section", async ({ page }) => {
    const personalSection = page
      .getByText(/个人信息|Personal|联系方式|Contact/i)
      .first();
    await expect(personalSection).toBeVisible();
  });

  test("should display skills section", async ({ page }) => {
    const skillsSection = page.getByText(/技能|Skills|专业技能/i).first();
    await expect(skillsSection).toBeVisible();
  });

  test("should display work experience section", async ({ page }) => {
    const workSection = page
      .getByText(/工作经历|Work|Experience|职业经历/i)
      .first();
    await expect(workSection).toBeVisible();
  });

  test("should display education section", async ({ page }) => {
    const eduSection = page.getByText(/教育背景|Education|学历/i).first();
    await expect(eduSection).toBeVisible();
  });

  test("should display journey section with GapMarkdown", async ({ page }) => {
    const journeySection = page
      .getByText(/历程|Journey|成长|个人经历/i)
      .first();
    await expect(journeySection).toBeVisible();
  });

  test("should display print button", async ({ page }) => {
    const printButton = page
      .locator("button")
      .filter({ hasText: /打印|Print/i });
    await expect(printButton).toBeVisible();
  });

  test("should trigger print dialog when print button is clicked", async ({
    page,
  }) => {
    // Listen for print event
    let printTriggered = false;
    await page.addInitScript(() => {
      window.print = () => {
        (window as any).printTriggered = true;
      };
    });

    const printButton = page
      .locator("button")
      .filter({ hasText: /打印|Print/i });
    await printButton.click();

    // Check if print was triggered
    const triggered = await page.evaluate(() => (window as any).printTriggered);
    expect(triggered).toBe(true);
  });

  test("should have responsive design", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const mainContent = page.locator("#about, main").first();
    await expect(mainContent).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(mainContent).toBeVisible();
  });

  test("should have proper paper container styling", async ({ page }) => {
    const paperContainer = page
      .locator(".paper-container, [class*='paper']")
      .first();
    await expect(paperContainer).toBeVisible();
  });

  test("should show scrapbook cards with tape variants", async ({ page }) => {
    const scrapbookCards = page.locator(
      ".scrapbook-card, [class*='scrapbook'], [class*='tape']",
    );
    await expect(scrapbookCards.first()).toBeVisible();
  });

  test("should hide journey section when printing", async ({ page }) => {
    // Add print media query check
    await page.addStyleTag({
      content: `
        @media print {
          .print\\:hidden {
            display: none !important;
          }
        }
      `,
    });

    // Emulate print media
    await page.emulateMedia({ media: "print" });

    const journeySection = page.locator("[class*='print:hidden']").first();
    await expect(journeySection).toHaveCSS("display", "none");
  });
});
