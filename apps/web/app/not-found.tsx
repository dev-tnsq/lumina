import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";

export default function NotFound() {
  return (
    <div className="container-phone pb-safe">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">404</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">Page not found</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          That page doesn&apos;t exist. Let&apos;s get you back to your strategies.
        </p>
        <Link
          href="/"
          className="mt-5 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-strong"
        >
          Back to home
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
