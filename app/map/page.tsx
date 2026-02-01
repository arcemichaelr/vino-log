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

  useEffect(() => {
    async function fetchWines() {
      try {
        const { data, error } = await supabase.from("wines").select("*");

        if (error) {
          console.error("Error fetching wines:", error);
        } else {
          const winesWithCoords = (data || []).map((wine) => {
            const coords = mapLocationToCoords(wine.location, wine.region);
            return {
              ...wine,
              lat: coords?.lat,
              lng: coords?.lng,
            };
          });
          setWines(winesWithCoords);
        }
      } catch (error) {
        console.error("Error:", error);
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
        <WineMap wines={wines} />
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
