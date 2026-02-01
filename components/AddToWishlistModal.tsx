"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/libs/supabase/client";

export interface AddToWishlistModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddToWishlistModal({
  open,
  onClose,
  onSuccess,
}: AddToWishlistModalProps) {
  const [producer, setProducer] = useState("");
  const [region, setRegion] = useState("");
  const [vintage, setVintage] = useState("");
  const [varietal, setVarietal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setProducer("");
      setRegion("");
      setVintage("");
      setVarietal("");
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in");
        setSaving(false);
        return;
      }
      const v = vintage.trim() ? parseInt(vintage.trim(), 10) : null;
      if (vintage.trim() && (Number.isNaN(v!) || v! < 0 || v! > 2100)) {
        setError("Vintage must be a valid year");
        setSaving(false);
        return;
      }
      const { error: insertError } = await supabase.from("wines").insert({
        producer: producer.trim() || "Unknown",
        region: region.trim() || null,
        vintage: v,
        varietal: varietal.trim() || null,
        status: "wishlist",
        rating: null,
        rank: null,
        price: null,
        location: null,
        tasting_note: null,
        user_id: user.id,
        created_at: new Date().toISOString(),
      });
      if (insertError) throw insertError;
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add wine");
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
        aria-labelledby="add-wishlist-title"
        className="relative w-full max-w-md max-h-[85vh] overflow-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-wishlist-title" className="mb-4 text-lg font-semibold text-neutral-900">
          Add to Wishlist
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-producer">Producer *</Label>
            <Input
              id="add-producer"
              value={producer}
              onChange={(e) => setProducer(e.target.value)}
              placeholder="Producer name"
              className="rounded-lg"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-region">Region</Label>
            <Input
              id="add-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. Napa Valley"
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-vintage">Vintage (optional)</Label>
            <Input
              id="add-vintage"
              type="text"
              inputMode="numeric"
              value={vintage}
              onChange={(e) => setVintage(e.target.value)}
              placeholder="e.g. 2019"
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-varietal">Varietal (optional)</Label>
            <Input
              id="add-varietal"
              value={varietal}
              onChange={(e) => setVarietal(e.target.value)}
              placeholder="e.g. Cabernet Sauvignon"
              className="rounded-lg"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
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
              {saving ? "Adding…" : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
