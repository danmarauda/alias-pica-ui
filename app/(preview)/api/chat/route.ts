import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText, Message } from "ai";
import { Pica } from "@picahq/ai";

export async function POST(request: Request) {
  const { messages }: { messages: Message[] } = await request.json();

  const pica = new Pica(process.env.PICA_SECRET_KEY as string, {
    connectors: ["*"] // Pass connector keys to allow access to
  });

  const system = await pica.generateSystemPrompt();

  const stream = streamText({
    model: openai("gpt-4o"),
    system,
    tools: {
      ...pica.oneTool,
    },
    messages: convertToCoreMessages(messages),
    maxSteps: 20,
  });

  return stream.toDataStreamResponse();
}
