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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">Loading...</p>
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
      wines={wines}
      isOwnProfile={false}
      isFollowing={isFollowing}
      onFollow={handleFollow}
      onUnfollow={handleUnfollow}
    />
  );
}
