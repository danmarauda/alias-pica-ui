import { Message } from "@/components/message";
import { motion } from "framer-motion";
import { ColorfulLoadingAnimation } from "@/components/loading-spinner";
import { Message as MessageType } from "ai";
import { suggestedActions } from "../constants/suggestedActions";
import { useEffect, useRef } from "react";

interface ChatMessagesProps {
  messages: MessageType[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only scroll when a new user message is added
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col gap-6 w-full md:w-[800px] items-center overflow-y-auto  mx-auto md:px-0 custom-scrollbar h-[calc(100vh-300px)]"
    >
      {messages.length === 0 && (
        <motion.div className="h-[350px] px-4 w-full md:w-[800px] md:px-0 pt-20">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              Pica OneTool Demo
            </h1>
            <div className="flex flex-col gap-3 max-w-[600px] mx-auto">
              <p className="text-lg text-gray-400">
                Connect your AI agents to 100+ APIs and tools with a single line
                of code.
              </p>
              <p className="text-sm text-gray-500">
                Build powerful integrations and automate workflows instantly.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {messages.map((message) => {
        if (message.role === "user") {
          return (
            <Message
              key={message.id}
              role={message.role}
              content={message.content}
              toolInvocations={message.toolInvocations}
            />
          );
        }

        // For assistant messages, render if there's content or tool invocations
        if (
          message.role === "assistant" &&
          (message.content ||
            (message.toolInvocations && message.toolInvocations.length > 0))
        ) {
          return (
            <Message
              key={message.id}
              role={message.role}
              content={message.content}
              toolInvocations={message.toolInvocations}
            />
          );
        }

        return null;
      })}

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
      
      {messages.length > 0 && (
        <div
          ref={messagesEndRef}
          className="relative flex items-center justify-center w-full h-[500px] min-h-[500px]"
        />
      )}
    </div>
  );
}
