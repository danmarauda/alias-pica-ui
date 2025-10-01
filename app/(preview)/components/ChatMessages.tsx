import { Message } from "@/components/message";
import { ColorfulLoadingAnimation } from "@/components/loading-spinner";
import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { useMessages } from "cedar-os";
import { CedarMessageRenderer } from "./CedarMessageRenderer";

interface ChatMessagesProps {
  messages: UIMessage[];
  status: string;
}

export function ChatMessages({ messages, status }: ChatMessagesProps) {
  const isLoading = status === 'streaming' || status === 'submitted';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get Cedar messages from the Cedar store
  const { messages: cedarMessages } = useMessages();

  // Only scroll when a new user message is added (from either source)
  useEffect(() => {
    const hasNewUserMessage =
      (messages.length > 0 && messages[messages.length - 1].role === "user") ||
      (cedarMessages.length > 0 && cedarMessages[cedarMessages.length - 1].role === "user");

    if (hasNewUserMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, cedarMessages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 flex flex-col gap-6 w-full max-w-none items-center overflow-y-auto px-4 md:px-6 custom-scrollbar"
    >
      {messages.length === 0 && cedarMessages.length === 0 && null}

      {/* Render Vercel AI SDK messages */}
      {messages.map((message) => {
        const textContent = message.parts
          ?.filter(part => part.type === 'text')
          ?.map(part => part.text)
          ?.join('') || '';

        const toolInvocations = message.parts
          ?.filter(part => part.type.startsWith('tool-'))
          ?.map(part => {
            const partAny = part as any;
            return {
              toolCallId: partAny.toolCallId || `tool-${Math.random()}`,
              toolName: part.type.replace('tool-', ''), // Remove 'tool-' prefix
              state: partAny.output ? 'result' : (partAny.input ? 'call' : 'partial-call'),
              result: partAny.output, // Use 'output' field
              args: partAny.input,
            };
          }) || [];

        if (message.role === "user") {
          return (
            <Message
              key={message.id}
              role={message.role}
              content={textContent}
              toolInvocations={toolInvocations}
            />
          );
        }

        // For assistant messages, render if there's content or tool invocations
        if (
          message.role === "assistant" &&
          (textContent || toolInvocations.length > 0)
        ) {
          return (
            <Message
              key={message.id}
              role={message.role}
              content={textContent}
              toolInvocations={toolInvocations}
            />
          );
        }

        return null;
      })}

      {/* Render Cedar OS messages */}
      {cedarMessages.map((cedarMessage) => (
        <CedarMessageRenderer key={cedarMessage.id} message={cedarMessage} />
      ))}

      {isLoading && (
        <>
          <div className="w-full md:px-0">
            <div className="flex items-center gap-2 px-4 py-3">
              <ColorfulLoadingAnimation
                scale={0.5}
                colorScheme="picaGreen"
                animationPattern="default"
              />
              <span className="text-sm text-gray-400 font-light">
                AI is thinking...
              </span>
            </div>
          </div>
        </>
      )}

      {(messages.length > 0 || cedarMessages.length > 0) && (
        <div ref={messagesEndRef} className="h-0" />
      )}
    </div>
  );
}
