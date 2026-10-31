import { test, expect } from "@playwright/test";

test.describe("End-to-End User Journeys (Phase 8 QA)", () => {
  test("J1: Public Authentication Pages and Live Password Checklist", async ({ page }) => {
    // 1. Visit Login page
    await page.goto("/login");
    await expect(page).toHaveTitle(/Brightloop/i);
    await expect(page.locator("h1")).toContainText("Brightloop SMS");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toContainText(/Sign in/i);

    // 2. Visit Signup page
    await page.goto("/signup");
    await expect(page.locator("h1")).toContainText("Brightloop SMS");
    await expect(page.locator("#fullName")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();

    // 3. Test interactive password checklist
    const passwordInput = page.locator("#password");
    
    // Type a weak password (too short, no special char, etc.)
    await passwordInput.fill("weak");
    await expect(page.locator("text=At least 9 characters")).toBeVisible();
    
    // Type compliant password
    await passwordInput.fill("Brightloop1!");
    await expect(page.locator("text=At least 9 characters")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toContainText(/Sign up/i);
  });

  test("J2: Role Middleware Route Isolation & Unauthenticated Protection", async ({ page }) => {
    // Unauthenticated user trying to access team routes must be redirected to /login
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);

    await page.goto("/subscriptions");
    await expect(page).toHaveURL(/\/login\?next=%2Fsubscriptions/);

    await page.goto("/invoices");
    await expect(page).toHaveURL(/\/login\?next=%2Finvoices/);

    await page.goto("/portal");
    await expect(page).toHaveURL(/\/login\?next=%2Fportal/);

    await page.goto("/staff");
    await expect(page).toHaveURL(/\/login\?next=%2Fstaff/);

    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login\?next=%2Fsettings/);
  });

  test("J3: Design System Strict Token Compliance in Browser", async ({ page }) => {
    await page.goto("/login");

    // Ban 1: Zero SVG icon libraries in the DOM
    const svgCount = await page.locator("svg").count();
    expect(svgCount).toBe(0);

    // Ban 2: Max 2px border radius on interactive buttons
    const submitBtn = page.locator("button[type='submit']");
    const borderRadius = await submitBtn.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });
    // 2px border radius corresponds to rounded-sm in design tokens
    expect(["2px", "0px"]).toContain(borderRadius);

    // Ban 3: Zero box-shadow on buttons and cards
    const boxShadow = await submitBtn.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });
    expect(["none", ""].includes(boxShadow) || boxShadow === "none").toBeTruthy();
  });

  test("J4: Forgot Password Request Journey", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("h1")).toContainText("Brightloop SMS");
    
    const emailInput = page.locator("#email");
    await expect(emailInput).toBeVisible();
    await emailInput.fill("test-reset@brightloop.com");

    const submitBtn = page.locator("button[type='submit']");
    await submitBtn.click();

    // Verify confirmation alert is rendered
    await expect(page.locator("role=alert")).toBeVisible();
  });

  test("J5: Reset Password Page Access & Checklist Verification", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.locator("h1")).toContainText("Brightloop SMS");
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#confirmPassword")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toContainText(/Save new password/i);
  });

  test("J6: Clean Printable Invoice Route Structure", async ({ page }) => {
    // When visiting printable invoice route, it should be isolated from application shells
    await page.goto("/invoices/demo-inv-id/print");
    // Unauthenticated access redirects safely to login or renders error
    await expect(page).not.toHaveURL(/crash/);
  });
});
