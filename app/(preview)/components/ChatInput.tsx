import { motion } from "framer-motion";
import { FormEvent, useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";
import { ModelSelector } from "@/components/model-selector";
import type { UIMessage } from "ai";
import { Google } from "@/components/ui/svgs/google";
import { Slack } from "@/components/ui/svgs/slack";
import { Notion } from "@/components/ui/svgs/notion";
import { Linear } from "@/components/ui/svgs/linear";
import { GithubDark } from "@/components/ui/svgs/githubDark";
import { Stripe } from "@/components/ui/svgs/stripe";
import { Shopify } from "@/components/ui/svgs/shopify";
import { Dropbox } from "@/components/ui/svgs/dropbox";
import { Microsoft } from "@/components/ui/svgs/microsoft";
import { Zoom } from "@/components/ui/svgs/zoom";
import { Figma } from "@/components/ui/svgs/figma";
import { Vercel } from "@/components/ui/svgs/vercel";
import { Discord } from "@/components/ui/svgs/discord";
import { Twitter } from "@/components/ui/svgs/twitter";
import { Openai } from "@/components/ui/svgs/openai";

interface Connection {
  name: string;
  connector: string;
}

interface SuggestedAction {
  title: string;
  label: string;
  action: string;
  platform?: string;
}

interface ChatInputProps {
  selectedModel: string;
  status: string;
  messages: UIMessage[];
  onSendMessage: (message: { text: string }) => Promise<void> | void;
  onStop: () => void;
  onModelChange: (model: string) => void;
  onToggleDevtools?: () => void;
}

// Platform icon mapper
const getPlatformIcon = (platform?: string) => {
  if (!platform) return null;

  const platformLower = platform.toLowerCase();
  const iconMap: Record<string, any> = {
    google: Google,
    gmail: Google,
    'google-calendar': Google,
    'google-drive': Google,
    slack: Slack,
    notion: Notion,
    linear: Linear,
    github: GithubDark,
    stripe: Stripe,
    shopify: Shopify,
    dropbox: Dropbox,
    microsoft: Microsoft,
    zoom: Zoom,
    figma: Figma,
    vercel: Vercel,
    discord: Discord,
    twitter: Twitter,
    x: Twitter,
    openai: Openai,
    'open-ai': Openai,
    gpt: Openai,
  };

  // Try exact match first
  if (iconMap[platformLower]) {
    return iconMap[platformLower];
  }

  // Try partial match
  for (const key in iconMap) {
    if (platformLower.includes(key) || key.includes(platformLower)) {
      return iconMap[key];
    }
  }

  return null;
};

export function ChatInput({
  selectedModel,
  status,
  messages,
  onSendMessage,
  onStop,
  onModelChange,
  onToggleDevtools,
}: ChatInputProps) {
  const isLoading = status === 'streaming' || status === 'submitted';
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState("");
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Fetch connections and AI-generated suggestions with streaming
  const fetchSuggestions = async () => {
    console.log('[ChatInput] Starting fetchSuggestions...');
    setIsLoadingSuggestions(true);
    setSuggestedActions([]); // Clear existing suggestions

    try {
      console.log('[ChatInput] Fetching /api/connections...');
      const response = await fetch('/api/connections');
      console.log('[ChatInput] Response status:', response.status);

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[ChatInput] Stream complete');
          break;
        }

        const chunk = decoder.decode(value);
        console.log('[ChatInput] Received chunk:', chunk);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('[ChatInput] Parsed data:', data);

              if (data.suggestions && data.suggestions.length > 0) {
                console.log('[ChatInput] Setting suggestions:', data.suggestions);
                setSuggestedActions(data.suggestions);
              }

              if (data.done) {
                console.log('[ChatInput] Done signal received');
                setIsLoadingSuggestions(false);
              }
            } catch (e) {
              console.error('[ChatInput] Error parsing SSE data:', e, 'Line:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('[ChatInput] Error fetching suggestions:', error);
      // Fallback suggestion
      setSuggestedActions([
        {
          title: "List Available Connections",
          label: "Show available integrations",
          action: "What integrations are available?",
        },
      ]);
      setIsLoadingSuggestions(false);
    }
  };

  // Fetch suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage({ text: input.trim() });
    setInput("");
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  const wrappedHandleSubmit = (e: FormEvent<HTMLFormElement>) => {
    handleSubmit(e);
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  };

  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setOptionsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="mt-auto w-full">
      {messages.length === 0 && (
        <div className="flex items-center gap-2 w-full mb-4 overflow-hidden">
          <div className="flex-1 overflow-hidden relative group px-4 md:px-6">
            <div className="flex gap-2 animate-marquee group-hover:animation-paused">
              {isLoadingSuggestions && suggestedActions.length === 0 ? (
                // Loading skeletons - fill the row
                <>
                  {[...Array(8)].map((_, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      key={`skeleton-${index}`}
                      className="flex-shrink-0"
                    >
                      <div className="bg-card border border-border rounded p-3 text-sm flex flex-col gap-1 min-w-[180px] max-w-[320px] animate-pulse">
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                        <div className="h-2 bg-muted/60 rounded w-full"></div>
                      </div>
                    </motion.div>
                  ))}
                </>
              ) : (
                // Actual suggestions - duplicate to fill row and create seamless loop
                <>
                  {[...suggestedActions, ...suggestedActions, ...suggestedActions, ...suggestedActions].map((suggestedAction, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * (index % suggestedActions.length) }}
                    key={index}
                    className="flex-shrink-0 group"
                  >
                    <button
                      onClick={() => {
                        onSendMessage({ text: suggestedAction.action });
                      }}
                      className="relative text-left bg-card hover:bg-accent border border-border rounded p-3 text-sm transition-all duration-200 flex flex-col gap-1 min-w-[180px] max-w-[320px] w-auto overflow-hidden group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:border-primary/50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center gap-2">
                        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                          {(() => {
                            const IconComponent = getPlatformIcon(suggestedAction.platform);
                            if (IconComponent) {
                              return <IconComponent className="w-5 h-5" />;
                            }
                            return (
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="w-3 h-3 text-primary"
                                >
                                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                              </div>
                            );
                          })()}
                        </div>
                        <span className="font-mono font-medium text-foreground text-xs flex-1">
                          {suggestedAction.title}
                        </span>
                      </div>
                      <span className="font-mono text-muted-foreground text-[10px] ml-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 max-h-0 group-hover:max-h-10 overflow-hidden">
                        {suggestedAction.label}
                      </span>
                    </button>
                  </motion.div>
                ))}
              </>
            )}
            </div>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={fetchSuggestions}
            disabled={isLoadingSuggestions}
            className="flex-shrink-0 px-3 py-3 rounded bg-card border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mr-4 md:mr-6"
            title="Refresh suggestions"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isLoadingSuggestions ? "animate-spin" : ""}
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </motion.button>
        </div>
      )}
      <form
        className="flex flex-col gap-2 relative items-center px-4 md:px-0 mb-4"
        onSubmit={wrappedHandleSubmit}
      >
        <div className="relative flex items-center w-full">
          <textarea
            ref={inputRef}
            rows={4}
            className="w-full resize-none rounded bg-input border border-border px-4 py-4 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors duration-200"
            placeholder={
              isLoading ? "Waiting for response..." : "Message Pica..."
            }
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            disabled={isLoading}
          />
          {(status === "submitted" || status === "streaming") && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2 px-3 py-1.5 rounded bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 text-xs font-mono"
              onClick={onStop}
            >
              Stop
            </motion.button>
          )}
        </div>
        <div className="flex gap-2 w-full justify-center items-center px-4 md:px-6">
          <ModelSelector selectedModel={selectedModel} onModelChange={onModelChange} />
          {messages.length > 0 && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 px-3 py-1.5 rounded bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 text-xs font-mono"
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
            className="mt-2 px-3 py-1.5 rounded bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 text-xs font-mono"
          >
            + New Connection
          </motion.a>
          <div className="relative mt-2" ref={optionsRef}>
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1.5 rounded bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 text-xs font-mono"
              onClick={() => setOptionsOpen(v => !v)}
            >
              Options
            </motion.button>
            {optionsOpen && (
              <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded shadow-lg z-50 min-w-[200px] py-1">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-xs font-mono text-foreground hover:bg-accent"
                  onClick={() => {
                    setOptionsOpen(false);
                    onToggleDevtools?.();
                  }}
                >
                  Toggle Devtools
                </button>
                <a
                  href="https://docs.picaos.com/sdk/vercel-ai"
                  target="_blank"
                  className="block px-3 py-2 text-xs font-mono text-foreground hover:bg-accent"
                >
                  Docs
                </a>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
