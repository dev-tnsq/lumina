# 06 — Test Strategy

## Philosophy

Tests exist to protect the real user experience, not to hit coverage numbers.

## Layers

1. **Unit tests** — pure logic (risk scoring, recommendation ranking, amount calculations, memo encoding helpers)
2. **Integration tests** — contract interactions, registry lookups, vault share detection on Coston2 / forks
3. **Playwright E2E (highest priority)** — full user journeys from the UI

## Critical Playwright journeys (must exist and stay green)

- First-time visitor → understands what Lumina does
- Connect flow (both XRPL-oriented and EVM-oriented)
- Explore strategies → see risk labels and explanations
- Select a conservative strategy → see clear next steps
- Position dashboard empty state and populated state
- Error states (wrong network, insufficient balance, failed step) show honest recovery paths
- Mobile viewport versions of the above

## Execution rules for agents

- When a specific test fails, **run only that test** until it passes. Do not burn time on the full suite every iteration.
- After a focused fix is green, run the related group, then the full suite.
- Never disable or skip a failing test to “make CI green”. Fix the underlying issue.
- Prefer realistic test data and Coston2 where possible. Avoid excessive mocking of the happy path.

## Definition of done for any feature

- Works on mobile viewport
- Has at least one Playwright journey covering the happy path
- Has honest error / empty states
- No placeholders in the code path
- Risk and yield information is presented honestly
