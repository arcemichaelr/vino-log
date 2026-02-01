"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/libs/supabase/client";

const BUCKET = "images";

export interface ImageUploadProps {
  value: string;
  onUploadComplete: (url: string) => void;
  /** Optional label above the upload area */
  label?: string;
  /** Shape: "circle" for avatar, "rect" for wine image */
  shape?: "circle" | "rect";
}

function sanitizeFilename(name: string): string {
  return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.-]/g, "").slice(0, 80) || "image";
}

export function ImageUpload({
  value,
  onUploadComplete,
  label,
  shape = "rect",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    e.target.value = "";

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        onUploadComplete("");
        return;
      }
      const ext = file.name.split(".").pop() || "jpg";
      const base = sanitizeFilename(file.name.replace(/\.[^.]+$/, ""));
      const path = `uploads/${user.id}/${Date.now()}-${base}.${ext}`;

      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) throw error;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onUploadComplete(data.publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      onUploadComplete("");
    } finally {
      setUploading(false);
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onUploadComplete("");
  }

  const isCircle = shape === "circle";
  const containerClass = isCircle
    ? "flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-neutral-300 bg-neutral-50 overflow-hidden"
    : "flex min-h-[120px] w-full items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 overflow-hidden";

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none text-neutral-700">{label}</label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`${containerClass} touch-manipulation transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-70 hover:border-neutral-400 hover:bg-neutral-100 active:bg-neutral-100 ${isCircle ? "cursor-pointer" : "cursor-pointer w-full"}`}
      >
        {uploading ? (
          <span className="flex flex-col items-center gap-2 text-neutral-500">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-xs font-medium">Uploading…</span>
          </span>
        ) : value ? (
          <span className={`relative flex items-center justify-center ${isCircle ? "h-full w-full" : "min-h-[120px] w-full"}`}>
            <img
              src={value}
              alt=""
              className={isCircle ? "h-full w-full object-cover" : "max-h-[200px] w-auto max-w-full object-contain"}
            />
            <span
              role="button"
              onClick={handleClear}
              className="absolute right-2 top-2 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-black/60 text-white touch-manipulation hover:bg-black/80"
              aria-label="Remove photo"
            >
              <X className="h-4 w-4" />
            </span>
            {!isCircle && (
              <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1.5 text-xs font-medium text-white touch-manipulation hover:bg-black/80">
                Change
              </span>
            )}
          </span>
        ) : (
          <span className="flex flex-col items-center gap-2 py-4 text-neutral-500">
            <Upload className="h-8 w-8" aria-hidden />
            <span className="text-sm font-medium">Upload Photo</span>
          </span>
        )}
      </button>
    </div>
  );
}
