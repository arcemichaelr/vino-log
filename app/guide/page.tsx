"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const wineTypes = [
  {
    title: "Red",
    emoji: "🍷",
    description: "Bold flavors like berry & chocolate.",
    pairing: "Red meat",
    serving: "Room temp",
    examples: "Cabernet Sauvignon, Pinot Noir",
  },
  {
    title: "White",
    emoji: "🥂",
    description: "Crisp & refreshing. Notes of citrus or apple.",
    pairing: "Fish & poultry",
    serving: "Chilled",
    examples: "Chardonnay, Sauvignon Blanc",
  },
  {
    title: "Rosé",
    emoji: "🌸",
    description: "Pink & fruity. Great for summer.",
    pairing: "Salads, light apps",
    serving: "Chilled",
    examples: null,
  },
  {
    title: "Sparkling",
    emoji: "✨",
    description: "Bubbly & festive.",
    pairing: "Celebrations, appetizers",
    serving: "Well chilled",
    examples: null,
  },
];

const fourSs = [
  {
    step: "See",
    emoji: "👀",
    text: "Check the color. Darker reds are usually bolder.",
  },
  {
    step: "Swirl",
    emoji: "🌀",
    text: "Lets oxygen in to release aromas.",
  },
  {
    step: "Smell",
    emoji: "👃",
    text: "Most of taste is actually smell! Look for fruit or spice.",
  },
  {
    step: "Sip",
    emoji: "😋",
    text: "Let it coat your tongue. Is it dry? Sweet?",
  },
];

const keyTerms = [
  {
    term: "Vintage",
    definition: "The year grapes were harvested.",
  },
  {
    term: "Tannin",
    definition: "That dry feeling in your mouth, like tea.",
  },
  {
    term: "Body",
    definition: "How heavy it feels, like skim milk vs. cream.",
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-900">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-neutral-900">Wine Guide</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 pb-24">
        <p className="mb-6 text-neutral-500">
          A quick reference to wine types and basics. No snobbery—just the good stuff.
        </p>

        {/* Wine Types */}
        <h2 className="mb-3 text-base font-semibold text-neutral-900">Wine Types</h2>
        <div className="mb-8 space-y-4">
          {wineTypes.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl" role="img" aria-hidden>{section.emoji}</span>
                <h3 className="text-lg font-semibold text-neutral-900">{section.title}</h3>
              </div>
              <p className="text-neutral-700">{section.description}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <span className="text-neutral-600">
                  <strong>Pairing:</strong> {section.pairing}
                </span>
                <span className="text-neutral-600">
                  <strong>Serving:</strong> {section.serving}
                </span>
              </div>
              {section.examples && (
                <p className="mt-2 text-sm text-neutral-500">
                  Examples: {section.examples}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* How to Taste (The 4 S's) */}
        <h2 className="mb-3 text-base font-semibold text-neutral-900">How to Taste (The 4 S&apos;s)</h2>
        <div className="mb-8 space-y-3">
          {fourSs.map((item) => (
            <div
              key={item.step}
              className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <span className="text-xl" role="img" aria-hidden>{item.emoji}</span>
              <div>
                <p className="font-medium text-neutral-900">{item.step}</p>
                <p className="text-sm text-neutral-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Key Terms */}
        <h2 className="mb-3 text-base font-semibold text-neutral-900">Key Terms</h2>
        <div className="space-y-3">
          {keyTerms.map((item) => (
            <div
              key={item.term}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <p className="font-medium text-neutral-900">{item.term}</p>
              <p className="text-sm text-neutral-600">{item.definition}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
