"use client";

import { useCallback, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { updateWineOrder } from "@/app/actions";
import { cn } from "@/libs/utils";

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

function ratingColor(rating: number): string {
  if (rating >= 9) return "bg-purple-600 text-white";
  if (rating >= 7) return "bg-purple-100 text-purple-700";
  return "bg-neutral-100 text-neutral-600";
}

interface RankedWineListProps {
  initialWines: Wine[];
}

export function RankedWineList({ initialWines }: RankedWineListProps) {
  const [wines, setWines] = useState<Wine[]>(() =>
    [...initialWines].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
  );

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination) return;
      const from = result.source.index;
      const to = result.destination.index;
      if (from === to) return;

      const next = [...wines];
      const [removed] = next.splice(from, 1);
      next.splice(to, 0, removed);

      setWines(next);

      const items = next.map((w, i) => ({ id: String(w.id), rank: i + 1 }));
      updateWineOrder(items);
    },
    [wines]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="wines">
        {(provided) => (
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="divide-y divide-neutral-100"
          >
            {wines.map((wine, index) => (
              <Draggable
                key={wine.id}
                draggableId={String(wine.id)}
                index={index}
              >
                {(provided, snapshot) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                      "flex min-h-[60px] items-center gap-3 bg-white py-2 first:pt-0",
                      snapshot.isDragging && "opacity-90 shadow-lg"
                    )}
                  >
                    <span
                      className="tabular-nums text-sm font-semibold text-neutral-300"
                      style={{ fontFeatureSettings: "'tnum'" }}
                    >
                      #{index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-neutral-900">
                        {wine.producer}
                      </p>
                      <p className="truncate text-sm text-neutral-500">
                        {wine.vintage} · {wine.varietal}
                        {wine.region ? ` · ${wine.region}` : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold",
                        ratingColor(wine.rating)
                      )}
                    >
                      {wine.rating.toFixed(1)}
                    </span>
                    <div
                      {...provided.dragHandleProps}
                      className="shrink-0 touch-none p-2 text-neutral-400 hover:text-neutral-600"
                      aria-label="Drag to reorder"
                    >
                      <GripVertical className="h-5 w-5" />
                    </div>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
