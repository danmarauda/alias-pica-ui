"use client";

import { motion } from "framer-motion";
import { BotIcon, UserIcon } from "./icons";
import { ReactNode } from "react";
import { StreamableValue, useStreamableValue } from "ai/rsc";
import { Markdown } from "./markdown";
import { ToolInvocation } from "ai";
import { toast } from "sonner";
import Image from "next/image";
import { useState } from "react";

const toTitleCase = (str: string) => {
  return str
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const TextStreamMessage = ({
  content,
}: {
  content: StreamableValue;
}) => {
  const [text] = useStreamableValue(content);

  return (
    <motion.div
      className="flex gap-3 px-4 w-full max-w-3xl mx-auto py-4 first:pt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mt-1 w-5 h-5 flex-shrink-0">
        <BotIcon />
      </div>

      <div className="min-w-0">
        <Markdown content={text} fontSize="sm" />
      </div>
    </motion.div>
  );
};

export const Message = ({
  role,
  content,
  toolInvocations,
}: {
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
}) => {
  const isUser = role === "user";
  const [isDataVisible, setIsDataVisible] = useState(false);

  return (
    <motion.div
      className={`flex px-4 w-full max-w-3xl md:w-[800px] mx-auto py-4 first:pt-8 ${
        isUser ? "justify-end" : ""
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div
        className={`min-w-0 space-y-4 text-xs text-foreground/70 ${
          isUser ? "bg-gray-500/20 rounded-full p-4 max-w-[80%]" : ""
        }`}
      >
        {content && <Markdown content={content as string} fontSize="sm" />}

        {toolInvocations && (
          <div className="space-y-3">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;

                if (!result?.success) {
                  return (
                    <div key={toolCallId} className="text-sm">
                      <div className="p-3 rounded-md border border-red-500/20 bg-red-500/5">
                        <div className="flex items-start gap-2">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="mt-1 text-red-500"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <div>
                            <div className="font-medium text-red-500">
                              Error
                            </div>
                            <div className="text-red-400 text-xs">
                              {result.message}
                            </div>
                          </div>
                        </div>
                        {result.raw && (
                          <pre className="mt-2 p-2 text-xs bg-red-500/5 rounded-sm overflow-x-auto">
                            <code>{JSON.stringify(result.raw, null, 2)}</code>
                          </pre>
                        )}
                      </div>
                    </div>
                  );
                }

                if (result?.message || result?.content) {
                  if (toolName === "getAvailableActions" && result?.actions) {
                    return (
                      <div key={toolCallId} className="text-sm">
                        <div className="p-3 rounded-md border border-blue-500/20 bg-blue-500/10">
                          <div className="flex items-center gap-3">
                            <Image
                              src={`https://assets.buildable.dev/catalog/node-templates/${result?.platform.toLowerCase()}.svg`}
                              alt={`${result?.platform} logo`}
                              width={32}
                              height={32}
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://assets.buildable.dev/catalog/node-templates/question.svg";
                              }}
                            />
                            <div>
                              <div className="font-medium text-blue-600">
                                Fetched {toTitleCase(result?.platform)} Actions
                              </div>
                              <div className="text-gray-500 text-xs">
                                Found {result?.actions?.length} actions
                                available
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (toolName === "getActionKnowledge" && result?.action) {
                    return (
                      <div key={toolCallId} className="text-sm">
                        <div className="p-3 rounded-md border border-blue-500/20 bg-blue-500/10">
                          <div className="flex items-center gap-3">
                            <Image
                              src={`https://assets.buildable.dev/catalog/node-templates/${result?.platform.toLowerCase()}.svg`}
                              alt={`${result?.platform} logo`}
                              width={32}
                              height={32}
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://assets.buildable.dev/catalog/node-templates/question.svg";
                              }}
                            />
                            <div>
                              <div className="font-medium text-blue-600">
                                Fetched Pica Action Knowledge
                              </div>
                              <div className="text-gray-500 text-xs">
                                Loaded knowledge for{" "}
                                {toTitleCase(result?.action?.title)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (toolName === "execute" && result?.success) {
                    return (
                      <div key={toolCallId} className="text-sm">
                        <div className="p-3 rounded-md border border-emerald-500/20 bg-emerald-500/10">
                          <div className="flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                              <Image
                                src={`https://assets.buildable.dev/catalog/node-templates/${result.platform.toLowerCase()}.svg`}
                                alt={`${result.platform} logo`}
                                width={32}
                                height={32}
                                className="relative z-10"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://assets.buildable.dev/catalog/node-templates/question.svg";
                                }}
                              />

                              <div>
                                <div className="flex items-center justify-start gap-1">
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className=" text-emerald-500"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  <div className="font-medium text-emerald-500">
                                    Success
                                  </div>
                                </div>
                                <div className="text-emerald-100/40 text-xs">
                                  {result.action} via{" "}
                                  {toTitleCase(result.platform)}
                                </div>
                              </div>
                            </div>
                            {result.data && (
                              <div className="mt-3">
                                <button
                                  onClick={() =>
                                    setIsDataVisible(!isDataVisible)
                                  }
                                  className="flex items-center justify-end px-1 py-1 text-emerald-500 opacity-80 hover:opacity-100 transition-colors rounded-md hover:bg-emerald-500/10 gap-2 ml-auto text-xs"
                                >
                                  {isDataVisible ? "Hide" : "Show"} Response
                                  Data
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`transform transition-transform ${
                                      isDataVisible ? "rotate-180" : ""
                                    }`}
                                  >
                                    <polyline points="6 9 12 15 18 9" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                          {isDataVisible && (
                            <div className="relative group mt-2">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    JSON.stringify(result.data, null, 2)
                                  );
                                  toast.success(
                                    "Response data copied to clipboard"
                                  );
                                }}
                                className="absolute top-2 right-2 px-1 py-1 text-emerald-500 opacity-80 hover:opacity-100 transition-colors rounded-md hover:bg-emerald-500/10 flex items-center gap-2 z-10"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                    ry="2"
                                  />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                              </button>
                              <pre className="max-h-[150px] overflow-y-scroll p-2 bg-background/50 border border-emerald-500/20 rounded-lg">
                                <code className="font-mono whitespace-pre-wrap break-all text-xs">
                                  {JSON.stringify(result.data, null, 2)}
                                </code>
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                }
              }
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
