import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, stepCountIs } from "ai";
import { Pica } from "@picahq/ai";
import type { UIMessage } from "ai";

function getModel(modelId: string) {
  switch (modelId) {
    case "gpt-4.1":
    case "gpt-5":
      return openai(modelId);
    case "gemini-2.5-pro":
      return google(modelId);
    case "claude-sonnet-4-5-20250929":
      return anthropic("claude-sonnet-4-5-20250929");
    default:
      return openai("gpt-4.1");
  }
}

async function getActiveConnections() {
  try {
    const response = await fetch('https://api.picaos.com/v1/vault/connections', {
      headers: {
        'x-pica-secret': process.env.PICA_SECRET_KEY as string,
      },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.rows || [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  const { messages, id }: { messages: UIMessage[]; id: string } = await request.json();
  const modelId = id.replace('chat-', '');

  // Trim history to reduce risk of exceeding model context window
  const MAX_MESSAGES = 20;
  const trimmedMessages = messages.slice(-MAX_MESSAGES);

  // Fetch active connections and deduplicate by platform (keep most recent)
  const allConnections = await getActiveConnections();
  const activeConnections = allConnections.filter((conn: any) => conn.active);

  // Deduplicate connections by platform, keeping the most recently updated
  const platformMap = new Map();
  activeConnections.forEach((conn: any) => {
    const existing = platformMap.get(conn.platform);
    if (!existing || (conn.updatedAt && existing.updatedAt && conn.updatedAt > existing.updatedAt)) {
      platformMap.set(conn.platform, conn);
    }
  });

  // Get unique connection keys
  const uniqueConnectionKeys = Array.from(platformMap.values()).map((conn: any) => conn.key);

  const pica = new Pica(process.env.PICA_SECRET_KEY as string, {
    connectors: uniqueConnectionKeys.length > 0 ? uniqueConnectionKeys : ["*"]
  });

  const system = await pica.generateSystemPrompt();

  const result = streamText({
    model: getModel(modelId),
    system,
    tools: {
      ...pica.oneTool,
    },
    messages: convertToModelMessages(trimmedMessages),
    stopWhen: stepCountIs(25)
  });

  return result.toUIMessageStreamResponse();
}
