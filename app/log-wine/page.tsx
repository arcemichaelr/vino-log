"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/libs/supabase/client";
import { generateWineReview } from "@/app/actions";

const WINE_TYPES = ["Red", "White", "Rosé", "Sparkling", "Dessert", "Other"] as const;

const initialForm = {
  imageUrl: "",
  type: "",
  producer: "",
  vintage: "",
  varietal: "",
  region: "",
  price: "",
  location: "",
  rating: "",
  tastingNote: "",
  lat: null as number | null,
  lng: null as number | null,
};

function LogWineForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState(initialForm);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const p = searchParams.get("producer") ?? "";
    const r = searchParams.get("region") ?? "";
    const v = searchParams.get("vintage") ?? "";
    const vari = searchParams.get("varietal") ?? "";
    if (p || r || v || vari) {
      setFormData((prev) => ({
        ...prev,
        ...(p && { producer: p }),
        ...(r && { region: r }),
        ...(v && { vintage: v }),
        ...(vari && { varietal: vari }),
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in");
        setIsSubmitting(false);
        return;
      }

      const vintageParsed = formData.vintage.trim() ? parseInt(formData.vintage, 10) : null;
      const vintage = vintageParsed != null && !Number.isNaN(vintageParsed) ? vintageParsed : null;
      const insertPayload = {
        producer: formData.producer,
        type: formData.type.trim() || null,
        vintage,
        varietal: formData.varietal.trim() || null,
        region: formData.region || null,
        price: formData.price ? parseFloat(formData.price) : null,
        location: formData.location || null,
        lat: formData.lat ?? null,
        lng: formData.lng ?? null,
        rating: parseInt(formData.rating, 10),
        tasting_note: formData.tastingNote || null,
        image_url: formData.imageUrl?.trim() || null,
        rank: 999999,
        status: "consumed",
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("wines").insert([insertPayload]);

      if (error) {
        console.error("Error saving wine (Supabase):", error);
        const message = error.message || (error as { details?: string }).details || "Error saving wine. Please try again.";
        alert(message);
        setIsSubmitting(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Error saving wine:", err);
      const message = err instanceof Error ? err.message : (typeof err === "object" && err !== null && "message" in err ? String((err as { message: unknown }).message) : "Error saving wine. Please try again.");
      alert(message);
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (selection: { name: string; lat: number; lng: number }) => {
    setFormData((prev) => ({
      ...prev,
      region: selection.name,
      lat: selection.lat,
      lng: selection.lng,
    }));
  };

  const handleEnhanceWithAI = async () => {
    setIsAiEnhancing(true);

    try {
      // Collect keywords from form fields
      const keywords = [
        formData.producer,
        formData.vintage,
        formData.varietal,
        formData.region,
        formData.tastingNote,
      ]
        .filter(Boolean)
        .join(", ");

      if (!keywords.trim()) {
        alert("Please fill in at least one field (Producer, Vintage, Varietal, Region, or Tasting Note) to generate an AI review.");
        setIsAiEnhancing(false);
        return;
      }

      // Call the server action
      const aiGeneratedNote = await generateWineReview(keywords);
      setFormData((prev) => ({ ...prev, tastingNote: aiGeneratedNote }));
    } catch (error) {
      console.error("Error generating AI review:", error);
      alert("Failed to generate AI review. Please try again.");
    } finally {
      setIsAiEnhancing(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-neutral-900">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-neutral-900">Log Wine</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 pb-8">
        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle>Add a New Wine</CardTitle>
            <CardDescription>
              Record your wine tasting experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Collapsible help for new users */}
            <details className="group mb-6 rounded-lg border-2 border-purple-200 bg-purple-50/50">
              <summary className="cursor-pointer list-none px-4 py-3 font-medium text-neutral-900 hover:text-purple-700">
                🍷 New to wine? Read this first!
              </summary>
              <div className="border-t border-purple-100 px-4 py-3 text-sm text-neutral-700">
                <p className="mb-2 font-medium">Don&apos;t stress about the details! Here&apos;s a cheat sheet:</p>
                <ul className="space-y-1">
                  <li><strong>Vintage:</strong> Just the year it was made. Usually on the front label.</li>
                  <li><strong>Varietal:</strong> The type of grape (e.g., Cabernet, Pinot Noir).</li>
                  <li><strong>Producer:</strong> The brand name (e.g., Barefoot, Josh).</li>
                </ul>
                <p className="mt-2 text-purple-700 font-medium">You can skip anything you don&apos;t know!</p>
              </div>
            </details>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Wine photo */}
              <div className="space-y-2">
                <ImageUpload
                  value={formData.imageUrl}
                  onUploadComplete={(url) => handleChange("imageUrl", url)}
                  label="Wine photo (optional)"
                  shape="rect"
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type || undefined}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger id="type" className="rounded-md border border-neutral-200 bg-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WINE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Producer */}
              <div className="space-y-2">
                <Label htmlFor="producer">Producer *</Label>
                <Input
                  id="producer"
                  placeholder="e.g., Domaine de la Romanée-Conti"
                  value={formData.producer}
                  onChange={(e) => handleChange("producer", e.target.value)}
                  required
                />
              </div>

              {/* Year (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="vintage">Year (Optional)</Label>
                <Input
                  id="vintage"
                  type="number"
                  placeholder="e.g., 2018"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.vintage}
                  onChange={(e) => handleChange("vintage", e.target.value)}
                />
              </div>

              {/* Grape / Varietal (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="varietal">Grape / Varietal (Optional)</Label>
                <Input
                  id="varietal"
                  placeholder="e.g., Pinot Noir, Chardonnay, Cabernet Sauvignon"
                  value={formData.varietal}
                  onChange={(e) => handleChange("varietal", e.target.value)}
                />
              </div>

              {/* Location (Smart Search) */}
              <LocationAutocomplete
                label="Location"
                id="location"
                placeholder="Search for a specific place (e.g. The French Laundry)..."
                value={formData.region}
                onSelect={(place) => {
                  setFormData((prev) => ({
                    ...prev,
                    region: place.name,
                    lat: place.lat,
                    lng: place.lng,
                  }));
                }}
              />

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 299.99"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
              </div>

              {/* Venue (where you had it) */}
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  placeholder="e.g., Restaurant, Home, Winery"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-10) *</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Rate from 1 to 10"
                  value={formData.rating}
                  onChange={(e) => handleChange("rating", e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  How would you rate this wine?
                </p>
              </div>

              {/* Tasting Note */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tastingNote">Tasting Note</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleEnhanceWithAI}
                    disabled={isAiEnhancing}
                    className="text-sm"
                  >
                    {isAiEnhancing ? "Sommelier is thinking..." : "✨ Enhance with AI"}
                  </Button>
                </div>
                <Textarea
                  id="tastingNote"
                  placeholder="Describe the aroma, taste, body, finish, and your overall impression..."
                  rows={6}
                  value={formData.tastingNote}
                  onChange={(e) => handleChange("tastingNote", e.target.value)}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Link href="/dashboard" className="sm:flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-2 border-gray-300"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="w-full sm:flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging..." : "Log Wine"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default function LogWine() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-neutral-500">Loading…</div>}>
        <LogWineForm />
      </Suspense>
    </div>
  );
}