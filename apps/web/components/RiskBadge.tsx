import type { RiskTier } from "@lumina/shared";

const STYLES: Record<RiskTier, { chip: string; dot: string; label: string }> = {
  Conservative: {
    chip: "bg-risk-conservative-soft text-risk-conservative",
    dot: "bg-risk-conservative",
    label: "Conservative",
  },
  Balanced: {
    chip: "bg-risk-balanced-soft text-risk-balanced",
    dot: "bg-risk-balanced",
    label: "Balanced",
  },
  Advanced: {
    chip: "bg-risk-advanced-soft text-risk-advanced",
    dot: "bg-risk-advanced",
    label: "Advanced",
  },
};

/** The canonical risk badge — used on cards, detail pages and disclosures. */
export function RiskBadge({ tier, size = "md" }: { tier: RiskTier; size?: "sm" | "md" }) {
  const s = STYLES[tier];
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold ${pad} ${s.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}
