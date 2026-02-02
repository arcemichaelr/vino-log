"use server";

import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import { createClient } from "@/libs/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** Payload for update_wine_ranks RPC: [{ id: '...', rank: 1 }, ...] */
export type WineRankUpdate = { id: string; rank: number };

/** Saves new order via Supabase RPC update_wine_ranks. Falls back to per-row updates if RPC is missing. */
export async function saveWineRanks(updates: WineRankUpdate[]): Promise<{ ok: boolean; error?: string }> {
  if (!updates.length) return { ok: true };
  const supabase = await createClient();
  const { error: rpcError } = await supabase.rpc("update_wine_ranks", { updates });
  if (rpcError) {
    const msg = rpcError.message ?? "";
    if (msg.includes("function") && msg.includes("does not exist")) {
      const results = await Promise.all(
        updates.map(({ id, rank }) =>
          supabase.from("wines").update({ rank }).eq("id", parseInt(id, 10))
        )
      );
      const firstError = results.find((r) => r.error)?.error;
      if (firstError) return { ok: false, error: firstError.message };
      revalidatePath("/dashboard");
      return { ok: true };
    }
    return { ok: false, error: rpcError.message };
  }
  revalidatePath("/dashboard");
  return { ok: true };
}

/** @deprecated Prefer saveWineRanks (debounced in UI). Kept for compatibility. */
export async function updateWineOrder(items: { id: string; rank: number }[]): Promise<void> {
  const result = await saveWineRanks(items);
  if (!result.ok) throw new Error(result.error);
}

export async function deleteWine(wineId: number): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("wines").delete().eq("id", wineId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function generateWineReview(keywords: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a modern sommelier. Write a tasting note based on these keywords.\n\nConstraint: Output must be EXACTLY ONE SENTENCE. Maximum 20 words.\n\nTone: Punchy, casual, distinct. No flowery language like \"tapestry\" or \"symphony\".",
        },
        {
          role: "user",
          content: `Keywords: ${keywords}`,
        },
      ],
      max_tokens: 60,
      temperature: 0.6,
    });

    const review = completion.choices[0]?.message?.content || "";
    return review.trim();
  } catch (error) {
    console.error("Error generating wine review:", error);
    throw new Error("Failed to generate wine review");
  }
}