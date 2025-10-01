import React from 'react';
import type { Message } from 'cedar-os';
import { Markdown } from "@/components/markdown";

interface CedarMessageRendererProps {
  message: Message;
}

/**
 * Simple Cedar message renderer that displays Cedar messages
 * in a format compatible with the existing chat UI
 */
export function CedarMessageRenderer({ message }: CedarMessageRendererProps) {
  // Determine message styling based on role
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant' || message.role === 'bot';

  // Get message content
  const content = message.content || '';

  return (
    <div className={`w-full ${isUser ? 'max-w-[80%] ml-auto' : 'max-w-3xl'}`}>
      <div
        className={`rounded-lg p-4 ${
          isUser
            ? 'bg-green-900/30 border border-green-800/30'
            : 'bg-black/30 border border-green-800/20'
        }`}
      >
        {/* Message type indicator for special Cedar messages */}
        {message.type && message.type !== 'text' && (
          <div className="text-xs text-green-400 mb-2 font-mono">
            Cedar: {message.type}
          </div>
        )}

        {/* Message content */}
        {content && (
          <div className="prose prose-invert max-w-none">
            <Markdown content={content} />
          </div>
        )}

        {/* Display additional message data for debugging */}
        {process.env.NODE_ENV === 'development' && message.type !== 'text' && (
          <details className="mt-2 text-xs text-gray-500">
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-1 overflow-auto">
              {JSON.stringify(message, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

