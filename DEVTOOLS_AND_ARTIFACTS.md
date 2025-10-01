# AI SDK DevTools & Artifacts Integration

## Overview

The Pica OneTool demo chat application now includes full support for **AI SDK DevTools** and **Artifacts** display, enhancing the development and user experience.

## Features

### 1. AI SDK DevTools

**Location**: Bottom-right corner (when enabled)

**Purpose**: Provides real-time debugging information for AI interactions

**Features**:
- Message count tracking
- Current status display (streaming, submitted, idle)
- Active model information
- Easy toggle on/off

**How to Enable**:
```typescript
// Via UI
Click the "Toggle DevTools" button in the chat input area

// Via Cedar Copilot
Send message: "Toggle devtools"
```

**Implementation**:
- Dynamic import of `@ai-sdk/ui-utils`
- No build-time dependency
- Only loads when needed
- Automatically positioned in bottom-right corner

### 2. Artifacts Panel

**Location**: Right panel (three-panel layout)

**Purpose**: Displays code snippets, documents, and other AI-generated artifacts

**Supported Artifact Types**:

#### Code Artifacts
- Automatically extracted from code blocks in AI responses
- Syntax highlighting for 100+ languages
- Copy-to-clipboard functionality
- Language detection from markdown code fences

**Example**:
````markdown
```python
def hello_world():
    print("Hello, World!")
```
````

#### Document Artifacts
- Markdown documents with headings
- Rendered with full markdown support
- Prose styling for readability
- Supports tables, lists, links, etc.

**Example**:
```markdown
# Project Documentation

## Overview
This is a sample document...
```

#### Text Artifacts
- Plain text content
- Fallback for unrecognized formats
- Monospace font for code-like content

### 3. Artifact Management

**Features**:
- **Auto-detection**: Artifacts are automatically extracted from AI responses
- **Tabbed Interface**: Multiple artifacts shown as tabs (when more than one exists)
- **Auto-selection**: Most recent artifact is automatically selected
- **Persistent Display**: Artifacts remain visible as you continue chatting

**Artifact Extraction Logic**:
1. Scans all assistant messages for code blocks
2. Extracts code with language information
3. Identifies markdown documents (200+ characters with headings)
4. Filters out small snippets (< 20 characters)
5. Creates unique IDs for each artifact

## Architecture

### Three-Panel Layout

```
┌─────────────────┬──────────────────┬─────────────────┐
│   Tool Calls    │   Chat Messages  │   Artifacts     │
│   (Left Panel)  │  (Center Panel)  │  (Right Panel)  │
│                 │                  │                 │
│ - Tool name     │ - User messages  │ - Code blocks   │
│ - Arguments     │ - AI responses   │ - Documents     │
│ - Results       │ - Streaming      │ - Tabs          │
│ - Status        │ - Cedar messages │ - Syntax HL     │
└─────────────────┴──────────────────┴─────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │   DevTools     │
                  │ (Bottom-Right) │
                  └────────────────┘
```

### Component Structure

```typescript
// Main page component
app/(preview)/page.tsx
├── Left Panel: Tool Calls (inline)
├── Center Panel: Chat Interface
│   ├── Header
│   ├── ChatMessages
│   └── ChatInput
├── Right Panel: Artifacts
│   └── Artifacts component
└── DevTools (conditional)
    └── DevtoolsWrapper (dynamic)
```

### Artifacts Component

```typescript
// app/(preview)/components/Artifacts.tsx
interface Artifact {
  id: string;           // Unique identifier
  type: string;         // 'code' | 'document' | 'text'
  title: string;        // Display title
  content: string;      // Artifact content
  language?: string;    // Programming language (for code)
  messageId: string;    // Source message ID
}
```

## Usage Examples

### Example 1: Generate Code Artifact

**User**: "Write a Python function to calculate fibonacci numbers"

**AI Response**:
````markdown
Here's a Python function to calculate Fibonacci numbers:

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```
````

**Result**: Code artifact appears in right panel with Python syntax highlighting

### Example 2: Generate Document Artifact

**User**: "Create a README for a React project"

**AI Response**:
```markdown
# React Project

## Installation
npm install

