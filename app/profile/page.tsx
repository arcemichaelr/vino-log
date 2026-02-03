"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { mapLocationToCoords } from "@/libs/mapLocationToCoords";
import { supabase } from "@/libs/supabase/client";
import { EditProfileModal } from "@/components/EditProfileModal";
import { ProfileLayout } from "@/components/ProfileLayout";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface ProfileWine {
  id: number;
  location: string | null;
  region: string | null;
  lat?: number;
  lng?: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wines, setWines] = useState<ProfileWine[]>([]);
  const [beenCount, setBeenCount] = useState(0);
  const [wantToTryCount, setWantToTryCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [ranking, setRanking] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchProfileData = useCallback(async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      setUser(currentUser);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError);
      } else {
        setProfile(profileData);
      }

      const { count: followersCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", currentUser.id);
      const { count: followingCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", currentUser.id);
      setFollowersCount(followersCount ?? 0);
      setFollowingCount(followingCount ?? 0);

      const { data: rankData } = await supabase
        .from("user_ranks")
        .select("ranking")
        .eq("user_id", currentUser.id)
        .maybeSingle();
      setRanking(rankData?.ranking ?? null);

      const { data: winesData, error: winesError } = await supabase
        .from("wines")
        .select("id, location, region, status")
        .eq("user_id", currentUser.id);

      if (winesError) {
        console.error("Error fetching wines:", winesError);
        setWines([]);
        setBeenCount(0);
        setWantToTryCount(0);
      } else {
        const rows = Array.isArray(winesData) ? winesData : [];
        const withCoords = rows.map((w) => {
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
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-neutral-500 mb-4">You must be logged in</p>
          <Link href="/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const fullName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const username = profile?.username != null
    ? (profile.username.startsWith("@") ? profile.username : `@${profile.username}`)
    : `@${user?.email?.split("@")[0] || "user"}`;
  const avatarUrl = profile?.avatar_url ?? null;
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear();

  return (
    <>
      <ProfileLayout
        fullName={fullName}
        username={username}
        avatarUrl={avatarUrl}
        joinedDate={joinedDate}
        followersCount={followersCount}
        followingCount={followingCount}
        beenCount={beenCount}
        wantToTryCount={wantToTryCount}
        ranking={ranking}
        wines={wines}
        isOwnProfile={true}
        onEditClick={() => setEditModalOpen(true)}
      />
      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userId={user.id}
        initialFullName={fullName}
        initialUsername={username}
        initialAvatarUrl={avatarUrl ?? ""}
        onSuccess={fetchProfileData}
      />
    </>
  );
}
