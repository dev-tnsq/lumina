"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RiskPreferences, RiskTier } from "@lumina/shared";
import { getStrategy, recommendLive } from "@lumina/shared";
import { RiskBadge } from "@/components/RiskBadge";

const TOLERANCE_OPTIONS: { value: RiskTier; title: string; desc: string }[] = [
  {
    value: "Conservative",
    title: "Conservative",
    desc: "I'd rather earn less than risk losing principal.",
  },
  {
    value: "Balanced",
    title: "Balanced",
    desc: "Some risk is fine for better returns.",
  },
  {
    value: "Advanced",
    title: "Advanced",
    desc: "I understand complex strategies and volatile returns.",
  },
];

const LOCKUP_OPTIONS = [
  { value: "none", title: "No lock-ups", desc: "I need my money available quickly." },
  { value: "some", title: "Some is OK", desc: "I can wait a few days if the yield is better." },
  { value: "comfortable", title: "Comfortable waiting", desc: "I'm happy to wait full withdrawal periods." },
] as const;

const PREFERENCES_KEY = "lumina.risk-preferences.v1";

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [tolerance, setTolerance] = useState<RiskTier | null>(null);
  const [lockup, setLockup] = useState<(typeof LOCKUP_OPTIONS)[number]["value"] | null>(null);
  const [simplicity, setSimplicity] = useState<boolean>(true);
  const [done, setDone] = useState(false);
  const [restored, setRestored] = useState(false);

  // Returning users keep their answers: restore the saved preferences on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFERENCES_KEY);
      if (!raw) return;
      const prefs = JSON.parse(raw) as Partial<RiskPreferences>;
      if (prefs.riskTolerance) setTolerance(prefs.riskTolerance);
      if (prefs.lockupComfort) setLockup(prefs.lockupComfort);
      if (typeof prefs.simplicity === "boolean") setSimplicity(prefs.simplicity);
      setRestored(true);
    } catch {
      /* storage unavailable — fresh questionnaire */
    }
  }, []);

  useEffect(() => {
    document.title = "Find your fit · Lumina";
  }, []);

  function finish() {
    if (!tolerance || !lockup) return;
    const prefs: RiskPreferences = {
      riskTolerance: tolerance,
      lockupComfort: lockup,
      simplicity,
    };
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    } catch {
      /* storage may be unavailable (private mode) — proceed without persisting */
    }
    setDone(true);
  }

  if (done && tolerance && lockup) {
    return (
      <Results
        tolerance={tolerance}
        lockup={lockup}
        simplicity={simplicity}
        onReanswer={() => {
          setDone(false);
          setStep(0);
        }}
      />
    );
  }

  const canContinue =
    step === 0 ? tolerance != null : step === 1 ? lockup != null : true;

  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="text-[13px] font-semibold text-brand hover:underline">
          ← Home
        </Link>
        {restored && (
          <p className="mt-3 rounded-xl border border-brand/30 bg-brand/10 p-3 text-[12px] leading-snug text-ink-soft">
            Welcome back — we restored your saved answers from your last fit
            check. Adjust them or jump straight to your matches.
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {step === 0 && "How do you feel about risk?"}
            {step === 1 && "How quickly do you need your money?"}
            {step === 2 && "One last preference"}
          </h1>
          <span className="font-mono text-[11px] text-muted">0{step + 1}/03</span>
        </div>
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-brand" : "bg-line"}`}
            />
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {step === 0 &&
            TOLERANCE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setTolerance(o.value)}
                aria-pressed={tolerance === o.value}
                className={`card w-full p-4 text-left transition-colors ${
                  tolerance === o.value ? "border-brand/60 shadow-glow" : "hover:border-brand/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">{o.title}</p>
                  <RiskBadge tier={o.value} size="sm" />
                </div>
                <p className="mt-1 text-[13px] leading-snug text-muted">{o.desc}</p>
              </button>
            ))}

          {step === 1 &&
            LOCKUP_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setLockup(o.value)}
                aria-pressed={lockup === o.value}
                className={`card w-full p-4 text-left transition-colors ${
                  lockup === o.value ? "border-brand/60 shadow-glow" : "hover:border-brand/40"
                }`}
              >
                <p className="text-sm font-semibold text-ink">{o.title}</p>
                <p className="mt-1 text-[13px] leading-snug text-muted">{o.desc}</p>
              </button>
            ))}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setSimplicity(true)}
                aria-pressed={simplicity === true}
                className={`card w-full p-4 text-left transition-colors ${
                  simplicity ? "border-brand/60 shadow-glow" : "hover:border-brand/40"
                }`}
              >
                <p className="text-sm font-semibold text-ink">Simple paths first</p>
                <p className="mt-1 text-[13px] leading-snug text-muted">
                  Prefer single-vault strategies with one clear mechanism.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setSimplicity(false)}
                aria-pressed={simplicity === false}
                className={`card w-full p-4 text-left transition-colors ${
                  !simplicity ? "border-brand/60 shadow-glow" : "hover:border-brand/40"
                }`}
              >
                <p className="text-sm font-semibold text-ink">Show me everything</p>
                <p className="mt-1 text-[13px] leading-snug text-muted">
                  I'm happy to compare complex strategies too.
                </p>
              </button>
            </>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="btn-ghost flex-1">
              Back
            </button>
          )}
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => (step < 2 ? setStep(step + 1) : finish())}
            className="btn-primary flex-1"
          >
            {step < 2 ? "Continue" : "Show my matches"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Results({
  tolerance,
  lockup,
  simplicity,
  onReanswer,
}: {
  tolerance: RiskTier;
  lockup: RiskPreferences["lockupComfort"];
  simplicity: boolean;
  onReanswer: () => void;
}) {
  const recs = recommendLive({ riskTolerance: tolerance, lockupComfort: lockup, simplicity });

  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-2xl">
        <p className="micro">Fit check complete</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Your matches</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Ranked for a {tolerance.toLowerCase()} risk comfort
          {lockup !== "none" ? " with lock-up tolerance" : " requiring quick exits"}.
          You can always change your answers and re-rank.
        </p>

        <div className="mt-6 space-y-3">
          {recs.map((r) => (
            <Link
              key={r.strategyId}
              href={`/strategies/${r.strategyId}`}
              className="card group block p-4 transition-colors hover:border-brand/50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-xs font-bold text-white">
                  {r.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink group-hover:text-brand">
                    {getStrategy(r.strategyId)?.name ?? r.strategyId}
                  </p>
                  <p className="text-[13px] leading-snug text-muted">{r.reason}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/strategies" className="btn-primary">
            Compare all strategies
          </Link>
          <button type="button" onClick={onReanswer} className="btn-ghost">
            Re-answer
          </button>
        </div>
      </div>
    </div>
  );
}
