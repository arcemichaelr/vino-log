"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Map } from "lucide-react";
import { saveWineRanks, type WineRankUpdate } from "@/app/actions";
import { WineOptionsMenu } from "@/components/WineOptionsMenu";
import { cn } from "@/libs/utils";
import { toast } from "sonner";

export interface Wine {
  id: number;
  rank: number;
  producer: string;
  vintage: number;
  varietal: string;
  region: string | null;
  price: number | null;
  location: string | null;
  rating: number;
  tasting_note: string | null;
  created_at: string;
}

function ratingBadgeColor(rating: number): { bg: string; text: string } {
  if (rating >= 9) return { bg: "bg-purple-500", text: "text-white" };
  if (rating >= 8) return { bg: "bg-purple-400", text: "text-white" };
  if (rating >= 7) return { bg: "bg-green-400", text: "text-white" };
  if (rating >= 6) return { bg: "bg-green-300", text: "text-neutral-800" };
  return { bg: "bg-neutral-200", text: "text-neutral-700" };
}

const SAVE_DEBOUNCE_MS = 1000;

interface RankedWineListProps {
  initialWines: Wine[];
  onRefresh?: () => void;
}

export function RankedWineList({ initialWines, onRefresh }: RankedWineListProps) {
  const [wines, setWines] = useState<Wine[]>(() => {
    const list = Array.isArray(initialWines) ? initialWines : [];
    return [...list].sort((a, b) => (a.rank ?? 999999) - (b.rank ?? 999999));
  });
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPayloadRef = useRef<WineRankUpdate[] | null>(null);

  const flushSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    const payload = pendingPayloadRef.current;
    pendingPayloadRef.current = null;
    if (!payload?.length) return;
    const result = await saveWineRanks(payload);
    if (result.ok) toast.success("Order saved");
    else toast.error(result.error ?? "Failed to save order");
  }, []);

  const scheduleSave = useCallback((items: WineRankUpdate[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    pendingPayloadRef.current = items;
    saveTimeoutRef.current = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
  }, [flushSave]);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const from = result.source.index;
      const to = result.destination.index;
      if (from === to) return;

      const next = [...wines];
      const [removed] = next.splice(from, 1);
      next.splice(to, 0, removed);

      setWines(next);

      const items: WineRankUpdate[] = next
        .map((w, i) => (w?.id != null ? { id: String(w.id), rank: i + 1 } : null))
        .filter((x): x is WineRankUpdate => x != null);
      if (items.length) scheduleSave(items);
    },
    [wines, scheduleSave]
  );

  const handleDelete = useCallback(
    async (wineId: number) => {
      const { deleteWine } = await import("@/app/actions");
      const result = await deleteWine(wineId);
      if (result.ok) {
        setWines((prev) => prev.filter((w) => w.id !== wineId));
        onRefresh?.();
        toast.success("Wine removed");
      } else {
        toast.error(result.error ?? "Could not delete wine");
      }
    },
    [onRefresh]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="wines">
        {(provided) => (
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-3"
          >
            {wines.map((wine, index) => {
              const id = wine?.id ?? index;
              const rating = Number(wine?.rating);
              const badgeColors = ratingBadgeColor(Number.isNaN(rating) ? 0 : rating);
              return (
                <Draggable
                  key={id}
                  draggableId={String(id)}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "bg-white rounded-lg shadow-sm border border-neutral-100",
                        snapshot.isDragging && "shadow-lg opacity-90"
                      )}
                    >
                      <div className="flex items-start gap-4 px-4 pt-4 pb-3">
                        {/* Drag Handle - Left */}
                        <div
                          {...provided.dragHandleProps}
                          className="shrink-0 touch-none text-neutral-300 hover:text-neutral-500 cursor-grab active:cursor-grabbing pt-0.5"
                          aria-label="Drag to reorder"
                        >
                          <GripVertical className="h-5 w-5" />
                        </div>

                        {/* Rank Number - Left */}
                        <span className="shrink-0 text-base font-medium text-neutral-400 w-8 pt-0.5">
                          {index + 1}.
                        </span>

                        {/* Wine Info - Middle */}
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-semibold text-neutral-900 truncate">
                            {wine.producer ?? "Unknown"}
                          </p>
                          <p className="text-sm text-neutral-500 truncate mt-0.5">
                            {wine.vintage ?? "—"} · {wine.varietal ?? "—"}
                            {wine.region ? ` · ${wine.region}` : ""}
                          </p>
                          {wine.location && (
                            <p className="text-xs text-neutral-400 truncate mt-0.5">
                              {wine.location}
                            </p>
                          )}
                        </div>

                        {/* Rating Badge */}
                        <span
                          className={cn(
                            "shrink-0 flex items-center justify-center h-10 w-10 rounded-full text-sm font-bold",
                            badgeColors.bg,
                            badgeColors.text
                          )}
                        >
                          {(Number.isNaN(rating) ? 0 : rating).toFixed(1)}
                        </span>

                        {/* Options menu (delete) */}
                        <WineOptionsMenu wineId={wine.id} onDelete={handleDelete} />
                      </div>

                      {/* View Map - Bottom right */}
                      <div className="flex justify-end px-4 pb-3 -mt-1">
                        <Link
                          href={`/map?highlight=${id}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
                        >
                          <Map className="h-3.5 w-3.5 shrink-0" />
                          View Map
                        </Link>
                      </div>
                    </li>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
