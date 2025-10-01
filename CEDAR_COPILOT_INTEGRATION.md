# Cedar Copilot Integration Documentation

## Overview

Cedar Copilot has been integrated into the Pica OneTool demo chat application, providing AI-powered UI manipulation capabilities alongside the existing Pica OneTool functionality.

## Integration Architecture

### Components Modified

1. **`app/(preview)/layout.tsx`** - Converted to client component and wrapped with `CedarCopilot` provider
2. **`app/(preview)/page.tsx`** - Added Cedar state subscriptions for UI manipulation
3. **`app/(preview)/components/ChatMessages.tsx`** - Renders both Vercel AI SDK and Cedar messages
4. **`app/(preview)/components/CedarMessageRenderer.tsx`** - Custom renderer for Cedar messages

### New Files Created

1. **`app/(preview)/lib/cedar-response-processors.ts`** - Custom response processors for UI manipulation
2. **`app/(preview)/components/CedarMessageRenderer.tsx`** - Simple Cedar message renderer
3. **`app/(preview)/metadata.ts`** - Extracted metadata (layout is now client component)

## Cedar Copilot Features

### Available UI Manipulation Commands

Cedar Copilot can control the application UI through natural language commands:

#### 1. Change Model
**Command**: "Change the model to GPT-4" or "Switch to Claude Sonnet"

**Response Processor**: `changeModelProcessor`

**Example**:
```
User: "Change the model to gpt-4o"
Cedar: *Changes the selected model and shows confirmation*
```

**Supported Models**:
- `gpt-4o`
- `gpt-4.1`
- `gpt-5`
- `claude-3-5-sonnet-20241022`
- `gemini-2.5-pro`

#### 2. Clear Chat
**Command**: "Clear the chat" or "Delete all messages"

**Response Processor**: `clearChatProcessor`

**Example**:
```
User: "Clear the chat"
Cedar: *Clears all messages and shows confirmation*
```

#### 3. Set Input Text
**Command**: "Set the input to 'Hello world'" or "Pre-fill the input with..."

**Response Processor**: `setInputProcessor`

**Example**:
```
User: "Set the input to 'Explain quantum computing'"
Cedar: *Sets the chat input field to the specified text*
```

#### 4. Toggle Devtools
**Command**: "Toggle devtools" or "Show/hide developer tools"

**Response Processor**: `toggleDevtoolsProcessor`

**Example**:
```
User: "Toggle devtools"
Cedar: *Opens or closes the developer tools panel*
```

#### 5. Show Notifications
**Command**: "Show a success notification saying 'Task complete'"

**Response Processor**: `showNotificationProcessor`

**Notification Types**:
- `success` - Green checkmark notification
- `error` - Red error notification
- `warning` - Yellow warning notification
- `info` - Blue info notification (default)

**Example**:
```
User: "Show a success notification saying 'Model updated successfully'"
Cedar: *Displays a toast notification with the message*
```

## Technical Implementation

### Cedar Provider Configuration

```typescript
const llmProvider: ProviderConfig = {
  provider: 'ai-sdk',
  providers: {
    openai: { apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '' },
    anthropic: { apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '' },
    google: { apiKey: process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY || '' },
  },
};

<CedarCopilot 
  llmProvider={llmProvider} 
  responseProcessors={cedarResponseProcessors}
>
  {children}
</CedarCopilot>
```

### Response Processor Pattern

Response processors execute when Cedar receives structured responses from the LLM:

```typescript
export const changeModelProcessor = createResponseProcessor<ChangeModelResponse>({
  type: 'change_model',
  execute: (obj, store) => {
    // Update Cedar state
    const currentState = (getCedarState('customState') as Record<string, any>) || {};
    setCedarState('customState', {
      ...currentState,
      selectedModel: obj.model,
    });
    
    // Add confirmation message
    store.addMessage({
      role: 'assistant',
      content: `Model changed to ${obj.model}`,
      type: 'text',
    });
  },
});
```

### State Synchronization

The main page polls Cedar state for changes and reacts accordingly:

