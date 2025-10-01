# Crush.md

Context and reference material for understanding the foundation of this project.

## Pica Foundation

This project is built on **Pica** - a platform that enables AI applications to interact with 150+ APIs through natural language. Pica's OneTool provides universal API access with automatic schema handling and authentication flows.

### Reference Repositories

Located in `/reference/pica-repos/`, these 11 repositories from the Pica organization (last 2 months) provide architectural guidance and implementation patterns:

#### Core Repositories
- **pica** - Core Pica SDK and OneTool implementation
- **ai** - AI SDK utilities and integration helpers
- **mcp** - Model Context Protocol implementation for tool calling

#### Documentation & Resources
- **docs** - Official Pica documentation with API references
- **awesome-pica** - Curated list of Pica resources, examples, and integrations

#### Starter Templates
- **buildkit-vercel-ai-starter** - Vercel AI SDK v5 integration (basis for this project)
- **buildkit-langchain-starter** - LangChain integration patterns
- **buildkit-mcp-starter** - MCP starter template

#### Integration Packages
- **pica-langchain** - LangChain wrapper for Pica OneTool
- **onetool-demo** - Reference implementation and examples

#### Infrastructure
- **.github** - Organization-wide GitHub templates and workflows

### Key Pica Concepts

**OneTool**: Universal tool that provides access to 150+ APIs through a single interface
- Automatic schema discovery and validation
- Built-in authentication handling
- Natural language to API translation
- Streaming responses

**System Prompt Generation**: `pica.generateSystemPrompt()` dynamically injects available API capabilities into the LLM context

**Connector Architecture**: Wildcard connector (`*`) enables access to all available integrations

### Integration Pattern

This project follows the Vercel AI SDK integration pattern from `buildkit-vercel-ai-starter`:

```typescript
import { Pica } from '@picahq/ai'

const pica = new Pica(process.env.PICA_SECRET_KEY!)
const systemPrompt = await pica.generateSystemPrompt({ connectorNames: ['*'] })

const result = await streamText({
  model: getModel(modelId),
  messages: [{ role: 'system', content: systemPrompt }, ...messages],
  tools: { [pica.oneTool.name]: pica.oneTool },
  maxSteps: 25,
})
```

### Learning Resources

When implementing Pica features, reference:
1. `/reference/pica-repos/docs/` for official documentation
2. `/reference/pica-repos/buildkit-vercel-ai-starter/` for similar implementation patterns
3. `/reference/pica-repos/onetool-demo/` for OneTool usage examples
4. `/reference/pica-repos/ai/` for SDK utilities and helpers

### Best Practices

- Always use wildcard connector (`*`) for maximum API access
- Set reasonable `maxSteps` (25) to prevent infinite loops
- Trim message history (MAX_MESSAGES) to manage context window
- Use `generateSystemPrompt()` for dynamic capability injection
- Stream responses with `toUIMessageStreamResponse()` for optimal UX