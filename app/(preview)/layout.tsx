"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { GeistSans } from "geist/font/sans";
import { CedarCopilot } from "cedar-os";
import type { ProviderConfig } from "cedar-os";
import { ReactNode } from "react";
import { cedarResponseProcessors } from "./lib/cedar-response-processors";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Configure AI SDK provider to use existing environment variables
  const llmProvider: ProviderConfig = {
    provider: 'ai-sdk',
    providers: {
      openai: {
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
      },
      anthropic: {
        apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
      },
      google: {
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY || '',
      },
    },
  };

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
        <CedarCopilot
          llmProvider={llmProvider}
          responseProcessors={cedarResponseProcessors}
        >
          <div className="flex min-h-screen">
            <div className="w-full px-4 md:px-8">
              <Toaster position="top-center" richColors />
              {children}
            </div>
          </div>
        </CedarCopilot>
      </body>
    </html>
  );
}
