"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { List } from "lucide-react";
import { mapLocationToCoords } from "@/libs/mapLocationToCoords";
import { supabase } from "@/libs/supabase/client";

const WineMap = dynamic(() => import("@/components/WineMap").then((mod) => ({ default: mod.WineMap })), {
  ssr: false,
});

interface Wine {
  id: number;
  producer: string;
  vintage: number;
  varietal: string;
  region: string | null;
  location: string | null;
  rating: number;
  lat?: number;
  lng?: number;
}

export default function MapPage() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNoWines, setHasNoWines] = useState(false);

  useEffect(() => {
    async function fetchWines() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setWines([]);
          setHasNoWines(true);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.from("wines").select("*");

        if (error) {
          console.error("Error fetching wines:", error);
          setWines([]);
          setHasNoWines(true);
          setIsLoading(false);
          return;
        }

        const myWines = (data || []).filter((w: { user_id?: string }) => w.user_id === user.id);

        const winesWithCoords = myWines.map((wine: Record<string, unknown>) => {
          let lat: number | undefined = typeof wine.lat === "number" ? wine.lat : undefined;
          let lng: number | undefined = typeof wine.lng === "number" ? wine.lng : undefined;
          if (lat == null || lng == null) {
            const coords = mapLocationToCoords(
              wine.location as string,
              wine.region as string
            );
            if (coords) {
              lat = lat ?? coords.lat;
              lng = lng ?? coords.lng;
            }
          }
          return {
            id: wine.id as number,
            producer: (wine.producer as string) ?? "",
            vintage: (wine.vintage as number) ?? 0,
            varietal: (wine.varietal as string) ?? "",
            region: (wine.region as string) ?? null,
            location: (wine.location as string) ?? null,
            rating: (wine.rating as number) ?? 0,
            lat,
            lng,
          };
        });

        setWines(winesWithCoords);
        setHasNoWines(winesWithCoords.length === 0);
      } catch (err) {
        console.error("Error:", err);
        setWines([]);
        setHasNoWines(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWines();
  }, []);

  return (
    <div className="relative h-[calc(100vh-5rem)] w-full overflow-hidden">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-neutral-500">Loading map...</p>
        </div>
      ) : (
        <WineMap wines={wines} hasNoWines={hasNoWines} />
      )}
      <Link
        href="/dashboard"
        className="absolute bottom-20 right-4 z-[1000] rounded-full bg-white p-3 shadow-lg hover:bg-neutral-50 transition-colors"
        aria-label="View list"
      >
        <List className="h-5 w-5 text-neutral-900" />
      </Link>
    </div>
  );
}
