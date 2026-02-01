"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/libs/supabase/client";
import { AddToWishlistModal } from "@/components/AddToWishlistModal";

interface WishlistWine {
  id: number;
  producer: string;
  region: string | null;
  vintage: number | null;
  varietal: string | null;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wines, setWines] = useState<WishlistWine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("wines")
        .select("id, producer, region, vintage, varietal")
        .eq("user_id", user.id)
        .eq("status", "wishlist")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching wishlist:", error);
        setWines([]);
      } else {
        setWines(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error:", err);
      setWines([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  function handleLogIt(w: WishlistWine) {
    const params = new URLSearchParams();
    if (w.producer) params.set("producer", w.producer);
    if (w.region) params.set("region", w.region);
    if (w.vintage != null) params.set("vintage", String(w.vintage));
    if (w.varietal) params.set("varietal", w.varietal);
    router.push(`/log-wine?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-neutral-900 hover:opacity-80"
          >
            🍷 Vino Log
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400"
            onClick={() => setModalOpen(true)}
            aria-label="Add to wishlist"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-6 pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Want to Try</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Wines you want to try
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <p className="text-sm text-neutral-500">Loading…</p>
          </div>
        )}

        {!isLoading && wines.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 py-16 text-center">
            <p className="text-neutral-600">Your wishlist is empty</p>
            <Button
              className="mt-4 bg-purple-600 text-white hover:bg-purple-700"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add a Wine
            </Button>
          </div>
        )}

        {!isLoading && wines.length > 0 && (
          <ul className="space-y-3">
            {wines.map((w) => (
              <li
                key={w.id}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-4 shadow-sm"
              >
                <p className="font-semibold text-neutral-900">{w.producer || "Unknown"}</p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {[w.region, w.vintage != null ? String(w.vintage) : null, w.varietal]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-purple-400 text-purple-600 hover:bg-purple-50 hover:border-purple-500"
                    onClick={() => handleLogIt(w)}
                  >
                    Log it
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <AddToWishlistModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchWishlist}
      />
    </div>
  );
}
