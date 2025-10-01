"use client";

import { useState } from "react";

interface ToolCall {
  id: string;
  name: string;
  state: string;
  args: any;
  output: any;
}

interface PicaIntelligencePanelProps {
  toolCalls: ToolCall[];
}

export function PicaIntelligencePanel({ toolCalls }: PicaIntelligencePanelProps) {
  const [selectedCall, setSelectedCall] = useState<string | null>(null);

  // Filter active tool calls (not yet completed)
  const activeCalls = toolCalls.filter((call) => call.state === "call" || call.state === "partial-call");

  // Filter executed/completed tool calls
  const executedCalls = toolCalls.filter((call) => call.state === "result");

  return (
    <div className="flex flex-col h-full bg-black border-r border-[#333333]">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header */}
      <div className="px-4 py-3 text-xs font-semibold text-[#cccccc] border-b border-[#333333]" style={{ fontFamily: '"Geist Mono", monospace' }}>
        Pica Intelligence
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {toolCalls.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-[#666666]" style={{ fontFamily: '"Geist Mono", monospace' }}>
              No tool calls yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Active Actions Section */}
            {activeCalls.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold text-[#888888] mb-2 px-1" style={{ fontFamily: '"Geist Mono", monospace' }}>
                  ACTIVE ACTIONS
                </div>
                <div className="space-y-2">
                  {activeCalls.map((call) => (
                    <div
                      key={call.id}
                      className="p-3 rounded-lg bg-[#050505] border border-[#1a1a1a] hover:border-[#2a2a2a] hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#cccccc]" style={{ fontFamily: '"Geist Mono", monospace' }}>
                          {call.name}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded" style={{ fontFamily: '"Geist Mono", monospace' }}>
                          ACTIVE
                        </span>
                      </div>
                      {call.args && (
                        <div className="text-[10px] text-[#666666] line-clamp-2" style={{ fontFamily: '"Geist Mono", monospace' }}>
                          {JSON.stringify(call.args).substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Executed Actions Section */}
            {executedCalls.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold text-[#888888] mb-2 px-1" style={{ fontFamily: '"Geist Mono", monospace' }}>
                  EXECUTED ACTIONS ({executedCalls.length})
                </div>
                <div className="space-y-2">
                  {executedCalls.map((call) => (
                    <div
                      key={call.id}
                      className="rounded-lg bg-[#050505] border border-[#1a1a1a] hover:border-[#2a2a2a] hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-200"
                    >
                      <div
                        className="p-3 cursor-pointer"
                        onClick={() => setSelectedCall(call.id === selectedCall ? null : call.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#cccccc]" style={{ fontFamily: '"Geist Mono", monospace' }}>
                            {call.name}
                          </span>
                          <span className="text-[#666666] text-xs">
                            {selectedCall === call.id ? '▼' : '▶'}
                          </span>
                        </div>
                      </div>

                      {selectedCall === call.id && (
                        <div className="px-3 pb-3 border-t border-[#1a1a1a] space-y-2 pt-2">
                          {call.args && (
                            <div>
                              <div className="text-[9px] text-[#888888] mb-1" style={{ fontFamily: '"Geist Mono", monospace' }}>
                                Arguments:
                              </div>
                              <pre className="text-[9px] text-[#cccccc] whitespace-pre-wrap break-all bg-[#080808] rounded p-2 overflow-x-auto max-h-[150px] overflow-y-auto scrollbar-hide" style={{ fontFamily: '"Geist Mono", monospace', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {JSON.stringify(call.args, null, 2)}
                              </pre>
                            </div>
                          )}
                          {call.output && (
                            <div>
                              <div className="text-[9px] text-[#888888] mb-1" style={{ fontFamily: '"Geist Mono", monospace' }}>
                                Output:
                              </div>
                              <pre className="text-[9px] text-[#cccccc] whitespace-pre-wrap break-all bg-[#080808] rounded p-2 overflow-x-auto max-h-[150px] overflow-y-auto scrollbar-hide" style={{ fontFamily: '"Geist Mono", monospace', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {JSON.stringify(call.output, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
