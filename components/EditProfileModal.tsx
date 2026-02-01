"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ImageUpload";
import { supabase } from "@/libs/supabase/client";

export interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  initialFullName: string;
  initialUsername: string;
  initialAvatarUrl: string;
  onSuccess: () => void;
}

function stripAt(s: string): string {
  const t = s?.trim() ?? "";
  return t.startsWith("@") ? t.slice(1) : t;
}

function ensureAt(s: string): string {
  const t = s?.trim() ?? "";
  if (!t) return "";
  return t.startsWith("@") ? t : `@${t}`;
}

export function EditProfileModal({
  open,
  onClose,
  userId,
  initialFullName,
  initialUsername,
  initialAvatarUrl,
  onSuccess,
}: EditProfileModalProps) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFullName(initialFullName);
      setUsername(ensureAt(initialUsername));
      setAvatarUrl(initialAvatarUrl ?? "");
      setError(null);
    }
  }, [open, initialFullName, initialUsername, initialAvatarUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            full_name: fullName.trim() || null,
            username: stripAt(username) || null,
            avatar_url: avatarUrl.trim() || null,
          },
          { onConflict: "id" }
        );

      if (updateError) throw updateError;
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="relative w-full max-w-md max-h-[85vh] overflow-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="edit-profile-title" className="text-lg font-semibold text-neutral-900 mb-4">
          Edit profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-full-name">Full name</Label>
            <Input
              id="edit-full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-username">Username</Label>
            <Input
              id="edit-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>Profile photo</Label>
            <ImageUpload
              value={avatarUrl}
              onUploadComplete={setAvatarUrl}
              shape="circle"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-lg border-neutral-300"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
