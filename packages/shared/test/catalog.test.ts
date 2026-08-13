import { describe, expect, it } from "vitest";
import { formatApyRange, formatPercent, formatUnitsValue, shortenAddress } from "../src/format";
import { recommendFromPreferences, recommendLive } from "../src/recommend";
import { STRATEGIES, getLiveStrategies } from "../src/strategies";
import type { RiskPreferences } from "../src/types";

describe("format utils", () => {
  it("formats raw units with decimals", () => {
    expect(formatUnitsValue(1_234_567n, 6)).toBe("1.2345");
    expect(formatUnitsValue(0n, 6)).toBe("0");
    expect(formatUnitsValue(10_000_000n, 6)).toBe("10");
  });

  it("formats percentages and ranges honestly", () => {
    expect(formatPercent(5.9172)).toBe("5.92%");
    expect(formatApyRange(4, 12)).toBe("4.00% – 12.00%");
  });

  it("shortens addresses", () => {
    expect(shortenAddress("0x0b6A3645c240605887a5532109323A3E12273dc7")).toBe("0x0b6A…3dc7");
  });
});

describe("strategy catalog integrity", () => {
  it("has unique strategy ids and no empty risk notes", () => {
    const ids = STRATEGIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of STRATEGIES) {
      expect(s.riskNotes.length).toBeGreaterThanOrEqual(3);
      expect(s.description.length).toBeGreaterThan(20);
    }
  });

  it("has at least two live-on-Coston2 strategies with verified vaults", () => {
    const live = getLiveStrategies();
    expect(live.length).toBeGreaterThanOrEqual(2);
    for (const s of live) {
      expect(s.vault).not.toBeNull();
      expect(s.availability).toBe("live");
      expect(s.yieldContext.derivedFromOnChain).toBe(true);
    }
  });

  it("never claims a single glossy APY: yield context always has summary + provenance", () => {
    for (const s of STRATEGIES) {
      expect(s.yieldContext.summary.length).toBeGreaterThan(20);
      if (s.yieldContext.range) {
        expect(s.yieldContext.range.sourceLabel.length).toBeGreaterThan(10);
      }
    }
  });
});

describe("recommendation engine", () => {
  const conservative: RiskPreferences = {
    riskTolerance: "Conservative",
    lockupComfort: "some",
    simplicity: true,
  };

  it("ranks live strategies above reference-only ones", () => {
    const recs = recommendFromPreferences(conservative);
    const liveRank = recs.find((r) => r.strategyId === "clearstar-earnxrp")?.rank ?? 99;
    const refRank = recs.find((r) => r.strategyId === "monarq-mxrpy")?.rank ?? 99;
    expect(liveRank).toBeLessThan(refRank);
  });

  it("produces plain-language reasons for every recommendation", () => {
    const recs = recommendLive(conservative);
    expect(recs.length).toBeGreaterThan(0);
    for (const r of recs) {
      expect(r.reason.length).toBeGreaterThan(30);
    }
  });

  it("ranks deterministically", () => {
    const a = recommendFromPreferences(conservative).map((r) => r.strategyId);
    const b = recommendFromPreferences(conservative).map((r) => r.strategyId);
    expect(a).toEqual(b);
  });
});
