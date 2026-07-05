import Groq from "groq-sdk";
import { requireUser } from "./_supabaseAuth.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  const { ingredients = [], cuisine = "", dietary = "", notes = "" } = req.body || {};
  if (!ingredients.length) {
    return res.status(400).json({ error: "At least one ingredient is required" });
  }

  const systemPrompt = `You are a recipe writer. Given a list of ingredients, respond ONLY with a single valid JSON object (no markdown, no commentary) matching this exact shape:
{
  "title": string,
  "cuisine": string,
  "prep_time": number (minutes),
  "cook_time": number (minutes),
  "calories": number (per serving, estimate),
  "servings": number,
  "ingredients": [ { "name": string, "quantity": string } ],
  "instructions": string (numbered steps as plain text, separated by newlines)
}
Use mainly the ingredients provided, and assume basic pantry staples (salt, pepper, oil, water) are available. Keep the recipe realistic and cookable.`;

  const userPrompt = `Ingredients available: ${ingredients.join(", ")}.
${cuisine ? `Preferred cuisine: ${cuisine}.` : ""}
${dietary ? `Dietary requirements: ${dietary}.` : ""}
${notes ? `Additional notes: ${notes}.` : ""}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    console.log("Groq raw recipe response:", raw);

    const parsed = JSON.parse(raw);

    // Normalize field names/types in case the model drifts from the exact schema
    // (e.g. returns "prepTime" instead of "prep_time", or a string instead of a number).
    const toNumber = (v) => {
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const n = parseInt(v.replace(/[^\d]/g, ""), 10);
        return Number.isNaN(n) ? null : n;
      }
      return null;
    };

    const recipe = {
      title: parsed.title || "Untitled recipe",
      cuisine: parsed.cuisine || cuisine || "",
      prep_time: toNumber(parsed.prep_time ?? parsed.prepTime),
      cook_time: toNumber(parsed.cook_time ?? parsed.cookTime),
      calories: toNumber(parsed.calories),
      servings: toNumber(parsed.servings),
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      instructions: parsed.instructions || parsed.steps || "",
    };

    return res.status(200).json({ recipe });
  } catch (err) {
    console.error("generate-recipe error:", err);
    return res.status(500).json({ error: "Could not generate a recipe right now." });
  }
}

