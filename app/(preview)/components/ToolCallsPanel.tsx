"use client";

import { useState } from "react";

interface ToolCall {
  id: string;
  name: string;
  state: string;
  args: any;
  output: any;
}

interface ToolCallsPanelProps {
  toolCalls: ToolCall[];
}

export function ToolCallsPanel({ toolCalls }: ToolCallsPanelProps) {
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCalls = toolCalls.filter((call) =>
    call.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#333333]">
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] text-[#cccccc]"
            style={{ fontFamily: '"Geist Mono", monospace' }}
          >
            {toolCalls.length} {toolCalls.length === 1 ? "call" : "calls"}
          </span>
        </div>
        <button
          onClick={() => setSearchQuery("")}
          className="text-[14px] text-[#cccccc] hover:text-white transition-colors font-medium"
          style={{ fontFamily: '"Geist Mono", monospace' }}
        >
          Clear
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-[#333333]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tool calls..."
          className="w-full bg-transparent text-[12px] text-white placeholder:text-[#888888] outline-none"
          style={{ fontFamily: '"Geist Mono", monospace' }}
        />
      </div>

      {/* Tool Calls List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCalls.length === 0 ? (
          <div className="p-3 text-[12px] text-[#888888]" style={{ fontFamily: '"Geist Mono", monospace' }}>
            {searchQuery ? "No matching tool calls" : "No tool calls yet"}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => setSelectedCall(call.id === selectedCall ? null : call.id)}
                className="border border-[#333333] rounded bg-black hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              >
                {/* Call Header */}
                <div className="flex items-center justify-between p-2">
                  <span
                    className="text-[12px] text-white font-medium"
                    style={{ fontFamily: '"Geist Mono", monospace' }}
                  >
                    {call.name}
                  </span>
                  <span
                    className="text-[10px] text-[#888888] px-1.5 py-0.5 rounded bg-[#1a1a1a]"
                    style={{ fontFamily: '"Geist Mono", monospace' }}
                  >
                    {call.state}
                  </span>
                </div>

                {/* Expanded Details */}
                {selectedCall === call.id && (
                  <div className="border-t border-[#333333] p-2 space-y-2">
                    {call.args && (
                      <div>
                        <div className="text-[10px] text-[#888888] mb-1" style={{ fontFamily: '"Geist Mono", monospace' }}>
                          Arguments:
                        </div>
                        <pre className="text-[10px] text-[#cccccc] whitespace-pre-wrap break-all bg-[#1a1a1a] rounded p-2 overflow-x-auto" style={{ fontFamily: '"Geist Mono", monospace' }}>
                          {JSON.stringify(call.args, null, 2)}
                        </pre>
                      </div>
                    )}
                    {call.output && (
                      <div>
                        <div className="text-[10px] text-[#888888] mb-1" style={{ fontFamily: '"Geist Mono", monospace' }}>
                          Output:
                        </div>
                        <pre className="text-[10px] text-[#cccccc] whitespace-pre-wrap break-all bg-[#1a1a1a] rounded p-2 overflow-x-auto" style={{ fontFamily: '"Geist Mono", monospace' }}>
                          {JSON.stringify(call.output, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}