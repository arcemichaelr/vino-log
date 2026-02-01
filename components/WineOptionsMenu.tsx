"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/libs/utils";

interface WineOptionsMenuProps {
  wineId: number;
  onDelete: (wineId: number) => Promise<void>;
  className?: string;
}

export function WineOptionsMenu({ wineId, onDelete, className }: WineOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open, handleClickOutside]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await onDelete(wineId);
      setOpen(false);
    } finally {
      setDeleting(false);
    }
  }, [wineId, onDelete]);

  return (
    <div ref={menuRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="flex items-center justify-center w-9 h-9 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
        aria-label="Wine options"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-20 min-w-[160px] rounded-lg border border-neutral-200 bg-white py-1 shadow-lg"
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete Wine"}
          </button>
        </div>
      )}
    </div>
  );
}
