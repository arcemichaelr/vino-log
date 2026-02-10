import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vino Log - Social Wine Tracking",
  description: "Track and share your wine experiences",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VinoLog",
  },
  themeColor: "#ffffff",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}