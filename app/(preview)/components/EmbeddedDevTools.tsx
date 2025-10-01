"use client";

import { useState } from "react";
import type { AIDevtoolsEvent } from "@ai-sdk-tools/devtools";

interface EmbeddedDevToolsProps {
  events: AIDevtoolsEvent[];
  isCapturing: boolean;
  onToggleCapturing: () => void;
  onClearEvents: () => void;
}

export function EmbeddedDevTools({
  events,
  isCapturing,
  onToggleCapturing,
  onClearEvents,
}: EmbeddedDevToolsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const filteredEvents = events.filter((event) =>
    event.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#333333]">
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] text-[#cccccc]"
            style={{ fontFamily: '"Geist Mono", monospace' }}
          >
            {events.length} {events.length === 1 ? "event" : "events"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCapturing}
            className={`text-[14px] hover:text-white transition-colors font-medium ${
              isCapturing ? "text-[#4ade80]" : "text-[#888888]"
            }`}
            style={{ fontFamily: '"Geist Mono", monospace' }}
          >
            {isCapturing ? "⏸" : "▶"}
          </button>
          <button
            onClick={onClearEvents}
            className="text-[14px] text-[#cccccc] hover:text-white transition-colors font-medium"
            style={{ fontFamily: '"Geist Mono", monospace' }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-[#333333]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search events..."
          className="w-full bg-transparent text-[12px] text-white placeholder:text-[#888888] outline-none"
          style={{ fontFamily: '"Geist Mono", monospace' }}
        />
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="p-3 text-[12px] text-[#888888]" style={{ fontFamily: '"Geist Mono", monospace' }}>
            {searchQuery ? "No matching events" : "▸ waiting for events..."}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event.id === selectedEvent ? null : event.id)}
                className="border border-[#333333] rounded bg-black hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              >
                {/* Event Header */}
                <div className="flex items-center justify-between p-2">
                  <span
                    className="text-[12px] text-white font-medium"
                    style={{ fontFamily: '"Geist Mono", monospace' }}
                  >
                    {event.type}
                  </span>
                  <span
                    className="text-[10px] text-[#888888]"
                    style={{ fontFamily: '"Geist Mono", monospace' }}
                  >
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Expanded Details */}
                {selectedEvent === event.id && (
                  <div className="border-t border-[#333333] p-2 space-y-2">
                    <div>
                      <div className="text-[10px] text-[#888888] mb-1" style={{ fontFamily: '"Geist Mono", monospace' }}>
                        Data:
                      </div>
                      <pre className="text-[10px] text-[#cccccc] whitespace-pre-wrap break-all bg-[#1a1a1a] rounded p-2 overflow-x-auto" style={{ fontFamily: '"Geist Mono", monospace' }}>
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
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