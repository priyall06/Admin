import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNav from "../components/AppNav";
import { useAuth } from "../contexts/AuthContext";
import { generateRecipe, analyzeIngredientImage } from "../lib/ai";
import { createRecipe } from "../lib/recipes";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function GenerateRecipe() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [dietary, setDietary] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setAnalyzing(true);
    try {
      const base64 = await fileToBase64(file);
      setImagePreview(URL.createObjectURL(file));
      const { ingredients: found } = await analyzeIngredientImage({ imageBase64: base64 });
      setIngredients((prev) => (prev ? prev + ", " + found.join(", ") : found.join(", ")));
    } catch (e) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setError("");
    setGenerating(true);
    setResult(null);
    try {
      const { recipe } = await generateRecipe({
        ingredients: ingredients.split(",").map((s) => s.trim()).filter(Boolean),
        cuisine,
        dietary,
      });
      setResult(recipe);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const saved = await createRecipe(user.id, { ...result, source: "ai" });
      navigate(`/recipes/${saved.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="gen-page">
      <style>{`
        .gen-page { min-height:100vh; background:#120D0A; font-family:'Inter',sans-serif; color:#F5EEE3; }
        .gen-body { max-width:720px; margin:0 auto; padding:2rem; }
        .gen-title { font-family:'Fraunces',serif; font-size:26px; font-weight:600; margin:0 0 .3rem; }
        .gen-sub { font-size:14px; color:rgba(245,238,227,0.6); margin:0 0 1.5rem; }
        .gen-card { background:#1C1512; border:1px solid rgba(245,238,227,0.1); border-radius:16px; padding:1.75rem; margin-bottom:1.5rem; }
        .gen-field { margin-bottom:1rem; }
        .gen-field label { display:block; font-size:13px; margin-bottom:.4rem; }
        .gen-field input, .gen-field textarea { width:100%; padding:.6rem .75rem; border-radius:8px; border:1px solid rgba(245,238,227,0.18); font-size:14px; font-family:inherit; }
        .gen-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .gen-upload { border:1.5px dashed rgba(245,238,227,0.25); border-radius:10px; padding:1.25rem; text-align:center; margin-bottom:1rem; cursor:pointer; font-size:13px; color:rgba(245,238,227,0.6); }
        .gen-preview { max-width:160px; border-radius:8px; margin:.75rem auto 0; display:block; }
        .gen-submit { background:#E2833B; color:#1C1512; border:none; border-radius:999px; padding:.75rem 1.5rem; font-size:14px; cursor:pointer; }
        .gen-submit:disabled { opacity:.6; }
        .gen-error { color:#a33; font-size:13px; margin-bottom:1rem; }
        .gen-result h2 { font-family:'Fraunces',serif; font-size:22px; margin:0 0 .5rem; }
        .gen-result-meta { display:flex; gap:1rem; font-size:13px; color:rgba(245,238,227,0.55); margin-bottom:1rem; }
        .gen-result ul { padding-left:1.2rem; font-size:14px; line-height:1.8; }
        .gen-result p { font-size:14px; line-height:1.8; white-space:pre-wrap; }
        .gen-save { margin-top:1rem; background:#E2833B; color:#1C1512; border:none; border-radius:999px; padding:.6rem 1.3rem; font-size:13px; cursor:pointer; }
      `}</style>
      <AppNav />
      <div className="gen-body">
        <h1 className="gen-title">Generate a recipe</h1>
        <p className="gen-sub">Type your ingredients, or upload a photo and let Groq Vision read it for you.</p>

        <div className="gen-card">
          <label className="gen-upload" htmlFor="fridge-photo">
            {analyzing ? "Reading your photo…" : "Click to upload a photo of your fridge or ingredients"}
            <input id="fridge-photo" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
          </label>
          {imagePreview && <img className="gen-preview" src={imagePreview} alt="Uploaded ingredients preview" />}

          <form onSubmit={handleGenerate}>
            <div className="gen-field">
              <label>Ingredients (comma separated)</label>
              <textarea rows={3} required value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="e.g. chicken thighs, leeks, cream, thyme" />
            </div>
            <div className="gen-row">
              <div className="gen-field">
                <label>Cuisine (optional)</label>
                <input value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="e.g. Italian" />
              </div>
              <div className="gen-field">
                <label>Dietary needs (optional)</label>
                <input value={dietary} onChange={(e) => setDietary(e.target.value)} placeholder="e.g. gluten-free" />
              </div>
            </div>
            {error && <p className="gen-error">{error}</p>}
            <button className="gen-submit" type="submit" disabled={generating}>
              {generating ? "Cooking up ideas…" : "Generate recipe"}
            </button>
          </form>
        </div>

        {result && (
          <div className="gen-card gen-result">
            <h2>{result.title}</h2>
            <div className="gen-result-meta">
              <span>{result.cuisine}</span>
              <span>{result.prep_time} min</span>
              <span>{result.calories} kcal</span>
              <span>{result.servings} servings</span>
            </div>
            <ul>
              {(result.ingredients || []).map((ing, i) => (
                <li key={i}>{typeof ing === "string" ? ing : `${ing.quantity ?? ""} ${ing.name}`.trim()}</li>
              ))}
            </ul>
            <p>{result.instructions}</p>
            <button className="gen-save" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save to my recipes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
