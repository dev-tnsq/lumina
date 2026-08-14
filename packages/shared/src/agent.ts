/**
 * Lumina agent — shared contracts between the server-side agent engine and
 * the UI. The agent itself is Gemini with function calling bound to live
 * chain data (see apps/web/lib/agent.ts). No local-rules fallback, no
 * placeholders: if Gemini is not configured the API fails loudly instead of
 * inventing an answer.
 */

export interface AgentLink {
  label: string;
  href: string;
}

/**
 * An actionable intent the agent prepared for the user. The user stays in
 * control — Lumina resolves the path and pre-fills the transaction, the user
 * reviews and signs.
 */
export interface AgentIntent {
  action: "deposit";
  strategyId: string;
  /** Human amount as typed by the user (e.g. "500"). */
  amount: string;
  path: "fsa" | "evm";
}

export interface AgentResponse {
  text: string;
  links?: AgentLink[];
  /** When present, the UI renders an execute card for this intent. */
  intent?: AgentIntent;
}
