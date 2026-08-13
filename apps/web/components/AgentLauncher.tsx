"use client";

import { useState } from "react";
import { AgentChat } from "./AgentChat";

/** Floating copilot launcher — available on every page. */
export function AgentLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-[min(380px,calc(100vw-2rem))] sm:bottom-24 sm:right-8">
          <AgentChat compact />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close Lumina copilot" : "Open Lumina copilot"}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-[#03201b] shadow-glow transition-transform hover:scale-105 sm:bottom-8 sm:right-8"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3c-4.6 0-8.4 3-8.4 6.8 0 2 1 3.8 2.6 5L5.4 21l4.2-2.2c.8.2 1.6.3 2.4.3 4.6 0 8.4-3 8.4-6.8S16.6 3 12 3Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </>
  );
}
