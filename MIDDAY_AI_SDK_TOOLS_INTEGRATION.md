# Midday AI SDK Tools Integration

## Overview

The Pica OneTool demo chat application now includes **full integration** with [Midday AI SDK Tools](https://github.com/midday-ai/ai-sdk-tools), providing enterprise-grade state management, debugging tools, and structured artifact streaming.

## 🎯 What's Integrated

### 1. **@ai-sdk-tools/store** - Global State Management

**Purpose**: Drop-in replacement for `@ai-sdk/react` with global Zustand store access

**Benefits**:
- ✅ No prop drilling - access chat state from any component
- ✅ Optimized re-renders - selective subscriptions
- ✅ Same API as `@ai-sdk/react` - zero breaking changes
- ✅ Custom stores support - persistence, devtools, etc.

**Migration**:
```tsx
// Before
import { useChat } from '@ai-sdk/react'

// After - ONLY CHANGE NEEDED
import { useChat } from '@ai-sdk-tools/store'
```

### 2. **@ai-sdk-tools/devtools** - Professional Debugging

**Purpose**: Real-time debugging and monitoring for AI applications

**Features**:
- 🔍 Real-time event monitoring
- 🛠️ Tool call debugging with parameters and results
- ⚡ Performance metrics (tokens/second, streaming speed)
- 🎯 Event filtering by type, tool name, or search
- 📊 Context insights and token usage
- 🎨 Resizable panel with live indicators

### 3. **@ai-sdk-tools/artifacts** - Structured Streaming

**Purpose**: Type-safe artifact streaming with real-time updates

**Features**:
- 🎯 Type-safe with Zod schema validation
- 🔄 Real-time partial updates with progress tracking
- 🎨 Clean API with minimal boilerplate
- 🏪 Built on @ai-sdk-tools/store for efficiency
- ⚡ Performance optimized state management

## 📦 Installation

All three packages are now installed:

```bash
pnpm add @ai-sdk-tools/devtools @ai-sdk-tools/store @ai-sdk-tools/artifacts
```

## 🚀 Usage

### 1. Global State Management

The application now uses `@ai-sdk-tools/store` instead of `@ai-sdk/react`:

```tsx
// app/(preview)/page.tsx
import { useChat } from "@ai-sdk-tools/store";

function ChatPage() {
  const { messages, status, sendMessage, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat'
    }),
    id: `chat-${selectedModel}`,
  });

  // Chat state is now globally accessible!
  return <ChatInterface />;
}
```

**Access from Any Component**:
```tsx
import { useChatMessages, useChatStatus } from "@ai-sdk-tools/store";

function MessageCount() {
  const messages = useChatMessages(); // Direct access!
  return <div>Messages: {messages.length}</div>;
}

function LoadingSpinner() {
  const status = useChatStatus(); // Only re-renders when status changes
  return status === 'streaming' ? <Spinner /> : null;
}
```

### 2. AI SDK DevTools

**Toggle DevTools**:
- Via UI: Click the DevTools button in chat input
- Via Cedar: Send message "Toggle devtools"
- Via Code: `setDevtoolsOpen(true)`

**Features Available**:
```tsx
// app/(preview)/page.tsx
import { AIDevtools } from "@ai-sdk-tools/devtools";

{devtoolsOpen && <AIDevtools />}
```

**What You'll See**:
- All AI streaming events in real-time
- Tool calls with input/output
- Performance metrics
- Token usage
- Error tracking
- Event filtering

### 3. Enhanced Artifacts

The application now includes two artifact systems:

**A. Basic Artifacts** (Original):
- Extracts code blocks from messages
- Simple markdown rendering
- No streaming support

**B. Enhanced Artifacts** (Midday):
- Type-safe artifact definitions
- Real-time streaming updates
- Progress tracking
- Multiple artifact types
- Error handling

**Current Setup**:
```tsx
// app/(preview)/page.tsx
<EnhancedArtifacts /> // Using Midday artifacts
```

## 🔧 Advanced Features

### Custom Artifact Types

Define custom artifacts with Zod schemas:

```typescript
import { artifact } from '@ai-sdk-tools/artifacts';
import { z } from 'zod';

// Define artifact schema
const burnRateArtifact = artifact('burn-rate', z.object({
  title: z.string(),
  stage: z.enum(['loading', 'processing', 'complete']),
  monthlyBurn: z.number(),
  runway: z.number(),
  data: z.array(z.object({
    month: z.string(),
    burnRate: z.number()
  }))
}));

// Use in AI tool
const analyzeBurnRate = {
  description: 'Analyze company burn rate',
  execute: async ({ company }) => {
    const analysis = burnRateArtifact.stream({
      title: `${company} Analysis`,
      stage: 'loading',
      monthlyBurn: 50000,
      runway: 12
    });

    // Stream updates
    analysis.progress = 0.5;
    await analysis.update({ stage: 'processing' });
    
    // Complete
    await analysis.complete({
      stage: 'complete',
      data: [{ month: '2024-01', burnRate: 50000 }]
    });

    return 'Analysis complete';
  }
};
```

**Consume in React**:
```tsx
import { useArtifact } from '@ai-sdk-tools/artifacts/client';

function Analysis() {
  const { data, status, progress, error } = useArtifact(burnRateArtifact, {
    onComplete: (data) => console.log('Done!', data),
    onError: (error) => console.error('Failed:', error)
  });

  return (
    <div>
      <h2>{data?.title}</h2>
      <p>Stage: {data?.stage}</p>
      {progress && <div>Progress: {progress * 100}%</div>}
    </div>
  );
}
```

### Listen to All Artifacts

Use `useArtifacts` to listen to all artifact types:

```tsx
import { useArtifacts } from '@ai-sdk-tools/artifacts/client';

function ArtifactRenderer() {
  const { latest, current, byType } = useArtifacts({
    onData: (artifactType, data) => {
      console.log(`New ${artifactType} artifact:`, data);
    }
  });

  // Render based on type
  return (
    <div>
      {Object.entries(latest).map(([type, artifact]) => {
        switch (type) {
          case 'burn-rate':
            return <BurnRateComponent key={type} data={artifact} />;
          case 'financial-report':
            return <ReportComponent key={type} data={artifact} />;
          default:
            return <GenericComponent key={type} data={artifact} />;
        }
      })}
    </div>
  );
}
```

### Custom Stores with Persistence

```tsx
import { createCustomChatStore } from '@ai-sdk-tools/store';
import { persist } from 'zustand/middleware';

// Create persisted store
const persistedStore = createCustomChatStore(
  persist(
    (set) => ({ /* config */ }),
    { name: 'chat-history' }
  )
);

// Use in chat
const chat = useChat({
  transport: new DefaultChatTransport({
    api: '/api/chat'
  }),
  store: persistedStore // Chat survives page refresh!
});
```

## 📊 DevTools Features

### Event Types Captured

- `tool-call-start` - Tool call initiated
- `tool-call-result` - Tool call completed
- `tool-call-error` - Tool call failed
- `message-start` - Message streaming started
- `message-chunk` - Message chunk received
- `message-complete` - Message completed
- `text-start` - Text streaming started
- `text-delta` - Text delta received
- `text-end` - Text streaming ended
- `finish` - Stream finished
- `error` - Error occurred

### Filtering & Search

```tsx
<AIDevtools
  config={{
    position: "bottom", // or "right", "overlay"
    height: 400,
    streamCapture: {
      enabled: true,
      endpoint: "/api/chat",
      autoConnect: true
    },
    throttle: {
      enabled: true,
      interval: 100, // ms
      includeTypes: ["text-delta"] // Only throttle high-frequency events
    }
  }}
  debug={false} // Enable debug logging
/>
```

## 🎨 UI Components

### EnhancedArtifacts Component

Located at `app/(preview)/components/EnhancedArtifacts.tsx`

**Features**:
- Automatic artifact type detection
- Progress indicators
- Status badges (loading, streaming, complete, error)
- Multiple artifact tabs
- Type-specific rendering (code, markdown, data)

**Supported Artifact Types**:
- `code` / `code-snippet` - Syntax highlighted code
- `document` / `markdown` - Rendered markdown
- `chart` / `data` / `visualization` - JSON data display
- Custom types - Automatic fallback rendering

## 🔄 Migration Guide

### From @ai-sdk/react to @ai-sdk-tools/store

**Step 1**: Update imports
```tsx
// Before
import { useChat } from '@ai-sdk/react'

// After
import { useChat } from '@ai-sdk-tools/store'
```

**Step 2**: No other changes needed!
The API is 100% compatible.

**Step 3**: Access state globally (optional)
```tsx
import { useChatMessages, useChatStatus } from '@ai-sdk-tools/store'

function AnyComponent() {
  const messages = useChatMessages() // Works from anywhere!
  const status = useChatStatus()
}
```

## 📚 API Reference

### Store Hooks

```tsx
// Main hook
const chat = useChat({ transport, id })

// Selectors
useChatMessages()           // Message array
useChatStatus()             // Chat status
useChatError()              // Error state
useChatSendMessage()        // Send function
useChatMessageCount()       // Message count
useChatId()                 // Chat ID
useChatActions()            // All actions

// Custom selector
useChatProperty(state => state.messages.filter(m => m.role === 'user'))
```

### Artifact Hooks

```tsx
// Single artifact
const { data, status, progress, error, isActive, hasData } = useArtifact(
  artifactDefinition,
  {
    onUpdate: (data, prevData) => {},
    onComplete: (data) => {},
    onError: (error, data) => {},
    onProgress: (progress, data) => {},
    onStatusChange: (status, prevStatus) => {}
  }
)

// All artifacts
const { byType, latest, artifacts, current } = useArtifacts({
  onData: (artifactType, data) => {},
  storeId: 'optional-store-id'
})
```

## 🎯 Best Practices

### 1. Use Store for Complex UIs
If you have multiple components that need chat data, use `@ai-sdk-tools/store` to avoid prop drilling.

### 2. Enable DevTools in Development
Always enable DevTools during development for better debugging:
```tsx
{process.env.NODE_ENV === 'development' && <AIDevtools />}
```

### 3. Define Artifact Schemas
Use Zod schemas for type-safe artifacts:
```tsx
const myArtifact = artifact('my-type', z.object({
  // Define your schema
}))
```

### 4. Handle Artifact Errors
Always provide error callbacks:
```tsx
useArtifact(artifact, {
  onError: (error) => {
    toast.error(`Artifact failed: ${error}`)
  }
})
```

## 🐛 Troubleshooting

### DevTools Not Appearing

**Issue**: DevTools doesn't show when toggled

**Solutions**:
1. Check that `devtoolsOpen` state is true
2. Verify `@ai-sdk-tools/devtools` is installed
3. Check browser console for errors
4. Try refreshing the page

### Artifacts Not Streaming

**Issue**: Artifacts don't update in real-time

**Solutions**:
1. Ensure using `@ai-sdk-tools/store` (not `@ai-sdk/react`)
2. Verify artifact is properly defined with `artifact()`
3. Check that tool is calling `.stream()`, `.update()`, `.complete()`
4. Look for errors in DevTools

### Store State Not Accessible

**Issue**: `useChatMessages()` returns empty array

**Solutions**:
1. Ensure `useChat()` is called somewhere in the component tree
2. Verify using same store ID
3. Check that messages are being sent/received

## 📖 Resources

- **Midday AI SDK Tools**: https://github.com/midday-ai/ai-sdk-tools
- **Documentation**: https://ai-sdk-tools.dev
- **Vercel AI SDK**: https://sdk.vercel.ai
- **Pica OneTool**: https://pica.ai

## 🎉 Status

✅ **@ai-sdk-tools/store** - Fully integrated and working  
✅ **@ai-sdk-tools/devtools** - Fully integrated and working  
✅ **@ai-sdk-tools/artifacts** - Fully integrated and working  
✅ **Production Ready** - All features tested and documented  

---

**Last Updated**: 2025-09-30  
**Version**: 1.0.0  
**Integration Status**: ✅ Complete

