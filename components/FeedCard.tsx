"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/libs/utils";

export interface FeedWineProfile {
  username: string | null;
  avatar_url: string | null;
  full_name: string | null;
}

export interface FeedWine {
  id: number;
  user_id: string;
  producer: string;
  vintage: number | null;
  varietal: string | null;
  region: string | null;
  rating: number | null;
  tasting_note: string | null;
  image_url: string | null;
  created_at: string;
  profiles?: FeedWineProfile | null;
}

const MAX_NOTE_LENGTH = 160;

function ratingBadgeColor(rating: number): { bg: string; text: string } {
  if (rating >= 9) return { bg: "bg-purple-500", text: "text-white" };
  if (rating >= 8) return { bg: "bg-purple-400", text: "text-white" };
  if (rating >= 7) return { bg: "bg-green-400", text: "text-white" };
  if (rating >= 6) return { bg: "bg-green-300", text: "text-neutral-800" };
  return { bg: "bg-neutral-200", text: "text-neutral-700" };
}

interface FeedCardProps {
  wine: FeedWine;
}

export function FeedCard({ wine }: FeedCardProps) {
  const profile = wine.profiles;
  const displayName = profile?.full_name || profile?.username || "User";
  const handle = profile?.username
    ? (profile.username.startsWith("@") ? profile.username : `@${profile.username}`)
    : null;
  const avatarUrl = profile?.avatar_url ?? null;
  const raw = wine.created_at
    ? formatDistanceToNow(new Date(wine.created_at), { addSuffix: false })
    : "";
  const shortMatch = raw.match(/^(\d+)\s*(\w+)/);
  const abbrev = shortMatch?.[2]
    ? shortMatch[2].startsWith("minute")
      ? "m"
      : shortMatch[2].startsWith("hour")
        ? "h"
        : shortMatch[2].startsWith("day")
          ? "d"
          : shortMatch[2].startsWith("month")
            ? "mo"
            : shortMatch[2].startsWith("year")
              ? "y"
              : ""
    : "";
  const timeLabel = shortMatch && abbrev ? `${shortMatch[1]}${abbrev} ago` : raw ? `${raw} ago` : "";
  const rating = wine.rating != null ? Number(wine.rating) : 0;
  const badgeColors = ratingBadgeColor(rating);
  const note = wine.tasting_note?.trim();
  const truncatedNote = note && note.length > MAX_NOTE_LENGTH
    ? `${note.slice(0, MAX_NOTE_LENGTH)}…`
    : note;

  return (
    <article className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3">
        <Link href={`/user/${wine.user_id}`} className="flex shrink-0 items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover bg-neutral-100"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-600">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-neutral-900 truncate">{displayName}</p>
            {handle && <p className="text-xs text-neutral-500 truncate">{handle}</p>}
          </div>
        </Link>
        {timeLabel && <span className="ml-auto shrink-0 text-xs text-neutral-400">{timeLabel}</span>}
      </header>

      {/* Image */}
      {wine.image_url && (
        <div className="w-full border-t border-neutral-100">
          <img
            src={wine.image_url}
            alt=""
            className="w-full rounded-b-xl object-cover"
            style={{ maxHeight: 320 }}
          />
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-neutral-900">{wine.producer || "Unknown"}</p>
            <p className="mt-0.5 text-sm text-neutral-500">
              {[wine.vintage, wine.varietal, wine.region].filter(Boolean).join(" • ") || "—"}
            </p>
          </div>
          {wine.rating != null && (
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                badgeColors.bg,
                badgeColors.text
              )}
            >
              {rating.toFixed(1)}
            </span>
          )}
        </div>
        {truncatedNote && (
          <p className="mt-2 text-sm text-neutral-600 line-clamp-3">{truncatedNote}</p>
        )}
      </div>
    </article>
  );
}
