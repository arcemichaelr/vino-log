"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Bookmark,
  Heart,
  Trophy,
  AlertCircle,
  ChevronRight,
  Map,
} from "lucide-react";
import type { WineWithCoords } from "@/components/ProfileMapPreview";

const ProfileMapPreviewDynamic = dynamic(
  () => import("@/components/ProfileMapPreview").then((mod) => ({ default: mod.ProfileMapPreview })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[150px] w-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100">
        <span className="text-sm text-neutral-400">Loading map…</span>
      </div>
    ),
  }
);

export interface ProfileLayoutProps {
  fullName: string;
  username: string;
  avatarUrl: string | null;
  joinedDate: number;
  followersCount: number;
  followingCount: number;
  beenCount: number;
  wantToTryCount: number;
  wines: WineWithCoords[];
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  editModalOpen?: boolean;
  onEditClick?: () => void;
}

export function ProfileLayout({
  fullName,
  username,
  avatarUrl,
  joinedDate,
  followersCount,
  followingCount,
  beenCount,
  wantToTryCount,
  wines,
  isOwnProfile,
  isFollowing = false,
  onFollow,
  onUnfollow,
  onEditClick,
}: ProfileLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-6 pb-24">
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="h-24 w-24 rounded-full object-cover bg-neutral-100"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 text-3xl font-semibold text-purple-600">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="mb-1 text-2xl font-bold text-neutral-900">{fullName}</h1>
          <p className="mb-2 text-base text-neutral-500">{username}</p>
          <p className="text-sm text-neutral-500">Member since {joinedDate}</p>
        </div>

        <div className="mb-6 flex justify-around border-b border-neutral-200 pb-6">
          <div className="text-center">
            <p className="text-xl font-bold text-neutral-900">{followersCount}</p>
            <p className="text-sm text-neutral-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-neutral-900">{followingCount}</p>
            <p className="text-sm text-neutral-500">Following</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-neutral-900">#1</p>
            <p className="text-sm text-neutral-500">Rank</p>
          </div>
        </div>

        <div className="mb-6 flex gap-3">
          {isOwnProfile ? (
            <>
              <Button
                variant="outline"
                className="flex-1 border-neutral-300"
                onClick={onEditClick ?? undefined}
              >
                Edit profile
              </Button>
              <Button variant="outline" className="flex-1 border-neutral-300">
                Share profile
              </Button>
            </>
          ) : (
            <Button
              variant={isFollowing ? "outline" : "default"}
              className="flex-1 rounded-full"
              onClick={isFollowing ? onUnfollow : onFollow}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>

        <div className="mb-6 space-y-1 rounded-lg border border-neutral-200 bg-white">
          {isOwnProfile ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-neutral-50"
              >
                <CheckCircle className="h-5 w-5 text-neutral-600" />
                <span className="flex-1 font-medium text-neutral-900">Been</span>
                <span className="font-semibold text-neutral-900">{beenCount}</span>
                <ChevronRight className="h-5 w-5 text-neutral-400" />
              </Link>
              <div className="border-t border-neutral-100" />
              <Link
                href="/wishlist"
                className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-neutral-50"
              >
                <Bookmark className="h-5 w-5 text-neutral-600" />
                <span className="flex-1 font-medium text-neutral-900">Want to Try</span>
                <span className="font-semibold text-neutral-900">{wantToTryCount}</span>
                <ChevronRight className="h-5 w-5 text-neutral-400" />
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 px-4 py-4">
                <CheckCircle className="h-5 w-5 text-neutral-600" />
                <span className="flex-1 font-medium text-neutral-900">Been</span>
                <span className="font-semibold text-neutral-900">{beenCount}</span>
                <ChevronRight className="h-5 w-5 text-neutral-400" />
              </div>
              <div className="border-t border-neutral-100" />
              <div className="flex items-center gap-4 px-4 py-4">
                <Bookmark className="h-5 w-5 text-neutral-600" />
                <span className="flex-1 font-medium text-neutral-900">Want to Try</span>
                <span className="font-semibold text-neutral-900">{wantToTryCount}</span>
                <ChevronRight className="h-5 w-5 text-neutral-400" />
              </div>
            </>
          )}
          <div className="border-t border-neutral-100" />
          <button className="flex w-full items-center gap-4 px-4 py-4 transition-colors hover:bg-neutral-50">
            <Heart className="h-5 w-5 text-neutral-600" />
            <span className="flex-1 font-medium text-neutral-900">Recs for You</span>
            <ChevronRight className="h-5 w-5 text-neutral-400" />
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-semibold text-neutral-900">Rank on VinoLog</span>
            </div>
            <p className="text-lg font-bold text-neutral-900">#1</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-semibold text-neutral-900">Restore your streak!</span>
            </div>
            <p className="text-sm font-medium text-neutral-700">Log a wine today</p>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Wine Map</h2>
            <Map className="h-5 w-5 text-neutral-400" />
          </div>
          <ProfileMapPreviewDynamic wines={wines} />
        </div>
      </div>
    </div>
  );
}
