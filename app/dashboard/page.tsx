"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/libs/supabase/client";
import { RankedWineList, type Wine } from "@/components/RankedWineList";
import { FeedCard, type FeedWine } from "@/components/FeedCard";
import { cn } from "@/libs/utils";

function normalizeWine(raw: Record<string, unknown>): Wine | null {
  const id = raw?.id;
  if (id == null || (typeof id !== "number" && typeof id !== "string")) return null;
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  if (Number.isNaN(numId)) return null;
  return {
    id: numId,
    rank: typeof raw?.rank === "number" ? raw.rank : 999999,
    producer: typeof raw?.producer === "string" ? raw.producer : "",
    vintage: typeof raw?.vintage === "number" ? raw.vintage : 0,
    varietal: typeof raw?.varietal === "string" ? raw.varietal : "",
    region: raw?.region != null && typeof raw.region === "string" ? raw.region : null,
    price: raw?.price != null && typeof raw.price === "number" ? raw.price : null,
    location: raw?.location != null && typeof raw.location === "string" ? raw.location : null,
    rating: typeof raw?.rating === "number" ? raw.rating : 0,
    tasting_note: raw?.tasting_note != null && typeof raw.tasting_note === "string" ? raw.tasting_note : null,
    created_at: typeof raw?.created_at === "string" ? raw.created_at : "",
  };
}

type ViewMode = "me" | "following";

export default function Dashboard() {
  const [view, setView] = useState<ViewMode>("me");
  const [wines, setWines] = useState<Wine[]>([]);
  const [feedWines, setFeedWines] = useState<FeedWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchMyWines = useCallback(async () => {
    setFetchError(null);
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase.from("wines").select("*");

      if (error) {
        console.error("Error fetching wines:", error);
        setFetchError(error.message ?? "Failed to load wines");
        setWines([]);
        return;
      }

      const myWines = (data || []).filter(
        (w: { user_id?: string; status?: string }) =>
          w.user_id === user?.id && w.status !== "wishlist"
      );
      const normalized = myWines
        .map((r) => normalizeWine(r as Record<string, unknown>))
        .filter((w): w is Wine => w != null)
        .sort((a, b) => a.rank - b.rank || a.id - b.id);
      setWines(normalized);
    } catch (err) {
      console.error("Error:", err);
      setFetchError(err instanceof Error ? err.message : "Something went wrong");
      setWines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFollowingFeed = useCallback(async () => {
    setFetchError(null);
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFeedWines([]);
        setLoading(false);
        return;
      }
      const { data: followRows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);
      const followingIds = (followRows ?? []).map((r) => r.following_id as string).filter(Boolean);
      if (followingIds.length === 0) {
        setFeedWines([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("wines")
        .select("*, profiles(username, avatar_url, full_name)")
        .in("user_id", followingIds)
        .or("status.neq.wishlist,status.is.null")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching feed:", error);
        setFetchError(error.message ?? "Failed to load feed");
        setFeedWines([]);
        return;
      }
      setFeedWines((data ?? []) as FeedWine[]);
    } catch (err) {
      console.error("Error:", err);
      setFetchError(err instanceof Error ? err.message : "Something went wrong");
      setFeedWines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === "me") fetchMyWines();
    else fetchFollowingFeed();
  }, [view, fetchMyWines, fetchFollowingFeed]);

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

      <main className="mx-auto max-w-2xl px-4 pt-4 pb-8">
        <div className="mb-4 flex rounded-lg border border-neutral-200 bg-neutral-50 p-1">
          <button
            type="button"
            onClick={() => setView("me")}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
              view === "me"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            )}
          >
            My List
          </button>
          <button
            type="button"
            onClick={() => setView("following")}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
              view === "following"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            )}
          >
            Following
          </button>
        </div>

        {view === "me" && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900">Your wines</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Drag to reorder your ranked list
            </p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-16">
            <p className="text-sm text-neutral-500">Loading…</p>
          </div>
        )}

        {!loading && fetchError && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/50 py-16 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">Couldn’t load</h2>
            <p className="mt-2 max-w-xs text-sm text-neutral-500">{fetchError}</p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => (view === "me" ? fetchMyWines() : fetchFollowingFeed())}
            >
              Try again
            </Button>
          </div>
        )}

        {!loading && !fetchError && view === "me" && wines.length > 0 && (
          <RankedWineList initialWines={wines} onRefresh={fetchMyWines} />
        )}

        {!loading && !fetchError && view === "me" && wines.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 py-16 text-center">
            <span className="mb-4 text-5xl">🍷</span>
            <h2 className="text-lg font-semibold text-neutral-900">No wines yet</h2>
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

        {!loading && !fetchError && view === "following" && feedWines.length > 0 && (
          <ul className="space-y-4">
            {feedWines.map((wine) => (
              <li key={`${wine.user_id}-${wine.id}`}>
                <FeedCard wine={wine} />
              </li>
            ))}
          </ul>
        )}

        {!loading && !fetchError && view === "following" && feedWines.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 py-16 text-center">
            <span className="mb-4 text-4xl">👋</span>
            <h2 className="text-lg font-semibold text-neutral-900">No activity yet</h2>
            <p className="mt-2 max-w-xs text-sm text-neutral-500">
              Find friends to follow and see their wines here.
            </p>
            <Link href="/search" className="mt-6">
              <Button className="bg-purple-600 text-white hover:bg-purple-700">
                Find friends to follow
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
