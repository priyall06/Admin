import React, { useEffect, useState } from "react";
import AppNav from "../components/AppNav";
import { useAuth } from "../contexts/AuthContext";
import {
  listMealPlans,
  createMealPlan,
  addMealPlanItem,
  deleteMealPlanItem,
  deleteMealPlan,
  listRecipes,
} from "../lib/recipes";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEALS = ["breakfast", "lunch", "dinner"];

function startOfWeek() {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

export default function MealPlanner() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");

  function refresh() {
    Promise.all([listMealPlans(user.id), listRecipes(user.id)])
      .then(([p, r]) => {
        setPlans(p);
        setRecipes(r);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (user) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleCreatePlan(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await createMealPlan(user.id, newTitle.trim(), startOfWeek());
      setNewTitle("");
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleAssign(planId, recipeId, day, meal) {
    if (!recipeId) return;
    try {
      await addMealPlanItem(planId, recipeId, DAYS.indexOf(day), meal);
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleRemoveItem(itemId) {
    await deleteMealPlanItem(itemId);
    refresh();
  }

  async function handleDeletePlan(planId) {
    if (!confirm("Delete this meal plan?")) return;
    await deleteMealPlan(planId);
    refresh();
  }

  return (
    <div className="plan-page">
      <style>{`
        .plan-page { min-height:100vh; background:#120D0A; font-family:'Inter',sans-serif; color:#F5EEE3; }
        .plan-body { max-width:1000px; margin:0 auto; padding:2rem; }
        .plan-title { font-family:'Fraunces',serif; font-size:26px; font-weight:600; margin:0 0 1.5rem; }
        .plan-new { display:flex; gap:.5rem; margin-bottom:2rem; }
        .plan-new input { flex:1; padding:.6rem .8rem; border-radius:8px; border:1px solid rgba(245,238,227,0.18); font-size:14px; }
        .plan-new button { background:#E2833B; color:#1C1512; border:none; border-radius:999px; padding:.6rem 1.2rem; font-size:14px; cursor:pointer; }
        .plan-card { background:#1C1512; border:1px solid rgba(245,238,227,0.1); border-radius:14px; padding:1.5rem; margin-bottom:1.5rem; }
        .plan-card-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
        .plan-card-head h3 { font-size:17px; font-weight:600; margin:0; }
        .plan-card-head button { border:1px solid rgba(163,51,51,0.3); color:#a33; background:none; border-radius:999px; padding:.3rem .8rem; font-size:12px; cursor:pointer; }
        .plan-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:.5rem; }
        .plan-day { border:1px solid rgba(245,238,227,0.1); border-radius:8px; padding:.5rem; min-height:120px; }
        .plan-day-label { font-size:12px; font-weight:500; margin-bottom:.4rem; }
        .plan-item { background:rgba(226,131,59,0.08); border-radius:6px; padding:.3rem .4rem; font-size:11.5px; margin-bottom:.3rem; display:flex; justify-content:space-between; gap:.3rem; align-items:center; }
        .plan-item button { border:none; background:none; color:#a33; cursor:pointer; font-size:12px; padding:0; }
        .plan-select { width:100%; font-size:11px; margin-top:.3rem; padding:.2rem; border-radius:4px; border:1px solid rgba(245,238,227,0.15); }
        @media (max-width: 900px) { .plan-grid { grid-template-columns:repeat(2,1fr); } }
      `}</style>
      <AppNav />
      <div className="plan-body">
        <h1 className="plan-title">Meal planner</h1>

        {error && <p style={{ color: "#a33" }}>{error}</p>}

        <form className="plan-new" onSubmit={handleCreatePlan}>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. This week's plan" />
          <button type="submit">Create plan</button>
        </form>

        {!loading && plans.length === 0 && <p>No meal plans yet. Create one above.</p>}

        {plans.map((plan) => (
          <div className="plan-card" key={plan.id}>
            <div className="plan-card-head">
              <h3>{plan.title}</h3>
              <button onClick={() => handleDeletePlan(plan.id)}>Delete plan</button>
            </div>
            <div className="plan-grid">
              {DAYS.map((day, dayIdx) => {
                const items = (plan.meal_plan_items || []).filter((it) => it.day_of_week === dayIdx);
                return (
                  <div className="plan-day" key={day}>
                    <div className="plan-day-label">{day}</div>
                    {items.map((it) => (
                      <div className="plan-item" key={it.id}>
                        <span>{it.recipes?.title || "Recipe"} ({it.meal_type})</span>
                        <button onClick={() => handleRemoveItem(it.id)}>×</button>
                      </div>
                    ))}
                    <select
                      className="plan-select"
                      defaultValue=""
                      onChange={(e) => {
                        const [recipeId, meal] = e.target.value.split("|");
                        handleAssign(plan.id, recipeId, day, meal);
                        e.target.value = "";
                      }}
                    >
                      <option value="" disabled>+ add recipe</option>
                      {recipes.flatMap((r) =>
                        MEALS.map((m) => (
                          <option key={r.id + m} value={`${r.id}|${m}`}>
                            {r.title} — {m}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
