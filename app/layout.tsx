import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vino Log - Social Wine Tracking",
  description: "Track and share your wine experiences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-neutral-900`}>
        <div className="pb-20 min-h-screen">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}