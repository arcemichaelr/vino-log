"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { supabase } from "@/libs/supabase/client";

interface ProfileRow {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfileRow[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFollowing = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);
    const ids = new Set((data ?? []).map((r) => r.following_id as string));
    setFollowingIds(ids);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        await fetchFollowing(user.id);
      }
    })();
  }, [fetchFollowing]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setResults([]);
          return;
        }
        const q = query.trim();
        const pattern = `%${q}%`;
        const { data: byUsername } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .neq("id", user.id)
          .ilike("username", pattern)
          .limit(20);
        const { data: byName } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .neq("id", user.id)
          .ilike("full_name", pattern)
          .limit(20);
        const seen = new Set<string>();
        const combined: ProfileRow[] = [];
        for (const row of [...(byUsername ?? []), ...(byName ?? [])] as ProfileRow[]) {
          if (seen.has(row.id)) continue;
          seen.add(row.id);
          combined.push(row);
        }
        setResults(combined.slice(0, 20) as ProfileRow[]);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function toggleFollow(profileId: string, isFollowing: boolean) {
    if (!currentUserId) return;
    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", profileId);
      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(profileId);
        return next;
      });
    } else {
      await supabase.from("follows").insert({
        follower_id: currentUserId,
        following_id: profileId,
      });
      setFollowingIds((prev) => new Set(prev).add(profileId));
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-3 text-xl font-bold text-neutral-900">Search</h1>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              type="search"
              placeholder="Search for people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-lg pl-10"
              autoComplete="off"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4 pb-24">
        {isSearching && (
          <p className="py-4 text-sm text-neutral-500">Searching…</p>
        )}
        {!isSearching && query.trim() && results.length === 0 && (
          <p className="py-4 text-sm text-neutral-500">No people found.</p>
        )}
        {!isSearching && results.length > 0 && (
          <ul className="space-y-2">
            {results.map((profile) => {
              const isFollowing = followingIds.has(profile.id);
              const displayName = profile.full_name || profile.username || "User";
              const handle = profile.username
                ? (profile.username.startsWith("@") ? profile.username : `@${profile.username}`)
                : null;
              return (
                <li
                  key={profile.id}
                  className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white px-4 py-3"
                >
                  <Link href={`/user/${profile.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover bg-neutral-100"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-600">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-neutral-900 truncate">{displayName}</p>
                      {handle && <p className="text-sm text-neutral-500 truncate">{handle}</p>}
                    </div>
                  </Link>
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    size="sm"
                    className="shrink-0 rounded-full"
                    onClick={() => toggleFollow(profile.id, isFollowing)}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
