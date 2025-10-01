interface Connection {
  key: string;
  platform: string;
  active: boolean;
  description?: string;
  updatedAt?: number;
  createdAt?: number;
}

interface Suggestion {
  title: string;
  label: string;
  action: string;
  platform: string;
}

// Fetch connections from Pica API
async function fetchConnections(): Promise<Connection[]> {
  const response = await fetch('https://api.picaos.com/v1/vault/connections', {
    headers: {
      'x-pica-secret': process.env.PICA_SECRET_KEY as string,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch connections');
  }

  const data = await response.json();
  return data.rows || [];
}

// Generate contextual suggestions based on platform
async function generatePlatformSuggestion(connection: Connection): Promise<Suggestion> {
  const platform = connection.platform.toLowerCase();
  const connectionKey = connection.key;

  try {
    switch (platform) {
      case 'gmail':
        return {
          title: "Check recent emails",
          label: "View your latest inbox messages",
          action: "Show me my 5 most recent unread emails",
          platform: "gmail"
        };

      case 'google-calendar':
        return {
          title: "View upcoming events",
          label: "See your schedule for today",
          action: "What are my upcoming calendar events?",
          platform: "google-calendar"
        };

      case 'github':
        return {
          title: "Review open issues",
          label: "Check your GitHub activity",
          action: "What are my open GitHub issues?",
          platform: "github"
        };

      case 'openai':
        return {
          title: "Generate content",
          label: "Use AI to create something new",
          action: "Write a creative blog post intro about AI",
          platform: "openai"
        };

      case 'slack':
        return {
          title: "Check recent messages",
          label: "Review team conversations",
          action: "Show me recent Slack messages",
          platform: "slack"
        };

      case 'notion':
        return {
          title: "Search your workspace",
          label: "Find notes and documents",
          action: "Search my Notion for project notes",
          platform: "notion"
        };

      case 'linear':
        return {
          title: "View assigned issues",
          label: "Check your Linear tasks",
          action: "What Linear issues are assigned to me?",
          platform: "linear"
        };

      case 'google-drive':
        return {
          title: "Find recent files",
          label: "Access your documents",
          action: "Show me my recent Google Drive files",
          platform: "google-drive"
        };

      case 'google-docs':
        return {
          title: "Open recent docs",
          label: "View your Google Docs",
          action: "List my recent Google Docs",
          platform: "google-docs"
        };

      case 'airtable':
        return {
          title: "Query your base",
          label: "Access Airtable records",
          action: "Show me records from my Airtable base",
          platform: "airtable"
        };

      case 'vercel':
        return {
          title: "Check deployments",
          label: "Review your Vercel projects",
          action: "What are my recent Vercel deployments?",
          platform: "vercel"
        };

      case 'clerk':
        return {
          title: "View user data",
          label: "Check authentication stats",
          action: "Show me Clerk user statistics",
          platform: "clerk"
        };

      case 'convex':
        return {
          title: "Query database",
          label: "Access your Convex data",
          action: "What data is in my Convex database?",
          platform: "convex"
        };

      case 'resend':
        return {
          title: "Check email status",
          label: "View sent emails",
          action: "Show me my recent Resend email activity",
          platform: "resend"
        };

      case 'exa':
        return {
          title: "Search the web",
          label: "Find relevant content",
          action: "Search for latest AI news with Exa",
          platform: "exa"
        };

      case 'agent-ql':
        return {
          title: "Query with natural language",
          label: "Use AgentQL to find data",
          action: "Use AgentQL to search for information",
          platform: "agent-ql"
        };

      case 'elevenlabs':
        return {
          title: "Generate speech",
          label: "Convert text to audio",
          action: "Generate a voice message with ElevenLabs",
          platform: "elevenlabs"
        };

      case 'apify':
        return {
          title: "Run web scraper",
          label: "Extract web data",
          action: "Scrape data from a website with Apify",
          platform: "apify"
        };

      default:
        return {
          title: `Use ${platform}`,
          label: `Interact with ${connection.description || platform}`,
          action: `What can I do with my ${platform} connection?`,
          platform
        };
    }
  } catch (error) {
    console.error(`[API] Error generating suggestion for ${platform}:`, error);
    return {
      title: `Use ${platform}`,
      label: `Interact with ${connection.description || platform}`,
      action: `What can I do with my ${platform} connection?`,
      platform
    };
  }
}

export async function GET() {
  console.log('[API /api/connections] Request received');
  try {
    console.log('[API] Fetching connections from Pica API...');
    const connections = await fetchConnections();
    console.log(`[API] Found ${connections.length} connections`);

    // Filter active connections and deduplicate by platform, keeping the most recent
    const activeConnections = connections.filter(conn => conn.active);

    // Group by platform and select the most recently updated connection for each
    const platformMap = new Map<string, Connection>();
    activeConnections.forEach(conn => {
      const existing = platformMap.get(conn.platform);
      if (!existing || (conn.updatedAt && existing.updatedAt && conn.updatedAt > existing.updatedAt)) {
        platformMap.set(conn.platform, conn);
      }
    });

    // Convert map back to array
    const uniqueConnections = Array.from(platformMap.values());
    console.log(`[API] Deduplicated to ${uniqueConnections.length} unique platforms`);

    // Generate suggestions for each unique connection
    const suggestionPromises = uniqueConnections.map(conn => generatePlatformSuggestion(conn));

    const suggestions = await Promise.all(suggestionPromises);

    console.log('[API] Generated suggestions:', suggestions);

    // If no suggestions were generated, provide defaults
    if (suggestions.length === 0) {
      console.log('[API] No active connections, using defaults');
      const defaultSuggestions = [{
        title: "Connect an Integration",
        label: "Add your first Pica connection",
        action: "How do I connect my first integration?",
        platform: "pica"
      }];

      // Return as SSE format for DevTools monitoring
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const suggestionData = `data: ${JSON.stringify({ suggestions: defaultSuggestions })}\n\n`;
          controller.enqueue(encoder.encode(suggestionData));
          const doneData = `data: ${JSON.stringify({ done: true })}\n\n`;
          controller.enqueue(encoder.encode(doneData));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    console.log('[API] Sending SSE response with suggestions:', suggestions);
    // Return as SSE format for DevTools monitoring
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send suggestions event
        const suggestionData = `data: ${JSON.stringify({ suggestions })}\n\n`;
        console.log('[API] Sending suggestion data:', suggestionData);
        controller.enqueue(encoder.encode(suggestionData));
        // Send done event
        const doneData = `data: ${JSON.stringify({ done: true })}\n\n`;
        console.log('[API] Sending done data:', doneData);
        controller.enqueue(encoder.encode(doneData));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("[API] Error fetching connections:", error);
    return new Response(
      JSON.stringify({
        suggestions: [{
          title: "Connect an Integration",
          label: "Add your first Pica connection",
          action: "How do I connect my first integration?",
          platform: "pica"
        }],
        error: "Failed to fetch connections"
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}