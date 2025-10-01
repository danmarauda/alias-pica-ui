"use client";

import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk-tools/store"; // Using Midday AI SDK Tools store
import { DefaultChatTransport } from "ai";
import { Header } from "./components/Header";
import { ChatMessages } from "./components/ChatMessages";
import { ChatInput } from "./components/ChatInput";
import { Artifacts } from "./components/Artifacts";
import { ToolCallsPanel } from "./components/ToolCallsPanel";
import { PicaPanel } from "./components/PicaPanel";
import { PicaIntelligencePanel } from "./components/PicaIntelligencePanel";
import { EmbeddedDevTools } from "./components/EmbeddedDevTools";
// import { EnhancedArtifacts } from "./components/EnhancedArtifacts"; // Temporarily disabled due to React version mismatch
import { useAIDevtools, DevtoolsPanel } from "@ai-sdk-tools/devtools"; // Midday DevTools
import { useCedarStore, getCedarState } from "cedar-os";
import { toast } from "sonner";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20241022');
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // AI DevTools hook
  const { events, isCapturing, clearEvents, toggleCapturing } = useAIDevtools({
    enabled: isMounted,
    maxEvents: 1000,
    streamCapture: {
      enabled: true,
      endpoints: ['/api/chat', '/api/connections'],
      autoConnect: true,
    },
  });

  // Cedar state management - removed polling to fix infinite loop
  // TODO: Implement event-based Cedar state updates instead of polling
  const [customState, setCustomState] = useState<Record<string, any> | undefined>();

  // Handle model changes from Cedar
  useEffect(() => {
    if (customState?.selectedModel && customState.selectedModel !== selectedModel) {
      setSelectedModel(customState.selectedModel);
      toast.success(`Model changed to ${customState.selectedModel}`);
    }
  }, [customState?.selectedModel, selectedModel]);

  // Handle notifications from Cedar
  useEffect(() => {
    if (customState?.notification) {
      const { message, type } = customState.notification;
      switch (type) {
        case 'success':
          toast.success(message);
          break;
        case 'error':
          toast.error(message);
          break;
        case 'warning':
          toast.warning(message);
          break;
        default:
          toast.info(message);
      }
    }
  }, [customState?.notification]);

  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat' }), []);
  const { messages, status, sendMessage, stop } = useChat({
    transport,
    id: `chat-${selectedModel}`,
  } as any);

  // Flatten tool calls from message parts for the left lane panel
  const toolCalls = (messages || []).flatMap((m: any) =>
    (m.parts || [])
      .filter((p: any) => typeof p?.type === 'string' && p.type.startsWith('tool-'))
      .map((p: any) => ({
        id: p.toolCallId || `${p.type}-${Math.random()}`,
        name: (p.type as string).replace('tool-', ''),
        state: p.state || 'call',
        args: p.input,
        output: p.output,
      }))
  );

  const [devtoolsOpen, setDevtoolsOpen] = useState(true);
  const [devtoolsWidth, setDevtoolsWidth] = useState(420);
  const [isResizingDevtools, setIsResizingDevtools] = useState(false);
  const [toolCallsWidth, setToolCallsWidth] = useState(320);
  const [isResizingToolCalls, setIsResizingToolCalls] = useState(false);
  const [picaPanelWidth, setPicaPanelWidth] = useState(280);
  const [isResizingPicaPanel, setIsResizingPicaPanel] = useState(false);
  const [picaIntelligenceWidth, setPicaIntelligenceWidth] = useState(300);
  const [isResizingPicaIntelligence, setIsResizingPicaIntelligence] = useState(false);

  // Handle devtools toggle from Cedar
  useEffect(() => {
    if (customState?.toggleDevtools) {
      setDevtoolsOpen((prev) => !prev);
    }
  }, [customState?.toggleDevtools]);

  // Handle DevTools resize
  useEffect(() => {
    if (!isResizingDevtools) return;

    const handleMouseMove = (e: MouseEvent) => {
      const minWidth = 300;
      const maxWidth = window.innerWidth - toolCallsWidth - 16 - 800; // toolCallsWidth + resize handles (8+8) + min space for chat+artifacts
      const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX));
      setDevtoolsWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingDevtools(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingDevtools, toolCallsWidth]);

  // Handle Tool Calls resize
  useEffect(() => {
    if (!isResizingToolCalls) return;

    const handleMouseMove = (e: MouseEvent) => {
      const devtoolsOffset = devtoolsOpen ? devtoolsWidth + 8 : 0; // devtools width + its resize handle
      const minWidth = 250;
      const maxWidth = 600;

      // Calculate new width based on mouse position relative to devtools
      const mousePosition = e.clientX;
      const proposedWidth = mousePosition - devtoolsOffset - 8; // subtract the tool calls resize handle

      // Don't let tool calls start before devtools ends
      if (mousePosition <= devtoolsOffset + 8) {
        return;
      }

      // Ensure minimum space for chat + artifacts (800px)
      const maxAllowedWidth = window.innerWidth - devtoolsOffset - 8 - 800;

      const newWidth = Math.max(minWidth, Math.min(Math.min(maxWidth, maxAllowedWidth), proposedWidth));
      setToolCallsWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingToolCalls(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingToolCalls, devtoolsOpen, devtoolsWidth]);

  // Handle Pica Panel resize
  useEffect(() => {
    if (!isResizingPicaPanel) return;

    const handleMouseMove = (e: MouseEvent) => {
      const devtoolsOffset = devtoolsOpen ? devtoolsWidth + 8 : 0;
      const toolCallsOffset = toolCallsWidth + 8;
      const minWidth = 250;
      const maxWidth = 400;

      const mousePosition = e.clientX;
      const proposedWidth = mousePosition - devtoolsOffset - toolCallsOffset - 8;

      // Don't let pica panel start before tool calls ends
      if (mousePosition <= devtoolsOffset + toolCallsOffset + 8) {
        return;
      }

      // Ensure minimum space for pica intelligence + chat + artifacts (800px + picaIntelligenceWidth)
      const maxAllowedWidth = window.innerWidth - devtoolsOffset - toolCallsOffset - 8 - picaIntelligenceWidth - 8 - 800;

      const newWidth = Math.max(minWidth, Math.min(Math.min(maxWidth, maxAllowedWidth), proposedWidth));
      setPicaPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingPicaPanel(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingPicaPanel, devtoolsOpen, devtoolsWidth, toolCallsWidth, picaIntelligenceWidth]);

  // Handle Pica Intelligence Panel resize
  useEffect(() => {
    if (!isResizingPicaIntelligence) return;

    const handleMouseMove = (e: MouseEvent) => {
      const devtoolsOffset = devtoolsOpen ? devtoolsWidth + 8 : 0;
      const toolCallsOffset = toolCallsWidth + 8;
      const picaPanelOffset = picaPanelWidth + 8;
      const minWidth = 250;
      const maxWidth = 400;

      const mousePosition = e.clientX;
      const proposedWidth = mousePosition - devtoolsOffset - toolCallsOffset - picaPanelOffset - 8;

      // Don't let pica intelligence panel start before pica panel ends
      if (mousePosition <= devtoolsOffset + toolCallsOffset + picaPanelOffset + 8) {
        return;
      }

      // Ensure minimum space for chat + artifacts (800px)
      const maxAllowedWidth = window.innerWidth - devtoolsOffset - toolCallsOffset - picaPanelOffset - 8 - 800;

      const newWidth = Math.max(minWidth, Math.min(Math.min(maxWidth, maxAllowedWidth), proposedWidth));
      setPicaIntelligenceWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingPicaIntelligence(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingPicaIntelligence, devtoolsOpen, devtoolsWidth, toolCallsWidth, picaPanelWidth]);

  return (
    <div className="flex h-dvh bg-background">
      {/* DevTools Toggle Button */}
      {!devtoolsOpen && (
        <button
          onClick={() => setDevtoolsOpen(true)}
          className="fixed left-4 top-4 z-50 flex items-center justify-center w-8 h-8 bg-black border border-[#333333] rounded hover:bg-[#1a1a1a] transition-colors"
          style={{ fontFamily: '"Geist Mono", monospace' }}
        >
          <span className="text-[#cccccc] text-sm">▶</span>
        </button>
      )}

      {/* Left lane: DevTools */}
      {devtoolsOpen && (
        <>
          <aside
            className="hidden lg:flex flex-col overflow-visible devtools-container relative shrink-0"
            style={{ width: `${devtoolsWidth}px` }}
          >
            <DevtoolsPanel
              events={events}
              isCapturing={isCapturing}
              onToggleCapturing={toggleCapturing}
              onClearEvents={clearEvents}
              onClose={() => setDevtoolsOpen(false)}
              onTogglePosition={() => {}}
              config={{
                enabled: true,
                maxEvents: 1000,
                position: "right",
                height: 400,
                theme: "auto",
                streamCapture: {
                  enabled: true,
                  endpoint: "/api/chat",
                  autoConnect: true,
                },
              }}
            />
          </aside>
          {/* Resize handle - outside the panel */}
          <div
            className="hidden lg:block relative shrink-0"
            style={{ width: '8px', zIndex: 100 }}
          >
            <div
              className="absolute inset-0 cursor-col-resize hover:bg-[#555555] transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizingDevtools(true);
              }}
            />
          </div>
        </>
      )}

      {/* Tool Calls */}
      <aside
        className="hidden md:flex flex-col border-r border-[#333333] bg-black overflow-hidden shrink-0"
        style={{ width: `${toolCallsWidth}px` }}
      >
        <div className="px-4 py-3 text-xs font-semibold text-[#cccccc] border-b border-[#333333]" style={{ fontFamily: '"Geist Mono", monospace' }}>
          Pica Tool Calls
        </div>
        <ToolCallsPanel toolCalls={toolCalls} />
      </aside>

      {/* Tool Calls Resize Handle */}
      <div
        className="hidden md:block relative shrink-0"
        style={{ width: '8px', zIndex: 100 }}
      >
        <div
          className="absolute inset-0 cursor-col-resize hover:bg-[#555555] transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizingToolCalls(true);
          }}
        />
      </div>

      {/* Pica Panel */}
      <aside
        className="hidden md:flex flex-col bg-black overflow-hidden shrink-0"
        style={{ width: `${picaPanelWidth}px` }}
      >
        <PicaPanel />
      </aside>

      {/* Pica Panel Resize Handle */}
      <div
        className="hidden md:block relative shrink-0"
        style={{ width: '8px', zIndex: 100 }}
      >
        <div
          className="absolute inset-0 cursor-col-resize hover:bg-[#555555] transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizingPicaPanel(true);
          }}
        />
      </div>

      {/* Pica Intelligence Panel */}
      <aside
        className="hidden md:flex flex-col bg-black overflow-hidden shrink-0"
        style={{ width: `${picaIntelligenceWidth}px` }}
      >
        <PicaIntelligencePanel toolCalls={toolCalls} />
      </aside>

      {/* Pica Intelligence Panel Resize Handle */}
      <div
        className="hidden md:block relative shrink-0"
        style={{ width: '8px', zIndex: 100 }}
      >
        <div
          className="absolute inset-0 cursor-col-resize hover:bg-[#555555] transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizingPicaIntelligence(true);
          }}
        />
      </div>

      {/* Middle lane: Chat */}
      <main className="flex-1 min-w-0 min-h-0 flex flex-col">
        <Header />
        <ChatMessages messages={messages} status={status} />
        <ChatInput
          selectedModel={selectedModel}
          status={status}
          messages={messages}
          onSendMessage={sendMessage}
          onStop={stop}
          onModelChange={setSelectedModel}
          onToggleDevtools={() => setDevtoolsOpen((v) => !v)}
        />
      </main>

      {/* Right lane: Artifacts */}
      <aside className="hidden md:flex w-[576px] lg:w-[640px] xl:w-[768px] flex-col border-l border-border bg-card overflow-hidden">
        <div className="px-4 py-3 text-xs font-mono font-semibold text-muted-foreground border-b border-border flex items-center justify-between">
          <span>Artifacts</span>
          <span className="text-[10px]">Midday AI SDK</span>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <Artifacts messages={messages} />
        </div>
      </aside>

    </div>
  );
}
