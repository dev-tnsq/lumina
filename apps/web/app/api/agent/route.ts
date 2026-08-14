import { runAgent, getAgentStatus } from "@/lib/agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * The Lumina agent endpoint (Gemini with function calling bound to live
 * chain data).
 *
 *   GET  /api/agent            → engine status (model, configured)
 *   POST /api/agent            → { messages: [{ role, content }] }
 *
 * There is no fallback engine and no placeholder answer: if GEMINI_API_KEY
 * is not configured, GET reports `configured: false` and POST fails loudly
 * (503) instead of pretending to answer.
 */
export async function GET() {
  return Response.json({ schema: "lumina.agent/v1", ...getAgentStatus() });
}

export async function POST(req: Request) {
  let messages: ChatMessage[];
  try {
    const body = (await req.json()) as { messages?: ChatMessage[] };
    messages = Array.isArray(body.messages)
      ? body.messages.filter((m) => m && (m.role === "user" || m.role === "assistant"))
      : [];
  } catch {
    return Response.json(
      { schema: "lumina.agent/v1", error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (messages.length === 0) {
    return Response.json(
      { schema: "lumina.agent/v1", error: "Send at least one user message." },
      { status: 400 }
    );
  }

  const status = getAgentStatus();
  if (!status.configured) {
    return Response.json(
      {
        schema: "lumina.agent/v1",
        error: "Agent is not configured. Set GEMINI_API_KEY and restart.",
      },
      { status: 503 }
    );
  }

  try {
    const result = await runAgent(messages);
    return Response.json({ schema: "lumina.agent/v1", ...result });
  } catch (e) {
    // Never leak a half-baked answer: be honest that the agent failed.
    return Response.json(
      {
        schema: "lumina.agent/v1",
        error: (e as Error).message,
      },
      { status: 500 }
    );
  }
}
