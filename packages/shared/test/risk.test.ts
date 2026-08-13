import { describe, expect, it } from "vitest";
import { scoreRisk } from "../src/risk";

describe("risk model", () => {
  it("labels an audited, simple, large-TVL mainnet vault as Conservative", () => {
    const result = scoreRisk({
      audited: true,
      stage: "live-mainnet",
      complexity: "simple",
      withdrawal: "instant",
      tvl: "large",
    });
    expect(result.label).toBe("Conservative");
    expect(result.score).toBeLessThan(25);
  });

  it("labels an unaudited, high-complexity, options strategy as Advanced", () => {
    const result = scoreRisk({
      audited: false,
      stage: "new",
      complexity: "high",
      withdrawal: "period",
      tvl: "small",
    });
    expect(result.label).toBe("Advanced");
    expect(result.score).toBeGreaterThanOrEqual(50);
  });

  it("flags testnet stage in the default notes", () => {
    const result = scoreRisk({
      audited: true,
      stage: "testnet",
      complexity: "medium",
      withdrawal: "period",
      tvl: "moderate",
    });
    expect(result.defaultNotes.join(" ")).toContain("Testnet");
  });

  it("always returns a factor breakdown with reasons", () => {
    const result = scoreRisk({
      audited: "unknown",
      stage: "testnet",
      complexity: "medium",
      withdrawal: "queue",
      tvl: "unknown",
    });
    expect(result.factors).toHaveLength(5);
    for (const f of result.factors) {
      expect(f.reason.length).toBeGreaterThan(10);
      expect(f.impact).toBeGreaterThanOrEqual(0);
    }
  });
});
