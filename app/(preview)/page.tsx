"use client";

import { useRef, useEffect } from "react";
import { Message } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { motion } from "framer-motion";
import { useChat } from "ai/react";
import Image from "next/image";
import { GitHubIcon, GlobeIcon, VercelIcon, HelpIcon } from "@/components/icons";
import { ColorfulLoadingAnimation } from "@/components/loading-spinner";

export default function Home() {
  const { messages, handleSubmit, input, setInput, append, isLoading } = useChat();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Add new useEffect to focus after loading completes
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const suggestedActions = [
    {
      title: "List Available Connections",
      label: "Show me my 5 latest connections",
      action: "List my 5 latest available connections",
    },
    {
      title: "List Supported Actions for Gmail",
      label: "What actions are supported for gmail?",
      action: "What actions are supported for gmail messages?",
    },
    {
      title: "Create a Shopify Product",
      label: "Create a new product in my Shopify store",
      action: "Create a new product in my Shopify",
    },
    {
      title: "Search using Exa AI",
      label: "Search for Paul McCartney using Exa AI",
      action: "Search for Paul McCartney using Exa AI",
    }
  ];

  return (
    <div className="flex flex-col justify-between h-dvh ">
      <div className="flex flex-col h-full">
        <header className="w-full pt-6 px-4 md:px-0 flex-none">
          <div className="flex items-center justify-center max-w-[800px] mx-auto w-full">
            <div className="flex items-center justify-between w-full">

              <a href="https://picaos.com" target="_blank">
                <Image src="/logo-white.svg" alt="Pica Logo" width={150} height={40} />
              </a>

              <div className="flex items-center gap-6">
                <a
                  href="https://github.com/picahq/pica"
                  target="_blank"
                  className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors text-sm"
                >
                  <GitHubIcon size={16} />
                  <span>picahq/pica</span>
                </a>
                <div className="h-4 w-px bg-green-800/20" />
                <a
                  href="https://docs.picaos.com/sdk/vercel-ai"
                  target="_blank"
                  className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors text-sm bg-green-900/20 px-2 py-1 rounded-md border border-green-800 hover:bg-green-900/40"
                >
                  <HelpIcon size={14} />
                  <span>Docs</span>
                </a>
              </div>
            </div>
          </div>
          <div className="max-w-[800px] mx-auto w-full mt-4">
            <div className="h-px w-full bg-green-800/20" />
            <div className="flex items-center justify-between mt-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Join our community of</span>
                <a href="https://www.picaos.com/community" target="_blank" className="text-xs font-medium text-green-500 hover:underline">passionate developers</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Used with</span>
                <a href="https://sdk.vercel.ai" target="_blank" className="flex items-center gap-1.5 text-gray-400 hover:text-green-500 transition-colors">
                  <VercelIcon size={13} />
                  <span className="text-xs">AI SDK</span>
                </a>
              </div>
            </div>
          </div>
        </header>

        <div
          ref={messagesContainerRef}
          className="flex-1 flex flex-col gap-6 w-full md:w-[800px] items-center overflow-y-auto min-h-0 mx-auto px-4 md:px-0"
        >
          {messages.length === 0 && (
            <motion.div className="h-[350px] px-4 w-full md:w-[800px] md:px-0 pt-20">
              <div className="flex flex-col items-center justify-center gap-6 text-center">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                  Pica OneTool Demo
                </h1>
                <div className="flex flex-col gap-3 max-w-[600px] mx-auto">
                  <p className="text-lg text-gray-400">
                    Connect your AI agents to 100+ APIs and tools with a single line of code.
                  </p>
                  <p className="text-sm text-gray-500">
                    Build powerful integrations and automate workflows instantly.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {messages.map((message) => {
            // Always render user messages
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
            if (message.role === "assistant" && (
              message.content ||
              (message.toolInvocations && message.toolInvocations.length > 0)
            )) {
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full px-4 md:px-0"
            >
              <div className="flex items-center gap-2 px-4 py-3">
                <ColorfulLoadingAnimation
                  scale={0.5}
                  colorScheme="picaGreen"
                  animationPattern="default"
                />
                <span className="text-sm text-gray-400 font-light">AI is thinking...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="mt-auto w-full">
          <div className="grid sm:grid-cols-2 gap-2 w-full px-4 md:px-0 mx-auto md:max-w-[800px] mb-4">
            {messages.length === 0 &&
              suggestedActions.map((suggestedAction, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  key={index}
                  className={index > 1 ? "hidden sm:block" : "block"}
                >
                  <button
                    onClick={async () => {
                      append({
                        role: "user",
                        content: suggestedAction.action,
                      });
                    }}
                    className="w-full text-left bg-gray-500/10 hover:bg-gray-500/20 border border-emerald-800/20 hover:border-emerald-800/40 text-white rounded-lg p-3 text-sm transition-all duration-300 flex flex-col gap-1"
                  >
                    <span className="font-medium text-white/90">{suggestedAction.title}</span>
                    <span className="text-white/60 text-xs">
                      {suggestedAction.label}
                    </span>
                  </button>
                </motion.div>
              ))}
          </div>

          <form
            className="flex flex-col gap-2 relative items-center px-4 md:px-0 mb-4"
            onSubmit={handleSubmit}
          >
            <div className="relative flex items-center w-full md:max-w-[800px]">
              <textarea
                ref={inputRef}
                rows={4}
                className="w-full resize-none rounded-lg bg-gray-500/20 px-4 py-4 text-sm text-white placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-0 transition-colors duration-200"
                placeholder={isLoading ? "Waiting for response..." : "Message Pica..."}
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2 w-full md:max-w-[800px] justify-center">
              {messages.length > 0 && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-sm border border-green-800/20 text-gray-400 hover:text-green-500 hover:border-green-500 hover:bg-green-900/20 transition-all duration-300 text-xs shadow-lg hover:shadow-green-900/20"
                  onClick={() => window.location.reload()}
                >
                  Clear chat
                </motion.button>
              )}
              <motion.a
                href="https://app.picaos.com/connections"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-sm border border-green-800/20 text-gray-400 hover:text-green-500 hover:border-green-500 hover:bg-green-900/20 transition-all duration-300 text-xs shadow-lg hover:shadow-green-900/20"
              >
                + New Connection
              </motion.a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
