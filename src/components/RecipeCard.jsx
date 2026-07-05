import React from "react";
import { Link } from "react-router-dom";

export default function RecipeCard({ recipe, onDelete }) {
  return (
    <div className="recipe-card">
      <style>{`
        .recipe-card { background:#1C1512; border:1px solid rgba(245,238,227,0.1); border-radius:14px; padding:1.25rem; display:flex; flex-direction:column; gap:.5rem; }
        .recipe-card h3 { font-family:'Fraunces',serif; font-size:17px; font-weight:600; margin:0; }
        .recipe-card-meta { display:flex; gap:.75rem; font-size:12.5px; color:rgba(245,238,227,0.55); }
        .recipe-card-tag { background:rgba(226,131,59,0.1); color:#E2833B; padding:.15rem .55rem; border-radius:999px; font-size:11.5px; }
        .recipe-card-actions { display:flex; gap:.5rem; margin-top:.5rem; }
        .recipe-card-actions a, .recipe-card-actions button { font-size:12.5px; padding:.4rem .8rem; border-radius:999px; border:1px solid rgba(245,238,227,0.15); background:none; text-decoration:none; color:#F5EEE3; cursor:pointer; }
        .recipe-card-actions .danger { color:#a33; border-color:rgba(163,51,51,0.3); }
      `}</style>
      <div className="recipe-card-meta">
        <span className="recipe-card-tag">{recipe.source === "ai" ? "AI generated" : "Manual"}</span>
        <span>{recipe.cuisine || "Uncategorized"}</span>
      </div>
      <h3>{recipe.title}</h3>
      <div className="recipe-card-meta">
        <span>{recipe.prep_time ?? "?"} min prep</span>
        <span>{recipe.calories ?? "?"} kcal</span>
        <span>{recipe.servings ?? "?"} servings</span>
      </div>
      <div className="recipe-card-actions">
        <Link to={`/recipes/${recipe.id}`}>View</Link>
        <button className="danger" onClick={() => onDelete?.(recipe)}>Delete</button>
      </div>
    </div>
  );
}
