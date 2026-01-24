"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { generateWineReview } from "@/app/actions";

export default function LogWine() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    producer: "",
    vintage: "",
    varietal: "",
    region: "",
    price: "",
    location: "",
    rating: "",
    tastingNote: "",
  });
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("wines").insert([
        {
          producer: formData.producer,
          vintage: parseInt(formData.vintage),
          varietal: formData.varietal,
          region: formData.region || null,
          price: formData.price ? parseFloat(formData.price) : null,
          location: formData.location || null,
          rating: parseInt(formData.rating),
          tasting_note: formData.tastingNote || null,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error saving wine:", error);
        alert("Error saving wine. Please try again.");
        setIsSubmitting(false);
        return;
      }

      alert("Wine Logged!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving wine. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    <div className="min-h-screen bg-white">
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
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Vintage */}
              <div className="space-y-2">
                <Label htmlFor="vintage">Vintage *</Label>
                <Input
                  id="vintage"
                  type="number"
                  placeholder="e.g., 2018"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.vintage}
                  onChange={(e) => handleChange("vintage", e.target.value)}
                  required
                />
              </div>

              {/* Varietal */}
              <div className="space-y-2">
                <Label htmlFor="varietal">Varietal *</Label>
                <Input
                  id="varietal"
                  placeholder="e.g., Pinot Noir, Chardonnay, Cabernet Sauvignon"
                  value={formData.varietal}
                  onChange={(e) => handleChange("varietal", e.target.value)}
                  required
                />
              </div>

              {/* Region */}
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  placeholder="e.g., Burgundy, Napa Valley, Tuscany"
                  value={formData.region}
                  onChange={(e) => handleChange("region", e.target.value)}
                />
              </div>

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

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
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
    </div>
  );
}