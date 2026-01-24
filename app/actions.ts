"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
            "You are a professional sommelier. Write elegant, detailed wine tasting notes in 2-3 sentences. Focus on aroma, taste, body, tannins, and finish. Use sophisticated wine terminology.",
        },
        {
          role: "user",
          content: `Based on these keywords, write a professional sommelier-style tasting note: ${keywords}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const review = completion.choices[0]?.message?.content || "";
    return review.trim();
  } catch (error) {
    console.error("Error generating wine review:", error);
    throw new Error("Failed to generate wine review");
  }
}