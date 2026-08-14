import { test, expect } from "@playwright/test";

/**
 * Lumina full user-journey suite — every possible user action, on a 390×844
 * mobile-first viewport (header nav collapses to a mobile row, so tests use
 * roles/text selectors).
 *
 * Agent coverage is Gemini-only (no fallback engine): when the server reports
 * `configured: false`, the deep Gemini journeys are skipped and the honest
 * "not configured" path is asserted instead — the product never fabricates an
 * answer either way.
 */

const DEPLOYER = "0x62925c2f574Bbf0781981E8F5D2cA2C02Dcb3f64"; // has real positions on Coston2
const XRPL_TESTNET_ADDR = "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh";

let geminiConfigured = false;

test.beforeAll(async ({ request }) => {
  try {
    const res = await request.get("/api/agent");
    if (res.ok()) {
      const status = await res.json();
      geminiConfigured = Boolean(status.configured);
    }
  } catch {
    geminiConfigured = false;
  }
});

test.describe("Landing", () => {
  test("explains the product in seconds and reaches every CTA", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Put XRP to work on Flare/ })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /With an agent that won't lie to you/ })
    ).toBeVisible();
    await expect(page.getByText(/Every number is real, nothing is invented/)).toBeVisible();

    // How-it-works steps frame the whole ecosystem.
    for (const step of ["01 / Understand", "02 / Execute", "03 / Verify"]) {
      await expect(page.getByText(step, { exact: true })).toBeVisible();
    }

    // Live telemetry strip shows the executable vaults with real risk labels.
    await expect(page.getByText("Live strategies · on-chain right now")).toBeVisible();

    // Wait for hydration, then hit the primary actions.
    await page.getByRole("button", { name: "Open Lumina copilot" }).waitFor();
    await page.getByRole("link", { name: "Ask the agent" }).last().click();
    await expect(page).toHaveURL(/\/agent/, { timeout: 30_000 });

    await page.goto("/");
    await page.getByRole("link", { name: /Take the 20-second fit check/ }).click();
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 30_000 });
  });

  test("floating copilot launcher opens a working chat on any page", async ({ page }) => {
    await page.goto("/");

    const launcher = page.getByRole("button", { name: "Open Lumina copilot" });
    await launcher.waitFor();
    await launcher.click();

    // Compact console opens with the copilot header and an input.
    await expect(page.getByText("Lumina copilot")).toBeVisible();
    await expect(page.locator('[data-role="agent-message"]').first()).toBeVisible();

    const input = page.getByLabel("Ask the Lumina agent");
    await input.fill("What is this?");
    await page.getByRole("button", { name: "Send" }).click();

    // Either a real Gemini reply or the honest not-configured error — never silence.
    if (!geminiConfigured) {
      await expect(page.getByText(/Agent is not configured/)).toBeVisible({ timeout: 20_000 });
    } else {
      await expect(page.locator('[data-role="agent-message"]')).toHaveCount(2, { timeout: 60_000 });
    }
    await expect(page.getByLabel("Ask the Lumina agent")).toHaveValue("");

    // Toggle closes it.
    await page.getByRole("button", { name: "Close Lumina copilot" }).click();
    await expect(page.getByLabel("Ask the Lumina agent")).toHaveCount(0);
  });

  test("trust card links into the registry audit", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /See the registry audit/ }).click();
    await expect(page).toHaveURL(/\/strategies/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Strategies", exact: true })).toBeVisible();
  });
});

