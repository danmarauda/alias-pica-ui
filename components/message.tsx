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
import KnowledgeCard from "./ui/knowledge-card";
import { Badge } from "./ui/badge";
import ExecuteCard, { ExecuteResult } from "./ui/execute-card";

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

interface ActionResult {
  platform?: string;
  actions?: any[];
  action?: string;
  success: boolean;
  data?: any;
  message?: string;
  raw?: any;
  title?: string;
}

// Update the type guard to handle both successful and failed cases
const isExecuteResult = (result: ActionResult): result is ExecuteResult => {
  if (!result.success) {
    // For failed executions, we only need success flag and error details
    return typeof result.success === 'boolean' && 
           (typeof result.message === 'string' || typeof result.title === 'string');
  }
  
  // For successful executions, we need action and platform
  return typeof result.action === 'string' && 
         typeof result.platform === 'string' && 
         typeof result.success === 'boolean';
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


  // Collect all actions and knowledge from tool invocations
  const allActions = toolInvocations?.reduce((acc, toolInvocation) => {
    const { toolName, state } = toolInvocation;
    const result = (toolInvocation as any).result as ActionResult;

    if (state === "result") {
      // For execute actions, collect them all (successful and failed)
      if (toolName === "execute") {
        if (!acc.executeResults) {
          acc.executeResults = [];
        }
        acc.executeResults.push(result);
      }
      // For getAvailableActions, collect actions by platform
      if (toolName === "getAvailableActions" && result.actions) {
        const platform = result.platform?.toLowerCase() || 'unknown';
        if (!acc.platforms[platform]) {
          acc.platforms[platform] = {
            name: result.platform || '',
            actions: []
          };
        }
        // Add platform to each action
        const actionsWithPlatform = result.actions.map(action => ({
          ...action,
          platform: result.platform
        }));
        acc.platforms[platform].actions.push(...actionsWithPlatform);
      }
      // For getActionKnowledge, store the action knowledge
      else if (toolName === "getActionKnowledge" && result.action) {
        if (!acc.knowledge) {
          acc.knowledge = [];
        }
        acc.knowledge.push({
          platform: result.platform || '',
          action: result.action
        });
      }
    }
    return acc;
  }, { 
    platforms: {} as Record<string, { name: string; actions: any[] }>,
    knowledge: [] as Array<{ platform: string; action: any }>,
    executeResults: [] as ActionResult[]
  });

  // Calculate total actions across all platforms
  const totalActions = Object.values(allActions?.platforms || {})
    .reduce((sum, platform) => sum + platform.actions.length, 0);

  // Filter execute results to ensure they match ExecuteResult type
  const executeResults = allActions?.executeResults?.filter(isExecuteResult) || [];


  return (
    <motion.div
      className={`flex w-full max-w-3xl md:w-[800px] mx-auto py-4 first:pt-8 ${
        isUser ? "justify-end" : ""
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div
        className={`min-w-0 space-y-4 text-xs text-foreground/70 ${
          isUser ? "bg-gray-500/20 rounded-3xl p-4 max-w-[80%]" : ""
        }`}
      >
        {content && <Markdown content={content as string} fontSize="sm" />}

        {toolInvocations && allActions && (
          <div className="space-y-3">
            {/* Show KnowledgeCard if we have any platforms or knowledge */}
            {(Object.keys(allActions.platforms).length > 0 || allActions.knowledge.length > 0) && (
              <KnowledgeCard
                actions={Object.values(allActions.platforms).flatMap(p => p.actions)}
                knowledge={allActions.knowledge}
                platform={Object.values(allActions.platforms)[0]?.name || ''}
                totalActions={totalActions}
              />
            )}

            {/* Show ExecuteCard if we have any valid execute results */}
            {executeResults.length > 0 && (
              <ExecuteCard results={executeResults} />
            )}

            {/* Keep GitHub connection UI */}
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result" && toolName === "connectGithub") {
                return (
                  <div key={toolCallId} className="text-sm">
                    <div className="p-3 rounded-md border border-blue-500/20 bg-blue-500/10">
                      <div className="flex items-center gap-3">
                        <Image
                          src={`https://assets.buildable.dev/catalog/node-templates/github.svg`}
                          alt="GitHub logo"
                          width={32}
                          height={32}
                        />
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
