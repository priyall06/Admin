import { Resend } from "resend";
import { requireUser } from "./_supabaseAuth.js";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

function welcomeHtml(fullName) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 20px;">Welcome to Ladle AI, ${fullName || "there"}!</h1>
      <p>Your recipe box is ready. Upload a photo of your fridge or type out what you've got,
      and we'll turn it into a full recipe in seconds.</p>
    </div>
  `;
}

function recipeHtml(recipe) {
  const ingredientsList = (recipe.ingredients || [])
    .map((ing) => `<li>${typeof ing === "string" ? ing : `${ing.quantity ?? ""} ${ing.name}`.trim()}</li>`)
    .join("");
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 20px;">${recipe.title}</h1>
      <p style="color:#555;">${recipe.cuisine || ""} &middot; ${recipe.prep_time ?? "?"} min &middot; ${recipe.calories ?? "?"} kcal</p>
      <h3>Ingredients</h3>
      <ul>${ingredientsList}</ul>
      <h3>Method</h3>
      <p style="white-space: pre-wrap;">${recipe.instructions || ""}</p>
    </div>
  `;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireUser(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  const { type, email, fullName, recipe } = req.body || {};
  if (!email) return res.status(400).json({ error: "Recipient email is required" });

  try {
    if (type === "welcome") {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: "Welcome to Ladle AI",
        html: welcomeHtml(fullName),
      });
    } else if (type === "recipe") {
      if (!recipe) return res.status(400).json({ error: "Recipe payload is required" });
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: `Your recipe: ${recipe.title}`,
        html: recipeHtml(recipe),
      });
    } else {
      return res.status(400).json({ error: "Unknown email type" });
    }

    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error("send-email error:", err);
    return res.status(500).json({ error: "Could not send that email right now." });
  }
}
