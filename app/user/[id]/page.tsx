"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/libs/supabase/client";
import { mapLocationToCoords } from "@/libs/mapLocationToCoords";
import { ProfileLayout } from "@/components/ProfileLayout";
import type { WineWithCoords } from "@/components/ProfileMapPreview";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface ProfileWine {
  id: number;
  location: string | null;
  region: string | null;
  status?: string | null;
  lat?: number;
  lng?: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wines, setWines] = useState<ProfileWine[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [beenCount, setBeenCount] = useState(0);
  const [wantToTryCount, setWantToTryCount] = useState(0);
  const [ranking, setRanking] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!id) return;
    setNotFound(false);
    try {
      const { data: { user: me } } = await supabase.auth.getUser();
      setCurrentUserId(me?.id ?? null);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError || !profileData) {
        setNotFound(true);
        setProfile(null);
        setWines([]);
        setFollowersCount(0);
        setFollowingCount(0);
        setBeenCount(0);
        setWantToTryCount(0);
        setRanking(null);
        setIsLoading(false);
        return;
      }

      setProfile(profileData as Profile);

      const { data: winesData } = await supabase
        .from("wines")
        .select("id, location, region, status")
        .eq("user_id", id);

      const rows = Array.isArray(winesData) ? winesData : [];
      const withCoords: ProfileWine[] = rows.map((w) => {
        const c = mapLocationToCoords(w.location ?? null, w.region ?? null);
        return {
          id: w.id,
          location: w.location ?? null,
          region: w.region ?? null,
          status: (w as { status?: string }).status ?? null,
          lat: c?.lat,
          lng: c?.lng,
        };
      });
      setWines(withCoords);
      const been = withCoords.filter((w) => w.status === "consumed" || w.status == null).length;
      const want = withCoords.filter((w) => w.status === "wishlist").length;
      setBeenCount(been);
      setWantToTryCount(want);

      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", id);
      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", id);
      setFollowersCount(followers ?? 0);
      setFollowingCount(following ?? 0);

      const { data: rankData } = await supabase
        .from("user_ranks")
        .select("ranking")
        .eq("user_id", id)
        .maybeSingle();
      setRanking(rankData?.ranking ?? null);

      if (me) {
        const { data: followRow } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", me.id)
          .eq("following_id", id)
          .maybeSingle();
        setIsFollowing(!!followRow);
      }
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  async function handleFollow() {
    if (!currentUserId || !id) return;
    await supabase.from("follows").insert({
      follower_id: currentUserId,
      following_id: id,
    });
    setIsFollowing(true);
    setFollowersCount((c) => c + 1);
  }

  async function handleUnfollow() {
    if (!currentUserId || !id) return;
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", currentUserId)
      .eq("following_id", id);
    setIsFollowing(false);
    setFollowersCount((c) => Math.max(0, c - 1));
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6 pb-24">
          <div className="animate-pulse">
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-4 h-24 w-24 rounded-full bg-neutral-200 dark:bg-zinc-700" />
              <div className="mb-2 h-6 w-36 rounded bg-neutral-200 dark:bg-zinc-700" />
              <div className="mb-2 h-4 w-24 rounded bg-neutral-200 dark:bg-zinc-700" />
              <div className="h-3 w-28 rounded bg-neutral-200 dark:bg-zinc-700" />
            </div>
            <div className="mb-6 flex justify-around border-b border-neutral-200 pb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="h-6 w-10 rounded bg-neutral-200 dark:bg-zinc-700" />
                  <div className="h-3 w-14 rounded bg-neutral-200 dark:bg-zinc-700" />
                </div>
              ))}
            </div>
            <div className="mb-6">
              <div className="h-10 w-full rounded-full bg-neutral-200 dark:bg-zinc-700" />
            </div>
            <div className="space-y-3 rounded-lg border border-neutral-200 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-5 w-5 rounded bg-neutral-200 dark:bg-zinc-700" />
                  <div className="h-4 flex-1 rounded bg-neutral-200 dark:bg-zinc-700" />
                  <div className="h-4 w-8 rounded bg-neutral-200 dark:bg-zinc-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="mb-4 text-neutral-500">Profile not found</p>
        <Link href="/search">
          <Button variant="outline">Back to Search</Button>
        </Link>
      </div>
    );
  }

  const fullName = profile.full_name || "User";
  const username = profile.username != null
    ? (profile.username.startsWith("@") ? profile.username : `@${profile.username}`)
    : "@user";
  const joinedDate = profile.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  return (
    <ProfileLayout
      fullName={fullName}
      username={username}
      avatarUrl={profile.avatar_url ?? null}
      joinedDate={joinedDate}
      followersCount={followersCount}
      followingCount={followingCount}
      beenCount={beenCount}
      wantToTryCount={wantToTryCount}
      ranking={ranking}
      wines={wines}
      isOwnProfile={false}
      isFollowing={isFollowing}
      onFollow={handleFollow}
      onUnfollow={handleUnfollow}
    />
  );
}
