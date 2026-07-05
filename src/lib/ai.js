import { supabase } from "./supabaseClient";

async function authedFetch(path, body) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("You must be signed in.");

  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

// Text-based recipe generation from an ingredient list / free-text prompt.
export function generateRecipe({ ingredients, cuisine, dietary, notes }) {
  return authedFetch("/api/generate-recipe", { ingredients, cuisine, dietary, notes });
}

// Groq Vision: send a base64 image of a fridge/pantry and get back a parsed ingredient list.
export function analyzeIngredientImage({ imageBase64 }) {
  return authedFetch("/api/analyze-image", { imageBase64 });
}

// Resend: email a saved recipe to the signed-in user.
export function emailRecipe({ email, recipe }) {
  return authedFetch("/api/send-email", { type: "recipe", email, recipe });
}
