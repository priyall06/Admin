import React, { useEffect, useState } from "react";
import AppNav from "../components/AppNav";
import RecipeCard from "../components/RecipeCard";
import { useAuth } from "../contexts/AuthContext";
import { listRecipes, deleteRecipe, createRecipe } from "../lib/recipes";

const EMPTY_FORM = { title: "", cuisine: "", prep_time: "", calories: "", servings: "", instructions: "" };

export default function Recipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function refresh() {
    setLoading(true);
    listRecipes(user.id)
      .then(setRecipes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (user) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleDelete(recipe) {
    if (!confirm(`Delete "${recipe.title}"?`)) return;
    try {
      await deleteRecipe(recipe.id);
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await createRecipe(user.id, {
        title: form.title,
        cuisine: form.cuisine || null,
        prep_time: form.prep_time ? Number(form.prep_time) : null,
        calories: form.calories ? Number(form.calories) : null,
        servings: form.servings ? Number(form.servings) : null,
        instructions: form.instructions,
        ingredients: [],
        source: "manual",
      });
      setRecipes((prev) => [created, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="recipes-page">
      <style>{`
        .recipes-page { min-height:100vh; background:#120D0A; font-family:'Inter',sans-serif; color:#F5EEE3; }
        .recipes-body { max-width:1000px; margin:0 auto; padding:2rem; }
        .recipes-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
        .recipes-title { font-family:'Fraunces',serif; font-size:26px; font-weight:600; margin:0; }
        .recipes-add { background:#E2833B; color:#1C1512; border:none; border-radius:999px; padding:.6rem 1.2rem; font-size:14px; cursor:pointer; }
        .recipes-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:1rem; }
        .recipes-empty { text-align:center; padding:4rem 2rem; color:rgba(245,238,227,0.55); }
        .add-form { background:#1C1512; border:1px solid rgba(245,238,227,0.1); border-radius:14px; padding:1.5rem; margin-bottom:1.5rem; display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; }
        .add-form label { font-size:12.5px; display:block; margin-bottom:.35rem; color:rgba(245,238,227,0.6); }
        .add-form input, .add-form textarea { width:100%; padding:.55rem .7rem; border-radius:8px; border:1px solid rgba(245,238,227,0.18); font-size:14px; font-family:inherit; }
        .add-form-full { grid-column: 1 / -1; }
        .add-form-actions { grid-column: 1 / -1; display:flex; gap:.5rem; }
        .add-form-actions button { border-radius:999px; padding:.55rem 1.2rem; font-size:13px; cursor:pointer; }
        .add-form-save { background:#E2833B; color:#1C1512; border:none; }
        .add-form-cancel { background:none; border:1px solid rgba(245,238,227,0.2); }
      `}</style>
      <AppNav />
      <div className="recipes-body">
        <div className="recipes-head">
          <h1 className="recipes-title">My recipes</h1>
          <button className="recipes-add" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Close" : "+ Add manually"}
          </button>
        </div>

        {error && <p style={{ color: "#a33" }}>{error}</p>}

        {showForm && (
          <form className="add-form" onSubmit={handleCreate}>
            <div>
              <label>Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label>Cuisine</label>
              <input value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} />
            </div>
            <div>
              <label>Prep time (min)</label>
              <input type="number" value={form.prep_time} onChange={(e) => setForm({ ...form, prep_time: e.target.value })} />
            </div>
            <div>
              <label>Calories</label>
              <input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
            </div>
            <div>
              <label>Servings</label>
              <input type="number" value={form.servings} onChange={(e) => setForm({ ...form, servings: e.target.value })} />
            </div>
            <div className="add-form-full">
              <label>Instructions</label>
              <textarea rows={4} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
            </div>
            <div className="add-form-actions">
              <button type="submit" className="add-form-save" disabled={saving}>{saving ? "Saving…" : "Save recipe"}</button>
              <button type="button" className="add-form-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {!loading && recipes.length === 0 ? (
          <div className="recipes-empty">No recipes yet. Try the Generate tab, or add one manually.</div>
        ) : (
          <div className="recipes-grid">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
