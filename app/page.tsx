"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-purple-900">🍷 Vino Log</h1>
          <p className="text-lg text-gray-600">
            Track, share, and discover wines with fellow enthusiasts
          </p>
        </div>

        {/* Hero Image/Illustration Placeholder */}
        <div className="w-full h-64 bg-gradient-to-br from-purple-200 to-red-200 rounded-3xl flex items-center justify-center">
          <span className="text-8xl">🍇</span>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 pt-4">
          <Link href="/dashboard" className="block">
            <Button className="w-full h-14 text-lg bg-purple-600 hover:bg-purple-700 text-white">
              Get Started
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button 
              variant="outline" 
              className="w-full h-14 text-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}