test.describe("Strategies catalog", () => {
  test("cards carry risk labels, live status and honest reference markers", async ({ page }) => {
    await page.goto("/strategies");

    await expect(page.getByRole("heading", { name: "Strategies" })).toBeVisible();

    const firelight = page.getByRole("link", { name: /Firelight stXRP/ });
    await expect(firelight).toBeVisible();
    await expect(firelight.getByText("live", { exact: true })).toBeVisible();
    await expect(firelight.getByText("Conservative")).toBeVisible();
    await expect(firelight).toContainText("Why this risk:");

    const monarq = page.getByRole("link", { name: /Monarq XRP Yield Vault/ });
    await expect(monarq).toBeVisible();
    await expect(monarq.getByText("reference", { exact: true })).toBeVisible();

    // Live strategies show the on-chain publisher verification badge.
    await expect(firelight.getByText("✓ verified", { exact: false })).toBeVisible();
  });

  test("compare table shows every live strategy side by side with real data", async ({ page }) => {
    await page.goto("/strategies");

    await expect(page.getByRole("heading", { name: "Compare, side by side" })).toBeVisible();

    // Rows hydrate from the live registry read.
    const table = page.locator("#compare table");
    await expect(table).toBeVisible({ timeout: 30_000 });

    await expect(table.getByRole("cell", { name: /Firelight stXRP/ })).toBeVisible();
    await expect(table.getByRole("cell", { name: /Clearstar XRP Yield Vault/ })).toBeVisible();

    // Real columns: publisher verification, risk, yield, live TVL, path.
    await expect(table.getByText("✓ verified").first()).toBeVisible();
    await expect(table.getByText("Conservative").first()).toBeVisible();
    await expect(table.getByText("Balanced").first()).toBeVisible();
    await expect(table.getByText("fsa / evm").first()).toBeVisible();

    // Every row links into its full brief.
    await expect(table.getByRole("link", { name: "Brief →" }).first()).toHaveAttribute(
      "href",
      /\/strategies\//
    );
  });

  test("registry audit reads LuminaStrategyRegistry live from Coston2", async ({ page }) => {
    await page.goto("/strategies");

    await expect(page.getByRole("heading", { name: "On-chain registry" })).toBeVisible();
    await expect(page.getByText(/decides what Lumina considers executable/)).toBeVisible();

    await expect(page.getByText("#1 · Firelight stXRP")).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText("#2 · Clearstar earnXRP")).toBeVisible();
    await expect(page.getByText("APY range 3.00% - 8.00%").first()).toBeVisible();
    await expect(page.getByText("in catalog").first()).toBeVisible();
    await expect(page.getByText("in catalog").nth(1)).toBeVisible();
    await expect(page.getByText(/vaults total/)).toBeVisible();
  });
});

test.describe("Strategy detail", () => {
  test("live strategy shows risk breakdown, yield in context and the publisher", async ({ page }) => {
    await page.goto("/strategies/firelight-stxrp");

    await expect(page.getByRole("heading", { name: "Firelight stXRP" })).toBeVisible();

    // Risk is never a single badge.
    await expect(page.getByRole("heading", { name: "Risk breakdown" })).toBeVisible();
    await expect(page.getByText("Smart contract audit")).toBeVisible();
    await expect(page.getByText(/weighted score \d+\/100/)).toBeVisible();
    await expect(page.getByText(/Recently deployed/).first()).toBeVisible();

    // Yield is in context, explicitly "not a promise".
    await expect(page.getByRole("heading", { name: "Yield in context" })).toBeVisible();
    await expect(page.getByText("not a promise", { exact: true })).toBeVisible();
    await expect(page.getByText("Reference range", { exact: true })).toBeVisible();

    // Who operates this — verified publisher block.
    await expect(page.getByText("Who operates this")).toBeVisible();
    await expect(page.getByText("✓ verified on-chain")).toBeVisible();
    await expect(page.getByText("@firelight")).toBeVisible();

    // Live strategy offers the guided deposit and the agent.
    await expect(page.getByRole("link", { name: "Start guided deposit" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Ask the agent about this strategy/ })).toBeVisible();
  });

  test("vault readout shows live on-chain totals", async ({ page }) => {
    await page.goto("/strategies/firelight-stxrp");

    // The vault readout renders real total assets from the chain.
    await expect(page.getByText(/total assets/i).first()).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText("FXRP", { exact: true }).first()).toBeVisible();
  });

  test("reference-only strategies are honest about availability and link externally", async ({ page }) => {
    await page.goto("/strategies/monarq-mxrpy");

    await expect(page.getByText("reference only", { exact: true })).toBeVisible();
    await expect(page.getByText(/No Monarq vault is registered on this network yet/)).toBeVisible();
    await expect(page.getByText(/shown for research and comparison/)).toBeVisible();

    // No fake deposit button, but the protocol site is offered.
    await expect(page.getByRole("link", { name: "Start guided deposit" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Read the protocol site/ })).toHaveAttribute(
      "href",
      /https:\/\//
    );
    await expect(page.getByText(/not yet verified/)).toBeVisible();
  });
});

