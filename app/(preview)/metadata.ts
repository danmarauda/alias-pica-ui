import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-sdk-preview-roundtrips.vercel.app"),
  title: "Agent ALIAS",
  description: "Unleash the Potential of Agentic AI",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/solo-dark.svg", type: "image/svg+xml" },
    ],
  },
};

