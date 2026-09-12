import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Wayward Flagon • D&D 5e Interactive AI RPG",
  description: "Deterministic 5e mechanics, 2D tactical combat grid, and multi-agent AI Dungeon Master.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full bg-obsidian-950 text-parchment-100 antialiased overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}