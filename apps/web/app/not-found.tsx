import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-app flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
          404 / unknown route
        </p>
        <h1 className="mt-3 text-2xl font-bold text-ink">Page not found</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          That route doesn&apos;t exist. Let&apos;s get you back to your strategies.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Back to home
        </Link>
      </div>
    </div>
  );
}
