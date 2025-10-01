# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 AI chat application that demonstrates Pica OneTool integration, allowing users to interact with 150+ APIs through natural language. The app uses the Vercel AI SDK v5 with support for multiple AI providers (OpenAI, Google, Anthropic) and integrates Midday AI SDK Tools for enhanced chat functionality.

### Pica Reference Repositories

The `/reference/pica-repos/` directory contains 11 Pica repositories cloned from the last 2 months for reference:

- **docs** - Official Pica documentation
- **awesome-pica** - Curated list of Pica resources
- **buildkit-langchain-starter** - LangChain integration starter
- **pica** - Core Pica SDK
- **buildkit-vercel-ai-starter** - Vercel AI SDK integration starter
- **buildkit-mcp-starter** - Model Context Protocol starter
- **.github** - GitHub organization templates
- **pica-langchain** - LangChain integration package
- **onetool-demo** - OneTool demonstration project
- **ai** - AI utilities and helpers
- **mcp** - Model Context Protocol implementation

These repositories serve as reference for understanding Pica's architecture, best practices, and integration patterns that this project is built upon.

## Development Commands

```bash
# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## Architecture

### Three-Panel Chat Interface
The main layout (`app/(preview)/page.tsx`) implements a three-panel design:
- **Left Panel**: Tool calls visualization - dynamically displays Pica OneTool API interactions with request/response data
- **Center Panel**: Main chat interface with Header, ChatMessages, and ChatInput components
- **Right Panel**: Artifacts display using Midday AI SDK Tools (@ai-sdk-tools/artifacts)

### Key Directories
- `/app/(preview)/` - Main Next.js App Router application
  - `api/chat/route.ts` - Core streaming chat API endpoint with Pica OneTool integration
  - `components/` - App-specific components (Header, ChatInput, ChatMessages, Artifacts)
  - `lib/` - Cedar response processors for UI manipulation
  - `page.tsx` - Three-panel layout with state management

- `/src/cedar/components/` - Cedar OS component library (from cedar-os npm package)
  - `chatComponents/` - Complete chat implementations (FloatingCedarChat, SidePanelCedarChat, EmbeddedCedarChat)
  - `chatMessages/` - Message rendering components (ChatRenderer, MarkdownRenderer, Storyline, TodoList)
  - `chatInput/` - Input components with context badges and human-in-the-loop support
  - `ui/` - Base UI primitives (button, dialog, dropdown-menu, tabs, command)
  - `spells/` - Interactive UI patterns (RadialMenuSpell, TooltipMenuSpell, SliderSpell)
  - `containers/` - 3D and glassmorphic containers (Container3D, Flat3dContainer, GlassyPaneContainer)
  - `ornaments/` - Visual effects (GlowingMesh, GradientMesh, InsetGlow)
  - `CommandBar/` - Command palette with keyboard shortcuts
  - `voice/` - Voice indicator components
  - `diffs/` - Diff visualization components

### State Management Architecture
The app uses multiple state management layers:

1. **Vercel AI SDK Store** (@ai-sdk-tools/store):
   - Primary chat state managed via `useChat()` hook in `page.tsx`
   - Handles messages, status, sendMessage, and stop functionality
   - Uses `DefaultChatTransport` with `/api/chat` endpoint
   - Chat ID format: `chat-{modelId}` to maintain separate history per model

2. **Cedar OS State** (cedar-os):
   - Global state via `getCedarState()` and `setCedarState()`
   - Custom state object in `customState` key for cross-component communication
   - Response processors in `app/(preview)/lib/cedar-response-processors.ts` enable AI to:
     - Change models (`change_model`)
     - Clear chat (`clear_chat`)
     - Set input text (`set_input`)
     - Toggle devtools (`toggle_devtools`)
     - Show notifications (`show_notification`)

3. **Local Component State**:
   - React useState for UI-specific state (selectedModel, devtoolsOpen)
   - useEffect hooks bridge Cedar state changes to UI updates

### AI Integration Flow
The chat API route (`app/(preview)/api/chat/route.ts`) orchestrates:

1. **Model Selection**: Switch statement maps modelId to provider-specific models (openai, google, anthropic)
2. **Pica OneTool Setup**: Initializes with PICA_SECRET_KEY and wildcard connector access
3. **System Prompt**: Dynamically generated via `pica.generateSystemPrompt()` to inject API capabilities
4. **Streaming Response**: Uses `streamText()` with:
   - Message history trimming (MAX_MESSAGES = 20)
   - Tool calling via `pica.oneTool`
   - Step limit of 25 to prevent infinite loops
   - Returns `toUIMessageStreamResponse()` for client consumption

### Tool Calls Visualization
Tool calls are extracted and displayed in the left panel via message part flattening:
- Filter parts with type starting with `'tool-'`
- Extract toolCallId, input args, output, and state
- Display in bordered cards with JSON preview (limited to 200 chars)

## Environment Variables

Required in `.env.local`:
```
PICA_SECRET_KEY=<your-pica-secret-key>
```

Optional for additional model support (configure at least one):
```
OPENAI_API_KEY=<optional>
GOOGLE_GENERATIVE_AI_API_KEY=<optional>
ANTHROPIC_API_KEY=<optional>
```

## Key Technical Decisions

1. **Vercel AI SDK v5** + **Midday AI SDK Tools**: Latest AI SDK with store, devtools, and artifacts support
2. **Pica OneTool**: Universal API connector with 150+ integrations, automatic schema handling, and auth flows
3. **Cedar OS**: Component library and state management for chat UI patterns
4. **Next.js 15 with Turbopack**: App Router with optimized development builds
5. **PNPM Workspaces**: Monorepo-ready setup with overrides for React 19 compatibility
6. **No Testing Framework**: No Jest/Vitest configured - consider adding for production use

## Common Modifications

### Adding New AI Models
Edit `app/(preview)/api/chat/route.ts`:
- Add case to `getModel()` switch statement
- Update model selector in `components/model-selector.tsx`
- Ensure corresponding API key is in `.env.local`

### Extending Cedar Response Processors
Add new processors in `app/(preview)/lib/cedar-response-processors.ts`:
- Define type extending `CustomStructuredResponseType`
- Create processor with `createResponseProcessor()`
- Add to `cedarResponseProcessors` export array
- Update `customState` shape if needed for UI communication

### Working with Cedar Components
- Import from `cedar-os` package, not local files
- Components are pre-built - extend via composition rather than modification
- Use Cedar state management for cross-component communication
- Reference `/src/cedar/components/` for available patterns and APIs

### Modifying Chat UI Layout
- Three-panel layout lives in `app/(preview)/page.tsx`
- Adjust panel widths via Tailwind classes (w-72, lg:w-80, xl:w-96)
- Tool calls extraction logic is in page component (messages flatMap)
- Artifacts component can be swapped (EnhancedArtifacts available but disabled due to React version issues)

### Styling and Animations
- Tailwind config in `tailwind.config.ts` includes extensive custom animations
- Custom keyframes: scroll-left, accordion, rainbow, gradient, breeze, background-position-spin
- Color system uses CSS variables (--color-1 through --color-5, --primary, --muted, etc.)
- Dark mode via class strategy