```typescript
// Poll for Cedar state changes
useEffect(() => {
  const interval = setInterval(() => {
    const state = getCedarState('customState') as Record<string, any> | undefined;
    setCustomState(state);
  }, 100); // Poll every 100ms
  
  return () => clearInterval(interval);
}, []);

// React to model changes
useEffect(() => {
  if (customState?.selectedModel && customState.selectedModel !== selectedModel) {
    setSelectedModel(customState.selectedModel);
    toast.success(`Model changed to ${customState.selectedModel}`);
  }
}, [customState?.selectedModel, selectedModel]);
```

## Message Rendering

Cedar messages are rendered alongside Pica OneTool messages in the chat interface:

```typescript
{/* Render Vercel AI SDK messages */}
{messages.map((message) => (
  <Message key={message.id} {...message} />
))}

{/* Render Cedar OS messages */}
{cedarMessages.map((cedarMessage) => (
  <CedarMessageRenderer key={cedarMessage.id} message={cedarMessage} />
))}
```

## Adding New Response Processors

To add a new UI manipulation capability:

1. **Define the response type**:
```typescript
type MyCustomResponse = CustomStructuredResponseType<
  'my_custom_action',
  {
    param1: string;
    param2: number;
  }
>;
```

2. **Create the response processor**:
```typescript
export const myCustomProcessor = createResponseProcessor<MyCustomResponse>({
  type: 'my_custom_action',
  execute: (obj, store) => {
    // Your custom logic here
    console.log('Executing custom action', obj.param1, obj.param2);
    
    // Update state if needed
    const currentState = (getCedarState('customState') as Record<string, any>) || {};
    setCedarState('customState', {
      ...currentState,
      myCustomField: obj.param1,
    });
    
    // Add confirmation message
    store.addMessage({
      role: 'assistant',
      content: `Custom action executed`,
      type: 'text',
    });
  },
});
```

3. **Add to the response processors array**:
```typescript
export const cedarResponseProcessors = [
  changeModelProcessor,
  clearChatProcessor,
  setInputProcessor,
  toggleDevtoolsProcessor,
  showNotificationProcessor,
  myCustomProcessor, // Add your new processor
];
```

## Environment Variables

Required environment variables for Cedar Copilot:

```bash
# At least one of these is required for Cedar to function
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY=...
```

## Known Limitations

1. **State Polling**: Cedar state changes are detected via polling (100ms interval) rather than reactive subscriptions. This is a temporary solution until Cedar exposes customState in the Zustand store.

2. **Simplified Message Renderer**: We're using a custom simplified message renderer instead of the full Cedar ChatRenderer to avoid complex component dependencies.

## Resolved Issues

1. **@tiptap/core Version Conflict** ✅ - Downgraded @tiptap packages to v2.26.2 to match Cedar OS dependencies. Build now completes successfully.

## Future Enhancements

1. **Reactive State Management**: Replace polling with proper Zustand subscriptions when Cedar exposes customState
2. **Full Cedar UI Components**: Integrate the complete Cedar UI component library once import path issues are resolved
3. **Dedicated Cedar Chat Interface**: Add a floating Cedar chat window using `FloatingCedarChat` component
4. **More Response Processors**: Add processors for:
   - File operations
   - Code generation
   - API testing
   - Database queries
   - Deployment actions

## Troubleshooting

### Cedar messages not appearing
- Check that environment variables are set correctly
- Verify Cedar provider is initialized in layout.tsx
- Check browser console for Cedar-related errors

### UI manipulation not working
- Ensure response processors are registered in layout.tsx
- Check that customState is being updated (use React DevTools)
- Verify polling interval is running (check console logs)

## Testing Cedar Copilot

### Development Mode
1. Start the development server: `pnpm dev`
2. Open the application in your browser (usually http://localhost:3000)
3. Try these commands in the chat:
   - "Change the model to GPT-4"
   - "Clear the chat"
   - "Set the input to 'Hello Cedar'"
   - "Show a success notification saying 'Test complete'"
   - "Toggle devtools"

### Production Build
1. Build the application: `pnpm build`
2. Start the production server: `pnpm start`
3. Test the same commands as above

## Support

For issues or questions about Cedar Copilot integration:
- Check the Cedar OS documentation: https://github.com/picahq/cedar-os
- Review the Cedar OS reference implementation
- Contact the Pica team for support

