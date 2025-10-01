# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Environment Variables

Create `.env.local`:

```bash
PICA_SECRET_KEY=your-pica-secret-key

# Optional
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-key
NEXT_PUBLIC_ANTHROPIC_API_KEY=your-anthropic-key
NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
```

### 3. Start Development Server

```bash
pnpm dev
```

Open http://localhost:3000

## 🎯 Try These Features

### Cedar Copilot Commands

Type these in the chat:

```
"Change the model to GPT-4"
"Clear the chat"
"Set the input to 'Hello World'"
"Toggle devtools"
"Show a success notification saying 'Integration complete'"
```

### DevTools

1. Click the DevTools button in chat input
2. Or send: "Toggle devtools"
3. See real-time AI events, tool calls, and performance metrics

### Artifacts

1. Ask AI to generate code: "Write a Python function to calculate fibonacci"
2. Watch it appear in the right panel with syntax highlighting
3. Ask for documents: "Create a README for a React project"
4. See markdown rendered beautifully

### Global State Access

Access chat state from any component:

```tsx
import { useChatMessages, useChatStatus } from "@ai-sdk-tools/store";

function MyComponent() {
  const messages = useChatMessages();
  const status = useChatStatus();
  
  return <div>Messages: {messages.length}</div>;
}
```

## 📚 Documentation

- **FINAL_INTEGRATION_SUMMARY.md** - Complete overview
- **MIDDAY_AI_SDK_TOOLS_INTEGRATION.md** - Midday tools guide
- **CEDAR_COPILOT_INTEGRATION.md** - Cedar guide
- **DEVTOOLS_AND_ARTIFACTS.md** - DevTools & Artifacts

## 🎉 You're Ready!

Everything is set up and working. Start building amazing AI experiences!

