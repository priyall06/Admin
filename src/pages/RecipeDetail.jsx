import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppNav from "../components/AppNav";
import { useAuth } from "../contexts/AuthContext";
import { getRecipe, updateRecipe, deleteRecipe, toggleFavorite, listFavoriteIds } from "../lib/recipes";
import { emailRecipe } from "../lib/ai";

export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getRecipe(id)
      .then((r) => {
        setRecipe(r);
        setDraft(r);
      })
      .catch((e) => setError(e.message));
    if (user) {
      listFavoriteIds(user.id).then((ids) => setIsFavorite(ids.includes(id)));
    }
  }, [id, user]);

  async function handleSave() {
    try {
      const updated = await updateRecipe(id, {
        title: draft.title,
        cuisine: draft.cuisine,
        instructions: draft.instructions,
        prep_time: draft.prep_time,
        calories: draft.calories,
        servings: draft.servings,
      });
      setRecipe(updated);
      setEditing(false);
      setStatus("Saved.");
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this recipe?")) return;
    await deleteRecipe(id);
    navigate("/recipes", { replace: true });
  }

  async function handleFavorite() {
    const next = await toggleFavorite(user.id, id, isFavorite);
    setIsFavorite(next);
  }

  async function handleEmail() {
    setStatus("Sending…");
    try {
      await emailRecipe({ email: user.email, recipe });
      setStatus("Emailed to " + user.email);
    } catch (e) {
      setStatus("");
      setError(e.message);
    }
  }

  if (error) return <p style={{ padding: "2rem", color: "#a33" }}>{error}</p>;
  if (!recipe) return <p style={{ padding: "2rem" }}>Loading…</p>;

  return (
    <div className="detail-page">
      <style>{`
        .detail-page { min-height:100vh; background:#120D0A; font-family:'Inter',sans-serif; color:#F5EEE3; }
        .detail-body { max-width:720px; margin:0 auto; padding:2rem; }
        .detail-card { background:#1C1512; border:1px solid rgba(245,238,227,0.1); border-radius:16px; padding:2rem; }
        .detail-title { font-family:'Fraunces',serif; font-size:28px; font-weight:600; margin:0 0 .5rem; }
        .detail-meta { display:flex; gap:1rem; font-size:13px; color:rgba(245,238,227,0.55); margin-bottom:1.5rem; }
        .detail-ingredients { margin-bottom:1.5rem; }
        .detail-ingredients h3, .detail-instructions h3 { font-size:15px; margin:0 0 .6rem; }
        .detail-ingredients ul { margin:0; padding-left:1.2rem; font-size:14px; line-height:1.8; }
        .detail-instructions p { font-size:14px; line-height:1.8; white-space:pre-wrap; }
        .detail-actions { display:flex; gap:.6rem; flex-wrap:wrap; margin-top:1.5rem; }
        .detail-actions button { border-radius:999px; padding:.5rem 1.1rem; font-size:13px; cursor:pointer; border:1px solid rgba(245,238,227,0.18); background:none; }
        .detail-actions .primary { background:#E2833B; color:#1C1512; border:none; }
        .detail-actions .danger { color:#a33; border-color:rgba(163,51,51,0.3); }
        .detail-status { font-size:13px; color:#E2833B; margin-top:.75rem; }
        .detail-field { margin-bottom:1rem; }
        .detail-field label { display:block; font-size:12.5px; color:rgba(245,238,227,0.6); margin-bottom:.3rem; }
        .detail-field input, .detail-field textarea { width:100%; padding:.55rem .7rem; border-radius:8px; border:1px solid rgba(245,238,227,0.18); font-size:14px; font-family:inherit; }
      `}</style>
      <AppNav />
      <div className="detail-body">
        <div className="detail-card">
          {editing ? (
            <>
              <div className="detail-field">
                <label>Title</label>
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </div>
              <div className="detail-field">
                <label>Instructions</label>
                <textarea rows={6} value={draft.instructions || ""} onChange={(e) => setDraft({ ...draft, instructions: e.target.value })} />
              </div>
              <div className="detail-actions">
                <button className="primary" onClick={handleSave}>Save changes</button>
                <button onClick={() => { setEditing(false); setDraft(recipe); }}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <h1 className="detail-title">{recipe.title}</h1>
              <div className="detail-meta">
                <span>{recipe.cuisine || "Uncategorized"}</span>
                <span>{recipe.prep_time ?? "?"} min</span>
                <span>{recipe.calories ?? "?"} kcal</span>
                <span>{recipe.servings ?? "?"} servings</span>
              </div>

              {recipe.ingredients?.length > 0 && (
                <div className="detail-ingredients">
                  <h3>Ingredients</h3>
                  <ul>
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i}>{typeof ing === "string" ? ing : `${ing.quantity ?? ""} ${ing.name}`.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="detail-instructions">
                <h3>Method</h3>
                <p>{recipe.instructions || "No instructions recorded."}</p>
              </div>

              <div className="detail-actions">
                <button className="primary" onClick={() => setEditing(true)}>Edit</button>
                <button onClick={handleFavorite}>{isFavorite ? "★ Favorited" : "☆ Favorite"}</button>
                <button onClick={handleEmail}>Email me this recipe</button>
                <button className="danger" onClick={handleDelete}>Delete</button>
              </div>
              {status && <p className="detail-status">{status}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
