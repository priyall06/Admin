import Groq from "groq-sdk";
import { requireUser } from "./_supabaseAuth.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  const { imageBase64 } = req.body || {};
  if (!imageBase64) {
    return res.status(400).json({ error: "An image is required" });
  }

  try {
    const completion = await groq.chat.completions.create({
      // Groq's vision-capable model.
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "List every food ingredient visible in this image as a JSON object: { \"ingredients\": string[] }. Respond with ONLY the JSON object, no markdown or commentary.",
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    return res.status(200).json({ ingredients: parsed.ingredients || [] });
  } catch (err) {
    console.error("analyze-image error:", err);
    return res.status(500).json({ error: "Could not read that image right now." });
  }
}
