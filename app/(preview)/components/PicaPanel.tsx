"use client";

import { useState, useEffect } from "react";

interface Connection {
  key: string;
  platform: string;
  active: boolean;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface Action {
  _id: string;
  title: string;
  path: string;
  method: string;
  description?: string;
}

interface PlatformActions {
  [platform: string]: { title: string; count: number; actions: Action[] };
}

export function PicaPanel() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [platformActions, setPlatformActions] = useState<PlatformActions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/pica-connections');

      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);

        // Fetch actions for each unique platform
        const uniquePlatforms = [...new Set(data.connections.map((c: Connection) => c.platform))];
        await fetchActionsForPlatforms(uniquePlatforms);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActionsForPlatforms = async (platforms: string[]) => {
    const actionsMap: PlatformActions = {};

    await Promise.all(
      platforms.map(async (platform) => {
        try {
          const response = await fetch(`/api/pica-actions?platform=${platform}`);
          if (response.ok) {
            const data = await response.json();
            actionsMap[platform] = {
              title: data.actions?.[0]?.title || 'Actions',
              count: data.count || 0,
              actions: data.actions || []
            };
          }
        } catch (error) {
          console.error(`Failed to fetch actions for ${platform}:`, error);
        }
      })
    );

    setPlatformActions(actionsMap);
  };

  const togglePlatformExpansion = async (platform: string) => {
    const isExpanded = expandedPlatforms.has(platform);

    setExpandedPlatforms(prev => {
      const newSet = new Set(prev);
      if (isExpanded) {
        newSet.delete(platform);
      } else {
        newSet.add(platform);
        // If actions not loaded yet, fetch them
        if (!platformActions[platform]?.actions?.length) {
          fetchSinglePlatformActions(platform);
        }
      }
      return newSet;
    });
  };

  const fetchSinglePlatformActions = async (platform: string) => {
    setLoadingActions(prev => new Set(prev).add(platform));

    try {
      const response = await fetch(`/api/pica-actions?platform=${platform}`);
      if (response.ok) {
        const data = await response.json();
        setPlatformActions(prev => ({
          ...prev,
          [platform]: {
            title: data.actions?.[0]?.title || 'Actions',
            count: data.count || 0,
            actions: data.actions || []
          }
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch actions for ${platform}:`, error);
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(platform);
        return newSet;
      });
    }
  };


  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (months > 1) return `about ${months} months ago`;
    if (months === 1) return 'about 1 month ago';
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  };

  const getPlatformName = (platform: string) => {
    return platform
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getPlatformLogo = (platform: string) => {
    return `https://assets.picaos.com/connectors/${platform}.svg`;
  };

  // Sort connections by most recently updated
  const sortedConnections = [...connections].sort((a, b) => {
    if (!a.updatedAt && !b.updatedAt) return 0;
    if (!a.updatedAt) return 1;
    if (!b.updatedAt) return -1;
    return b.updatedAt - a.updatedAt;
  });

  return (
    <div className="flex flex-col h-full bg-black border-r border-[#333333]">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Header */}
      <div className="px-4 py-3 text-xs font-semibold text-[#cccccc] border-b border-[#333333] flex items-center justify-between" style={{ fontFamily: '"Geist Mono", monospace' }}>
        <span>Pica Connections</span>
        <span className="text-[10px] text-[#888888]">{connections.length} total</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-xs text-[#888888]" style={{ fontFamily: '"Geist Mono", monospace' }}>
              Loading connections...
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedConnections.map((conn) => {
              const isExpanded = expandedPlatforms.has(conn.platform);
              const isLoadingActions = loadingActions.has(conn.platform);
              const actions = platformActions[conn.platform]?.actions || [];

              return (
                <div
                  key={conn.key}
                  className={`rounded-lg border transition-all duration-200 ${
                    conn.active
                      ? 'bg-[#050505] border-[#1a1a1a] hover:border-[#2a2a2a] hover:shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                      : 'bg-[#1a0000] border-[#3a0000] opacity-50'
                  }`}
                >
                  {/* Connection Header - Clickable */}
                  <div
                    className="p-3 cursor-pointer hover:bg-[#0a0a0a] transition-colors rounded-lg"
                    onClick={() => togglePlatformExpansion(conn.platform)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Logo */}
                      <div className="flex-shrink-0 w-6 h-6 rounded overflow-hidden bg-white/5 flex items-center justify-center">
                        <img
                          src={getPlatformLogo(conn.platform)}
                          alt={conn.platform}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-[#cccccc]" style={{ fontFamily: '"Geist Mono", monospace' }}>
                            {getPlatformName(conn.platform)}
                          </span>
                          <div className={`w-1.5 h-1.5 rounded-full ${conn.active ? 'bg-green-500' : 'bg-red-500'}`} />

                          {/* Actions count with tool icon in top right */}
                          {platformActions[conn.platform] ? (
                            <span className="text-[10px] text-[#888888] ml-auto flex items-center gap-1" style={{ fontFamily: '"Geist Mono", monospace' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                              </svg>
                              {platformActions[conn.platform].count}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#555555] ml-auto" style={{ fontFamily: '"Geist Mono", monospace' }}>
                              ...
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-[#666666] truncate mb-1" style={{ fontFamily: '"Geist Mono", monospace' }}>
                          {conn.key.length > 35 ? conn.key.substring(0, 35) + '...' : conn.key}
                        </div>

                        <div className="flex items-center justify-between">
                          {conn.updatedAt && (
                            <span className="text-[10px] text-[#555555]" style={{ fontFamily: '"Geist Mono", monospace' }}>
                              {getRelativeTime(conn.updatedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Actions List */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0 border-t border-[#1a1a1a] mt-2">
                      {isLoadingActions ? (
                        <div className="text-[10px] text-[#666666] py-2" style={{ fontFamily: '"Geist Mono", monospace' }}>
                          Loading actions...
                        </div>
                      ) : actions.length > 0 ? (
                        <div className="space-y-1 mt-2 max-h-[300px] overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {actions.map((action) => (
                            <div
                              key={action._id}
                              className="p-2 rounded bg-[#080808] border border-[#151515] hover:border-[#2a2a2a] transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] font-medium text-[#cccccc] truncate" style={{ fontFamily: '"Geist Mono", monospace' }}>
                                    {action.title}
                                  </div>
                                  {action.description && (
                                    <div className="text-[9px] text-[#666666] mt-0.5 line-clamp-2" style={{ fontFamily: '"Geist Mono", monospace' }}>
                                      {action.description}
                                    </div>
                                  )}
                                  <div className="text-[9px] text-[#555555] mt-1 flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 bg-[#0f0f0f] rounded text-[#888888]" style={{ fontFamily: '"Geist Mono", monospace' }}>
                                      {action.method}
                                    </span>
                                    <span className="truncate" style={{ fontFamily: '"Geist Mono", monospace' }}>
                                      {action.path}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#666666] py-2" style={{ fontFamily: '"Geist Mono", monospace' }}>
                          No actions available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#333333]">
        <button
          onClick={fetchConnections}
          disabled={isLoading}
          className="w-full px-3 py-2 text-xs font-semibold text-[#cccccc] bg-[#1a1a1a] border border-[#333333] rounded hover:bg-[#2a2a2a] hover:border-[#444444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: '"Geist Mono", monospace' }}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Connections'}
        </button>
      </div>
    </div>
  );
}
