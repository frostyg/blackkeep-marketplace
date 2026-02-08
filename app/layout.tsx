import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlackKeep - Memecoin Trading Terminal",
  description: "Safe, fast memecoin trading on Solana. Trade smarter with built-in safety checks, real-time analytics, and beginner-friendly features.",
  keywords: ["solana", "memecoin", "trading", "crypto", "defi", "blackkeep"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
