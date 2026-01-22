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

export default function LogWine() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    vintage: "",
    type: "",
    rating: "",
    tastingNote: "",
  });
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission with backend
    console.log("Wine logged:", formData);
    // Show alert
    alert("Wine Logged!");
    // Navigate back to dashboard
    router.push("/dashboard");
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEnhanceWithAI = async () => {
    setIsAiEnhancing(true);
    
    // Wait 1.5 seconds
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Replace with AI-generated tasting note
    const aiGeneratedNote = "A bold expression with notes of dark cherry, leather, and a hint of vanilla oak. The tannins are well-integrated, offering a long, velvety finish.";
    setFormData((prev) => ({ ...prev, tastingNote: aiGeneratedNote }));
    setIsAiEnhancing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-purple-900">Log Wine</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Add a New Wine</CardTitle>
            <CardDescription>
              Record your wine tasting experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Wine Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Wine Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Domaine de la Romanée-Conti"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
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

              {/* Wine Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Wine Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                  required
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select wine type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Red">Red</SelectItem>
                    <SelectItem value="White">White</SelectItem>
                    <SelectItem value="Rosé">Rosé</SelectItem>
                    <SelectItem value="Sparkling">Sparkling</SelectItem>
                    <SelectItem value="Dessert">Dessert</SelectItem>
                    <SelectItem value="Fortified">Fortified</SelectItem>
                  </SelectContent>
                </Select>
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
                >
                  Log Wine
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}