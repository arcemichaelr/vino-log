"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Wine {
  id: number;
  producer: string;
  vintage: number;
  varietal: string;
  region: string | null;
  price: number | null;
  location: string | null;
  rating: number;
  tasting_note: string | null;
  created_at: string;
}

function ratingColor(rating: number): string {
  if (rating >= 9) return "bg-purple-600 text-white";
  if (rating >= 7) return "bg-purple-100 text-purple-700";
  return "bg-neutral-100 text-neutral-600";
}

export default function Dashboard() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWines() {
      try {
        const { data, error } = await supabase
          .from("wines")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching wines:", error);
        } else {
          setWines(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWines();
  }, []);

  const ranked = [...wines].sort(
    (a, b) => (b.rating - a.rating) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-neutral-900 hover:opacity-80"
          >
            🍷 Vino Log
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-6 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Your wines</h1>
          <p className="mt-1 text-sm text-neutral-500">Ranked by rating</p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <p className="text-sm text-neutral-500">Loading…</p>
          </div>
        )}

        {!isLoading && ranked.length > 0 && (
          <ul className="divide-y divide-neutral-100">
            {ranked.map((wine, index) => (
              <li
                key={wine.id}
                className="flex items-center gap-4 py-4 first:pt-0"
              >
                <span
                  className="tabular-nums font-semibold text-neutral-300"
                  style={{ fontFeatureSettings: "'tnum'" }}
                >
                  #{index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-900">
                    {wine.producer}
                  </p>
                  <p className="truncate text-sm text-neutral-500">
                    {wine.vintage} · {wine.varietal}
                    {wine.region ? ` · ${wine.region}` : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold ${ratingColor(wine.rating)}`}
                >
                  {wine.rating.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && ranked.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 py-16 text-center">
            <span className="mb-4 text-5xl">🍷</span>
            <h2 className="text-lg font-semibold text-neutral-900">
              No wines yet
            </h2>
            <p className="mt-2 max-w-xs text-sm text-neutral-500">
              Start tracking your wine experiences.
            </p>
            <Link href="/log-wine" className="mt-6">
              <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
                <Plus className="mr-2 h-4 w-4" />
                Log your first wine
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
