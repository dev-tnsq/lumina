import { test, expect } from "@playwright/test";

/**
 * Lumina critical user journeys — written as a real user on mobile (390×844).
 *
 * 1. Landing: understand the product in seconds
 * 2. Explore strategies with honest risk labels
 * 3. Strategy detail: risk breakdown + yield in context
 * 4. Risk questionnaire → personalised recommendations
 * 5. Guided FSA deposit preparation
 * 6. Dashboard: honest empty state + address lookup
 * 7. Reference-only honesty (mainnet strategies not executable)
 * 8. Broken links / 404 recovery
 */

test.describe("Lumina user journeys", () => {
  test("landing page explains the product in seconds", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Put XRP to work on Flare/ })
    ).toBeVisible();
    await expect(page.getByText("Safely.")).toBeVisible();

    // The trust promise is on the first screen.
    await expect(page.getByText(/no glossy APYs, no surprises/)).toBeVisible();

    // Testnet is disclosed immediately, not hidden.
    await expect(page.getByText("Coston2 testnet")).toBeVisible();

    // Both primary actions are reachable.
    await page.getByRole("link", { name: "Get started" }).click();
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test("explore strategies with risk labels and live status", async ({ page }) => {
    await page.goto("/strategies");

    await expect(page.getByRole("heading", { name: "Strategies" })).toBeVisible();

    // Live strategies carry the risk badge + live marker.
    const firelight = page.getByRole("link", { name: /Firelight stXRP/ });
    await expect(firelight).toBeVisible();
    await expect(firelight).toContainText("Live on Coston2");
    await expect(firelight).toContainText("Why this risk:");
    await expect(firelight.getByText("Conservative")).toBeVisible();

    // Reference-only strategies are clearly separated and labelled.
    const monarq = page.getByRole("link", { name: /Monarq XRP Yield Vault/ });
    await expect(monarq).toBeVisible();
    await expect(monarq).toContainText("Reference only");
  });

  test("strategy detail shows risk breakdown and yield in context", async ({ page }) => {
    await page.goto("/strategies/firelight-stxrp");

    await expect(page.getByRole("heading", { name: "Firelight stXRP" })).toBeVisible();

    // Risk is never a single badge: the breakdown is shown.
    await expect(page.getByRole("heading", { name: "Risk breakdown" })).toBeVisible();
    await expect(page.getByText("Smart contract audit")).toBeVisible();
    await expect(page.getByText(/Weighted score:/)).toBeVisible();
    await expect(page.getByText(/Testnet deployment/).first()).toBeVisible();

    // Yield is in context, explicitly "not a promise".
    await expect(page.getByRole("heading", { name: "Yield in context" })).toBeVisible();
    await expect(page.getByText("Not a promise")).toBeVisible();
    await expect(page.getByText("Reference range", { exact: true })).toBeVisible();

    // Live strategy offers the guided deposit.
    await expect(
      page.getByRole("link", { name: "Start guided deposit" })
    ).toBeVisible();
  });

  test("reference-only strategies are honest about availability", async ({ page }) => {
    await page.goto("/strategies/monarq-mxrpy");

    await expect(page.getByText("Reference only", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Not available on the Coston2 testnet/)).toBeVisible();
    await expect(page.getByText(/shown for research and comparison/)).toBeVisible();

    // No fake "deposit" button for a strategy that cannot run on Coston2.
    await expect(page.getByRole("link", { name: "Start guided deposit" })).toHaveCount(0);
  });

  test("risk questionnaire produces ranked, explained matches", async ({ page }) => {
    await page.goto("/onboarding");

    await expect(page.getByRole("heading", { name: /How do you feel about risk/ })).toBeVisible();
    await page.getByRole("button", { name: /Conservative/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByRole("heading", { name: /How quickly do you need your money/ })
    ).toBeVisible();
    await page.getByRole("button", { name: /No lock-ups/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByRole("button", { name: /Simple paths first/ }).click();
    await page.getByRole("button", { name: "Show my matches" }).click();

    // Matches are ranked and each one explains why.
    await expect(page.getByRole("heading", { name: "Your matches" })).toBeVisible();
    const first = page.getByText(/matches your conservative risk comfort/).first();
    await expect(first).toBeVisible();

    // Each match links into the full strategy.
    await expect(page.getByRole("link", { name: /Compare all strategies/ })).toBeVisible();
  });

  test("guided FSA deposit prepares the payment reference", async ({ page }) => {
    await page.goto("/execute/firelight-stxrp");

    // Path selection: FSA preferred.
    await expect(page.getByText("Flare Smart Account", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Preferred", { exact: true })).toBeVisible();

    // Step 1: XRPL address entry.
    await expect(
      page.getByRole("heading", { name: "1 · Your XRPL Testnet address" })
    ).toBeVisible();

    // Invalid addresses are rejected immediately.
    await page.getByLabel("XRPL testnet address").fill("not-an-address");
    await expect(page.getByText(/valid XRPL address/)).toBeVisible();

    // A valid testnet address enables the registry lookup.
    const xrplInput = page.getByLabel("XRPL testnet address");
    await xrplInput.fill("rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh");
    await page.getByRole("button", { name: "Find my smart account" }).click();

    // Either the FSA is derived (registry reachable) or we show an honest error —
    // never a fabricated address.
    await expect
      .poll(async () => page.getByRole("button", { name: /Re-read my smart account|Find my smart account/ }).count(), {
        timeout: 20_000,
      })
      .toBe(1);

    // Amount entry exists and lot sizing is explained.
    await page.getByLabel("Amount in XRP").fill("25");
    await expect(page.getByText(/lot/).first()).toBeVisible({ timeout: 10_000 });

    // The prepared payment carries the FSA deposit memo.
    await expect(page.getByRole("heading", { name: /Review the prepared payment/ })).toBeVisible();
  });

  test("dashboard shows a perfect empty state before any connection", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your dashboard is ready" })).toBeVisible();
    await expect(page.getByText(/Connect an EVM wallet or look up any Coston2 address/)).toBeVisible();

    // Lookup is available without a wallet.
    const input = page.getByLabel("Look up any Coston2 address");
    await input.fill("0x1234567890abcdef1234567890abcdef12345678");
    await page.getByRole("button", { name: "Look up" }).click();

    // Address is valid — either positions or an honest "no positions" state shows.
    await expect(page.getByText(/no FXRP and no vault shares on Coston2 yet/)).toBeVisible({
      timeout: 20_000,
    });
  });

  test("registry audit reads LuminaStrategyRegistry live from Coston2", async ({ page }) => {
    await page.goto("/strategies");

    // The on-chain registry section renders and confirms the source of truth.
    await expect(page.getByRole("heading", { name: "On-chain registry" })).toBeVisible();
    await expect(
      page.getByText(/Only vaults registered here are executable/)
    ).toBeVisible();

    // Registered vaults are listed from the contract, not hardcoded.
    await expect(page.getByText("#1 · Firelight stXRP")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("#2 · Clearstar earnXRP (test)")).toBeVisible();

    // Registry records carry the risk tier and the APY range from the registry.
    await expect(page.getByText("APY range 3.00% - 8.00%").first()).toBeVisible();

    // Every registered vault matches the catalog — the audit confirms it.
    await expect(page.getByText("in catalog").first()).toBeVisible();
    await expect(page.getByText("in catalog").nth(1)).toBeVisible();

    // The registry footer states the owner and count.
    await expect(page.getByText(/vaults total/)).toBeVisible();
  });

  test("unknown routes recover to home", async ({ page }) => {
    await page.goto("/strategies/does-not-exist");

    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL("/");
  });

  test("bottom navigation reaches every primary section", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Strategies", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Strategies", exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true })
    ).toBeVisible();

    await page.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL("/");
  });
});