test.describe("Onboarding fit check", () => {
  test("questionnaire produces ranked, explained matches that link to strategies", async ({ page }) => {
    await page.goto("/onboarding");

    await expect(
      page.getByRole("heading", { name: /How do you feel about risk/ })
    ).toBeVisible();
    await page.getByRole("button", { name: /Conservative/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByRole("heading", { name: /How quickly do you need your money/ })
    ).toBeVisible();
    await page.getByRole("button", { name: /No lock-ups/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByRole("button", { name: /Simple paths first/ }).click();
    await page.getByRole("button", { name: "Show my matches" }).click();

    await expect(page.getByRole("heading", { name: "Your matches" })).toBeVisible();
    await expect(page.getByText(/matches your conservative risk comfort/).first()).toBeVisible();

    // Ranked match cards deep-link into the strategy.
    await expect(page.getByRole("link", { name: /Compare all strategies/ }).first()).toBeVisible();
    const firstMatch = page.locator("a[href^='/strategies/']").first();
    await expect(firstMatch).toBeVisible();
    await firstMatch.click();
    await expect(page).toHaveURL(/\/strategies\/(firelight|clearstar|kinetic)/, { timeout: 30_000 });
  });

  test("preferences persist across a revisit", async ({ page }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: /Conservative/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: /No lock-ups/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: /Simple paths first/ }).click();
    await page.getByRole("button", { name: "Show my matches" }).click();
    await expect(page.getByRole("heading", { name: "Your matches" })).toBeVisible();

    // Re-answer → back to the questionnaire with answers pre-selected.
    await page.getByRole("button", { name: "Re-answer" }).click();
    await expect(page.getByRole("heading", { name: /How do you feel about risk/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Conservative/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    // Walk straight through with the restored answers to a fresh match list.
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: /Simple paths first/ }).click();
    await page.getByRole("button", { name: "Show my matches" }).click();
    await expect(page.getByRole("heading", { name: "Your matches" })).toBeVisible();

    // A genuine revisit restores the saved preferences with a welcome-back note.
    await page.goto("/");
    await page.getByRole("link", { name: /Take the 20-second fit check/ }).click();
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 30_000 });
    await expect(page.getByText(/Welcome back/)).toBeVisible();
    await expect(page.getByRole("button", { name: /Conservative/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("button", { name: /No lock-ups/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});

test.describe("Guided execution", () => {
  test("FSA path validates, derives the smart account and prepares the payment", async ({ page }) => {
    await page.goto("/execute/firelight-stxrp");

    await expect(page.getByText("Flare Smart Account", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Preferred", { exact: true })).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "1 · Your XRPL Testnet address" })
    ).toBeVisible();

    // Invalid addresses are rejected immediately.
    await page.getByLabel("XRPL testnet address").fill("not-an-address");
    await expect(page.getByText(/valid XRPL address/)).toBeVisible();

    // A valid testnet address enables the registry lookup.
    await page.getByLabel("XRPL testnet address").fill(XRPL_TESTNET_ADDR);
    await page.getByRole("button", { name: "Find my smart account" }).click();

    await expect
      .poll(
        async () =>
          page.getByRole("button", { name: /Re-read my smart account|Find my smart account/ }).count(),
        { timeout: 20_000 }
      )
      .toBe(1);

    // Amount + lot sizing, then a prepared payment with the FSA deposit memo.
    await page.getByLabel("Amount in XRP").fill("25");
    await expect(page.getByText(/lot/).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("heading", { name: /Review the prepared payment/ })).toBeVisible();
  });

  test("path switching exposes the honest EVM wallet state", async ({ page }) => {
    await page.goto("/execute/firelight-stxrp");

    // Switch FSA → EVM.
    await page.getByRole("tab", { name: /EVM wallet/ }).click();

    // Without an injected wallet the flow says so plainly — no fake connection.
    await expect(page.getByText("1 · Connect an EVM wallet")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Connect / })).toBeVisible();

    // Switch back to FSA — the address step returns.
    await page.getByRole("tab", { name: /Flare Smart Account/ }).click();
    await expect(
      page.getByRole("heading", { name: "1 · Your XRPL Testnet address" })
    ).toBeVisible();
  });

  test("agent intent pre-fills the execute page", async ({ page }) => {
    await page.goto("/execute/firelight-stxrp?amount=500&path=fsa&via=agent");

    await expect(page.getByText(/intent from the copilot/)).toBeVisible();
    await page.getByLabel("XRPL testnet address").fill(XRPL_TESTNET_ADDR);
    await page.getByRole("button", { name: "Find my smart account" }).click();
    await expect(page.getByLabel("Amount in XRP")).toHaveValue("500", { timeout: 20_000 });
  });
});

test.describe("Dashboard", () => {
  test("perfect empty state before any connection, honest invalid-address feedback", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your dashboard is ready" })).toBeVisible();

    const input = page.getByLabel("Look up any Coston2 address");

    // Invalid input is flagged immediately, not silently ignored.
    await input.fill("0xzzz");
    await expect(page.getByText("That's not a valid address.")).toBeVisible();

    // Valid but empty address → honest "no positions" state.
    await input.fill("0x1234567890abcdef1234567890abcdef12345678");
    await page.getByRole("button", { name: "Look up" }).click();
    await expect(page.getByText(/no FXRP and no vault shares on Coston2 yet/)).toBeVisible({
      timeout: 25_000,
    });
  });

  test("lookup of a real address reads live positions from the chain", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByLabel("Look up any Coston2 address").fill(DEPLOYER);
    await page.getByRole("button", { name: "Look up" }).click();

    // Positions hydrate from the chain: FXRP balance and/or vault shares.
    await expect(page.getByText("FXRP balance", { exact: true })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Vault positions" })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("wallet connect is offered without a wallet injected, and empty state recovers", async ({ page }) => {
    await page.goto("/dashboard");

    // Connect options render for the EVM path (injected connector).
    await expect(page.getByRole("button", { name: /^Connect / }).first()).toBeVisible();

    // The empty state CTA leads to the catalog.
    await page.getByRole("link", { name: "Explore strategies" }).click();
    await expect(page.getByRole("heading", { name: "Strategies", exact: true })).toBeVisible({
      timeout: 30_000,
    });
  });
});

test.describe("FAssets system", () => {
  test("system tracker reads the minted-token layer and registry live", async ({ page }) => {
    await page.goto("/fassets");

    await expect(page.getByRole("heading", { name: "FAssets system" })).toBeVisible();
    await expect(page.getByText("FXRP supply", { exact: true })).toBeVisible({ timeout: 25_000 });
    await expect(page.getByText(/FTestXRP/)).toBeVisible();
    await expect(page.getByText(/Share of supply deployed/)).toBeVisible();
    await expect(page.getByText("Firelight stXRP")).toBeVisible();
    await expect(page.getByText(/Lot size/)).toBeVisible();
    await expect(page.getByText("GET /api/registry")).toBeVisible();
  });
});

test.describe("Agent (Gemini)", () => {
  test("console shell renders with engine status and suggestion chips", async ({ page }) => {
    await page.goto("/agent");

    await expect(page.getByRole("heading", { name: "Ask Lumina anything" })).toBeVisible();
    await expect(page.getByText("Lumina copilot")).toBeVisible();
    // Status badge text may be hidden on the mobile viewport (sm:inline), but the
    // status fetch resolved — assert the element is present in the DOM.
    await expect(page.getByText(/gemini/).first()).toBeAttached();
    await expect(page.locator('[data-role="agent-message"]').first()).toBeVisible();

    // Suggestion chips are clickable and send a message.
    await page.getByRole("button", { name: /Which strategy is right for me\?/ }).click();
    await expect(page.getByLabel("Ask the Lumina agent")).toHaveValue("");

    // The user message is echoed, and the agent replies (or errors honestly).
    await expect(page.locator('[data-role="user-message"]')).toHaveCount(1, { timeout: 10_000 });
    if (!geminiConfigured) {
      await expect(page.locator('[data-role="agent-message"]')).toHaveCount(2, { timeout: 20_000 });
      await expect(page.locator('[data-role="agent-message"]').last()).toContainText(
        /not configured/
      );
    } else {
      await expect(page.locator('[data-role="agent-message"]')).toHaveCount(2, { timeout: 60_000 });
    }
  });

  test(
    "answers strategy questions with a real brief and links (skipped when agent not configured)",
    async ({ page }) => {
      test.skip(!geminiConfigured, "GEMINI_API_KEY not configured on the server");
      test.setTimeout(120_000);

      await page.goto("/agent");
      const input = page.getByLabel("Ask the Lumina agent");
      await input.fill("Tell me about Firelight stXRP");
      await page.getByRole("button", { name: "Send" }).click();

      // Gemini grounded answer + deterministic link back into the catalog.
      await expect(page.getByRole("link", { name: /Full strategy brief →/ })).toBeVisible({
        timeout: 60_000,
      });
    }
  );

  test(
    "turns plain language into an executable deposit intent and pre-fills execution",
    async ({ page }) => {
      test.skip(!geminiConfigured, "GEMINI_API_KEY not configured on the server");
      test.setTimeout(120_000);

      await page.goto("/agent");
      const input = page.getByLabel("Ask the Lumina agent");
      await input.fill("put 500 xrp into firelight stxrp");
      await page.getByRole("button", { name: "Send" }).click();

      // The intent card is deterministic UI (strategy + amount + path resolved).
      await expect(page.getByText(/intent · deposit/i)).toBeVisible({ timeout: 60_000 });
      await expect(page.getByText(/Deposit 500 FXRP/)).toBeVisible();

      // Executing pre-fills the guided deposit from the intent.
      await page.getByRole("link", { name: /Execute deposit →/ }).click();
      await expect(page).toHaveURL(/\/execute\/firelight-stxrp\?amount=500&path=fsa&via=agent/, {
        timeout: 30_000,
      });
      await expect(page.getByText(/intent from the copilot/)).toBeVisible();
    }
  );

  test(
    "compares strategies with a link into the comparison table (skipped when not configured)",
    async ({ page }) => {
      test.skip(!geminiConfigured, "GEMINI_API_KEY not configured on the server");
      test.setTimeout(120_000);

      await page.goto("/agent");
      const input = page.getByLabel("Ask the Lumina agent");
      await input.fill("Compare Firelight vs Clearstar");
      await page.getByRole("button", { name: "Send" }).click();

      await expect(page.getByRole("link", { name: /Compare on the strategies page →/ })).toBeVisible({
        timeout: 60_000,
      });
      await page.getByRole("link", { name: /Compare on the strategies page →/ }).click();
      await expect(page).toHaveURL(/\/strategies/, { timeout: 30_000 });
    }
  );

  test(
    "reads a portfolio and links to the dashboard (skipped when not configured)",
    async ({ page }) => {
      test.skip(!geminiConfigured, "GEMINI_API_KEY not configured on the server");
      test.setTimeout(120_000);

      await page.goto("/agent");
      const input = page.getByLabel("Ask the Lumina agent");
      await input.fill(`What does ${DEPLOYER} hold?`);
      await page.getByRole("button", { name: "Send" }).click();

      // Deterministic link back into the live dashboard.
      await expect(page.getByRole("link", { name: /Open dashboard →/ })).toBeVisible({
        timeout: 60_000,
      });
    }
  );

  test(
    "refuses to answer when Gemini is not configured — never fabricates",
    async ({ page }) => {
      test.skip(geminiConfigured, "Agent is configured; the honest-error path needs no key");
      await page.goto("/agent");

      const input = page.getByLabel("Ask the Lumina agent");
      await input.fill("what should I invest in?");
      await page.getByRole("button", { name: "Send" }).click();

      // The not-configured error is surfaced plainly.
      await expect(page.getByText(/Agent is not configured/)).toBeVisible({ timeout: 20_000 });
    }
  );
});

test.describe("Public APIs", () => {
  test("registry API serves live data, publisher info and a compare view", async ({ request }) => {
    const reg = await request.get("/api/registry");
    expect(reg.status()).toBe(200);
    const regJson = await reg.json();
    expect(regJson.schema).toBe("lumina.registry/v1");
    expect(regJson.registry.address).toBe("0x36d0B0617e02690373AA521b8E978a62321295D7");
    expect(regJson.registry.owner).toBe(DEPLOYER);
    expect(regJson.vaults.length).toBeGreaterThanOrEqual(4);

    const firelight = regJson.vaults.find((v: { vaultId: number }) => v.vaultId === 1);
    expect(firelight).toBeTruthy();
    expect(firelight.name).toBe("Firelight stXRP");
    expect(firelight.totalAssets).not.toBeNull();

    // Compare view joins catalog + registry with publisher verification.
    expect(regJson.compare.length).toBeGreaterThanOrEqual(4);
    const fl = regJson.compare.find((r: { id: string }) => r.id === "firelight-stxrp");
    expect(fl).toBeTruthy();
    expect(fl.publisher.verified).toBe(true);
    expect(fl.risk).toBe("Conservative");
    expect(fl.totalAssetsFormatted).not.toBeNull();
  });

  test("verify API resolves registry records and rejects malformed input", async ({ request }) => {
    const verify = await request.get(
      "/api/verify?address=0x9E63a5D282F2fBb7DcE822B98e363b2719D28319"
    );
    expect(verify.status()).toBe(200);
    const verifyJson = await verify.json();
    expect(verifyJson.registered).toBe(true);
    expect(verifyJson.record.name).toBe("Clearstar earnXRP");
    expect(verifyJson.inCatalog).toBe(true);
    expect(verifyJson.catalogStrategy.executable).toBe(true);
    expect(verifyJson.catalogStrategy.publisher.verified).toBe(true);

    const bad = await request.get("/api/verify?address=nope");
    expect(bad.status()).toBe(400);
  });

  test("agent API reports engine status and refuses when unconfigured", async ({ request }) => {
    const status = await request.get("/api/agent");
    expect(status.status()).toBe(200);
    const s = await status.json();
    expect(s.schema).toBe("lumina.agent/v1");
    expect(s.engine).toBe("gemini");
    expect(s.model).toBeTruthy();

    if (!s.configured) {
      const res = await request.post("/api/agent", {
        data: { messages: [{ role: "user", content: "hi" }] },
      });
      expect(res.status()).toBe(503);
      const j = await res.json();
      expect(j.error).toMatch(/not configured/i);
    }

    // Empty conversations are rejected regardless of configuration.
    const empty = await request.post("/api/agent", { data: { messages: [] } });
    expect(empty.status()).toBe(400);
  });
});

test.describe("Navigation & recovery", () => {
  test("unknown routes recover to home", async ({ page }) => {
    await page.goto("/strategies/does-not-exist");

    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL("/", { timeout: 30_000 });
  });

  test("mobile header navigation reaches every primary section", async ({ page }) => {
    await page.goto("/");

    const mobileNav = page.getByLabel("Mobile navigation");
    await mobileNav.getByRole("link", { name: "Strategies", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Strategies", exact: true })).toBeVisible({
      timeout: 30_000,
    });

    await mobileNav.getByRole("link", { name: "Dashboard", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible({
      timeout: 30_000,
    });

    await mobileNav.getByRole("link", { name: "Agent", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Ask Lumina anything" })).toBeVisible({
      timeout: 30_000,
    });

    await mobileNav.getByRole("link", { name: "FAssets", exact: true }).click();
    await expect(page.getByRole("heading", { name: "FAssets system" })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("desktop navigation shows the full nav on wide viewports", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    const nav = page.getByLabel("Main navigation");
    await expect(nav).toBeVisible();
    await nav.getByRole("link", { name: "Strategies" }).click();
    await expect(page.getByRole("heading", { name: "Strategies", exact: true })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("footer navigation works from a deep page", async ({ page }) => {
    await page.goto("/strategies/firelight-stxrp");

    const footer = page.locator("footer");
    await footer.getByRole("link", { name: "Strategies" }).click();
    await expect(page).toHaveURL(/\/strategies$/, { timeout: 30_000 });

    await page.goto("/strategies/firelight-stxrp");
    await page.locator("footer").getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });
  });
});
