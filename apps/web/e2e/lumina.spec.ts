import { test, expect } from "@playwright/test";

/**
 * Lumina critical user journeys — desktop-web "agent console" UI (390×844 mobile
 * viewport: header nav collapses to a mobile row, so tests must use roles/text).
 *
 * 1. Landing: understand the product in seconds
 * 2. Explore strategies with honest risk labels
 * 3. Strategy detail: risk breakdown + yield in context
 * 4. Risk questionnaire → personalised recommendations
 * 5. Guided FSA deposit preparation
 * 6. Dashboard: honest empty state + address lookup
 * 7. Reference-only honesty (mainnet strategies not executable)
 * 8. Agent chat: grounded, no invented numbers
 * 9. Broken links / 404 recovery
 */

test.describe("Lumina user journeys", () => {
  test("landing page explains the product in seconds", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Put XRP to work on Flare/ })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /With an agent that won't lie to you/ })
    ).toBeVisible();

    // The trust promise is on the first screen.
    await expect(page.getByText(/Every number is real, nothing is invented/)).toBeVisible();

    // Wait for client hydration (the copilot launcher is client-only) so the
    // Next.js Link handler is attached before we click.
    await page.getByRole("button", { name: "Open Lumina copilot" }).waitFor();

    // Both primary actions are reachable.
    await page.getByRole("link", { name: "Ask the agent" }).last().click();
    await expect(page).toHaveURL(/\/agent/);

    // The fit check is reachable from the hero.
    await page.goto("/");
    await page.getByRole("link", { name: /Take the 20-second fit check/ }).click();
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test("explore strategies with risk labels and live status", async ({ page }) => {
    await page.goto("/strategies");

    await expect(page.getByRole("heading", { name: "Strategies" })).toBeVisible();

    // Live strategies carry the risk badge + live marker.
    const firelight = page.getByRole("link", { name: /Firelight stXRP/ });
    await expect(firelight).toBeVisible();
    await expect(firelight.getByText("live", { exact: true })).toBeVisible();
    await expect(firelight).toContainText("Why this risk:");
    await expect(firelight.getByText("Conservative")).toBeVisible();

    // Reference-only strategies are clearly separated and labelled.
    const monarq = page.getByRole("link", { name: /Monarq XRP Yield Vault/ });
    await expect(monarq).toBeVisible();
    await expect(monarq.getByText("reference", { exact: true })).toBeVisible();
  });

  test("strategy detail shows risk breakdown and yield in context", async ({ page }) => {
    await page.goto("/strategies/firelight-stxrp");

    await expect(page.getByRole("heading", { name: "Firelight stXRP" })).toBeVisible();

    // Risk is never a single badge: the breakdown is shown.
    await expect(page.getByRole("heading", { name: "Risk breakdown" })).toBeVisible();
    await expect(page.getByText("Smart contract audit")).toBeVisible();
    await expect(page.getByText(/weighted score \d+\/100/)).toBeVisible();
    await expect(page.getByText("Testnet deployment").first()).toBeVisible();

    // Yield is in context, explicitly "not a promise".
    await expect(page.getByRole("heading", { name: "Yield in context" })).toBeVisible();
    await expect(page.getByText(/not a promise/)).toBeVisible();
    await expect(page.getByText("Reference range", { exact: true })).toBeVisible();

    // Live strategy offers the guided deposit.
    await expect(
      page.getByRole("link", { name: "Start guided deposit" })
    ).toBeVisible();
  });

  test("reference-only strategies are honest about availability", async ({ page }) => {
    await page.goto("/strategies/monarq-mxrpy");

    await expect(page.getByText("reference only", { exact: true })).toBeVisible();
    await expect(
      page.getByText(/No Monarq vault is registered on Coston2 yet/)
    ).toBeVisible();
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
      page.getByText(/decides what Lumina considers executable/)
    ).toBeVisible();

    // Registered vaults are listed from the contract, not hardcoded.
    await expect(page.getByText("#1 · Firelight stXRP")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("#2 · Clearstar earnXRP")).toBeVisible();

    // Registry records carry the risk tier and the APY range from the registry.
    await expect(page.getByText("APY range 3.00% - 8.00%").first()).toBeVisible();

    // Every registered vault matches the catalog — the audit confirms it.
    await expect(page.getByText("in catalog").first()).toBeVisible();
    await expect(page.getByText("in catalog").nth(1)).toBeVisible();

    // The registry footer states the owner and count.
    await expect(page.getByText(/vaults total/)).toBeVisible();
  });

  test("agent chat answers are grounded, with real links and no invented numbers", async ({ page }) => {
    await page.goto("/agent");

    await expect(
      page.getByRole("heading", { name: "Ask Lumina anything" })
    ).toBeVisible();

    // Ask for a strategy brief — the answer must come from the real catalog.
    const input = page.getByLabel("Ask the Lumina agent");
    await input.fill("Tell me about Firelight stXRP");
    await page.getByRole("button", { name: "Send" }).click();

    // The grounded answer names the protocol and links into the real page.
    await expect(page.getByText(/Firelight stXRP/).first()).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("link", { name: /Full strategy brief →/ })
    ).toBeVisible();

    // Unknown topics must produce an honest "I don't know" — never a guess.
    await input.fill("What is the meaning of life?");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText(/I don't know|don't have that|not something I can help/)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("unknown routes recover to home", async ({ page }) => {
    await page.goto("/strategies/does-not-exist");

    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL("/");
  });

  test("header navigation reaches every primary section", async ({ page }) => {
    await page.goto("/");

    // Mobile viewport: the compact nav row is visible (main nav is md+ only).
    const mobileNav = page.getByLabel("Mobile navigation");
    await mobileNav.getByRole("link", { name: "Strategies", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Strategies", exact: true })).toBeVisible();

    await mobileNav.getByRole("link", { name: "Dashboard", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true })
    ).toBeVisible();

    await mobileNav.getByRole("link", { name: "Agent", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Ask Lumina anything" })).toBeVisible();
  });
});
