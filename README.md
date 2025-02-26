# Pica OneTool Demo Chat App ✨

![Pica OneTool in Action](demo.gif)

[Pica OneTool](https://www.npmjs.com/package/@picahq/ai) is a powerful integration layer that seamlessly connects AI with any API. With automatic handling of schema definitions, authentication flows, and execution processes, it eliminates the complexity of API integrations - allowing you to focus on building great experiences.

## Overview

A demo chat app showcasing Pica OneTool's capabilities. Built with [@picahq/ai](https://www.npmjs.com/package/@picahq/ai) and the [Vercel AI SDK](https://www.npmjs.com/package/ai), it demonstrates how you can use natural language to interact with various APIs directly through a chat interface.

## Features

- 🔌 **Universal Integration**: Connect with 100+ APIs and use 6000+ actions powered by Pica
- 🤖 **AI-Powered Assistant**: Natural language interface that understands your intent
- 🧠 **Smart Execution**: Automatically handles prerequisite actions and complex workflows
- 📊 **Knowledge Fetching**: Dynamically learns API capabilities and requirements
- 🔍 **Action Observability**: View success responses and error messages

## Getting Started

1. **Clone the repository:**
```bash
git clone https://github.com/picahq/onetool-demo.git
cd onetool-demo
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create a `.env` file in the root directory from the `.env.example` file:**
```env
PICA_SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_api_key
```

| Variable | Description | Required |
|----------|-------------|----------|
| `PICA_SECRET_KEY` | Your [Pica API secret key](https://app.picaos.com/settings/api-keys) | Yes |
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |

4. **Run the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser 🚀**

## Usage

Here are some example commands you can use to get started:

- What connections are available?
- Send an email using gmail to john@doe.com
- Create a new Shopify product
- Insert a new record into my Postgres database
- Create a record in Airtable
- What actions are supported for Attio?
- Search the web for the best restaurants in SF using Exa

## Support

Read more about Pica OneTool in the [documentation](https://docs.picaos.com/sdk/vercel-ai) or contact us at [support@picaos.com](mailto:support@picaos.com).
