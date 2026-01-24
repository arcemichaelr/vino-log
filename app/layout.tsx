import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MobileNav } from "@/components/MobileNav";

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
        <div className="pb-24 lg:pb-0 min-h-screen">{children}</div>
        <MobileNav />
      </body>
    </html>
  );
}