## Usage
npm start
```

**Result**: Document artifact appears in right panel with markdown rendering

### Example 3: Multiple Artifacts

**User**: "Show me a React component and its test file"

**AI Response**:
````markdown
Here's the component:

```jsx
function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}
```

And here's the test:

```jsx
test('renders button', () => {
  render(<Button>Click me</Button>);
});
```
````

**Result**: Two code artifacts appear as tabs in the right panel

## DevTools Information

### Displayed Metrics

1. **Messages Count**: Total number of messages in the conversation
2. **Status**: Current AI state
   - `idle` - No active request
   - `submitted` - Request sent, waiting for response
   - `streaming` - Receiving streamed response
3. **Model**: Currently selected AI model

### Toggle Methods

**Method 1: UI Button**
- Click the DevTools icon in the chat input area
- Located next to the model selector

**Method 2: Cedar Copilot**
- Send message: "Toggle devtools"
- Cedar will toggle the DevTools panel

**Method 3: Keyboard Shortcut** (Future Enhancement)
- Planned: `Cmd/Ctrl + Shift + D`

## Technical Implementation

### Artifacts Extraction

```typescript
// Extract code blocks
const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

// Extract documents
const hasHeadings = text.includes("#") || text.includes("##");
const isLongEnough = text.length > 200;
```

### DevTools Dynamic Import

```typescript
// Only load when needed
import('@ai-sdk/ui-utils')
  .then((m) => {
    // Create DevTools component
  })
  .catch(() => {
    // Handle error gracefully
  });
```

### Artifact Rendering

```typescript
// Code artifacts
<CodeBlock language={artifact.language} value={artifact.content} />

// Document artifacts
<Markdown content={artifact.content} />

// Text artifacts
<pre>{artifact.content}</pre>
```

## Styling

### Artifacts Panel
- Background: `bg-black/10`
- Border: `border-green-800/20`
- Width: Responsive (256px - 384px)
- Overflow: Auto scroll

### DevTools Panel
- Background: `bg-black/90` with backdrop blur
- Border: `border-green-800/30`
- Size: 384px × 384px
- Position: Fixed bottom-right

### Artifact Tabs
- Active: `bg-green-900/30 text-green-400`
- Inactive: `text-gray-400 hover:bg-black/20`
- Border: `border-green-800/30`

## Configuration

### Environment Variables

No additional environment variables required. Uses existing AI SDK configuration.

### Dependencies

```json
{
  "@ai-sdk/ui-utils": "^1.2.11",
  "@ai-sdk/react": "^2.0.15",
  "ai": "^5.0.15"
}
```

## Best Practices

### For Developers

1. **Code Artifacts**: Always use proper language tags in code blocks
   ```markdown
   ```python  ← Good
   ```        ← Bad (no language)
   ```

2. **Document Artifacts**: Use markdown headings for structure
   ```markdown
   # Main Title     ← Good
   **Bold Text**    ← Less effective
   ```

3. **Artifact Size**: Keep artifacts focused and concise
   - Code: < 100 lines per artifact
   - Documents: < 500 lines per artifact

### For Users

1. **Request Specific Formats**: Ask for code in specific languages
   - "Write a Python function..." ✓
   - "Write a function..." ✗

2. **Request Documentation**: Ask for structured documents
   - "Create a README with installation and usage sections" ✓
   - "Tell me about the project" ✗

3. **Multiple Artifacts**: Request related artifacts together
   - "Show me the component and its test" ✓
   - Separate requests for each ✗

## Troubleshooting

### Artifacts Not Appearing

**Issue**: Code blocks not showing in artifacts panel

**Solutions**:
1. Ensure code blocks use triple backticks (```)
2. Check that code is > 20 characters
3. Verify language tag is present
4. Check browser console for errors

### DevTools Not Loading

**Issue**: DevTools panel doesn't appear when toggled

**Solutions**:
1. Check that `@ai-sdk/ui-utils` is installed
2. Verify browser console for import errors
3. Try refreshing the page
4. Check that you're not in production mode

### Artifacts Panel Empty

**Issue**: Panel shows "No artifacts yet" despite AI responses

**Solutions**:
1. Ensure AI responses contain code blocks or documents
2. Check that content meets minimum length requirements
3. Verify markdown formatting is correct
4. Look for extraction errors in console

## Future Enhancements

### Planned Features

1. **Artifact Actions**
   - Download artifact as file
   - Share artifact via link
   - Edit artifact inline
   - Run code artifacts (for supported languages)

2. **Enhanced DevTools**
   - Token usage tracking
   - Response time metrics
   - Cost estimation
   - Request/response inspection

3. **Artifact Types**
   - Image artifacts
   - Chart/graph artifacts
   - Interactive components
   - Data tables

4. **Artifact Management**
   - Search artifacts
   - Filter by type
   - Sort by date/size
   - Export all artifacts

## Support

For issues or questions:
- Check the main README.md
- Review CEDAR_COPILOT_INTEGRATION.md
- Contact the Pica team

---

**Last Updated**: 2025-09-30
**Version**: 1.0.0
**Status**: ✅ Production Ready

