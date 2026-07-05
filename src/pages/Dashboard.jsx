import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import AppNav from "../components/AppNav";
import { useAuth } from "../contexts/AuthContext";
import { listRecipes } from "../lib/recipes";

const PIE_COLORS = ["#E2833B", "#E2833B", "#B7CE93", "#C9BFAE", "#8F8474", "#3B302A"];

function dayLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { weekday: "short" });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    listRecipes(user.id)
      .then(setRecipes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  const stats = useMemo(() => {
    const total = recipes.length;
    const avgCalories = total
      ? Math.round(recipes.reduce((sum, r) => sum + (r.calories || 0), 0) / total)
      : 0;
    const avgPrepTime = total
      ? Math.round(recipes.reduce((sum, r) => sum + (r.prep_time || 0), 0) / total)
      : 0;
    const aiGenerated = recipes.filter((r) => r.source === "ai").length;

    const cuisineCounts = {};
    recipes.forEach((r) => {
      const c = r.cuisine || "Uncategorized";
      cuisineCounts[c] = (cuisineCounts[c] || 0) + 1;
    });
    const cuisineData = Object.entries(cuisineCounts).map(([name, value]) => ({ name, value }));

    const byDay = {};
    recipes.forEach((r) => {
      const d = dayLabel(r.created_at);
      byDay[d] = (byDay[d] || 0) + 1;
    });
    const order = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekdayData = order.map((d) => ({ day: d, recipes: byDay[d] || 0 }));

    const ingredientCounts = {};
    recipes.forEach((r) => {
      (r.ingredients || []).forEach((ing) => {
        const key = (typeof ing === "string" ? ing : ing.name || "").toLowerCase().trim();
        if (!key) return;
        ingredientCounts[key] = (ingredientCounts[key] || 0) + 1;
      });
    });
    const topIngredients = Object.entries(ingredientCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    return { total, avgCalories, avgPrepTime, aiGenerated, cuisineData, weekdayData, topIngredients };
  }, [recipes]);

  return (
    <div className="dash-page">
      <style>{`
        .dash-page { min-height:100vh; background:#120D0A; font-family:'Inter',sans-serif; color:#F5EEE3; }
        .dash-body { max-width:1100px; margin:0 auto; padding:2rem; }
        .dash-title { font-family:'Fraunces',serif; font-size:26px; font-weight:600; margin:0 0 1.5rem; }
        .dash-metrics { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:1rem; margin-bottom:2rem; }
        .dash-metric { background:#1C1512; border:1px solid rgba(245,238,227,0.1); border-radius:12px; padding:1rem 1.25rem; }
        .dash-metric-label { font-size:12.5px; color:rgba(245,238,227,0.55); margin-bottom:.4rem; }
        .dash-metric-value { font-size:24px; font-weight:600; }
        .dash-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:1.5rem; }
        .dash-card { background:#1C1512; border:1px solid rgba(245,238,227,0.1); border-radius:14px; padding:1.5rem; }
        .dash-card h3 { font-size:15px; font-weight:600; margin:0 0 1rem; }
        .dash-empty { text-align:center; padding:4rem 2rem; color:rgba(245,238,227,0.55); }
      `}</style>
      <AppNav />
      <div className="dash-body">
        <h1 className="dash-title">Your cooking analytics</h1>

        {error && <p style={{ color: "#a33" }}>{error}</p>}

        {!loading && stats.total === 0 ? (
          <div className="dash-empty">No recipes yet. Generate your first one to see analytics here.</div>
        ) : (
          <>
            <div className="dash-metrics">
              <div className="dash-metric">
                <div className="dash-metric-label">Total recipes</div>
                <div className="dash-metric-value">{stats.total}</div>
              </div>
              <div className="dash-metric">
                <div className="dash-metric-label">AI-generated</div>
                <div className="dash-metric-value">{stats.aiGenerated}</div>
              </div>
              <div className="dash-metric">
                <div className="dash-metric-label">Avg. calories</div>
                <div className="dash-metric-value">{stats.avgCalories}</div>
              </div>
              <div className="dash-metric">
                <div className="dash-metric-label">Avg. prep time</div>
                <div className="dash-metric-value">{stats.avgPrepTime}m</div>
              </div>
            </div>

            <div className="dash-grid">
              <div className="dash-card">
                <h3>Recipes saved by day</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stats.weekdayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,238,227,0.08)" />
                    <XAxis dataKey="day" fontSize={12} />
                    <YAxis fontSize={12} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="recipes" stroke="#E2833B" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="dash-card">
                <h3>Cuisines in your recipe box</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={stats.cuisineData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                      {stats.cuisineData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="dash-card" style={{ gridColumn: "1 / -1" }}>
                <h3>Most-used ingredients</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.topIngredients} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,238,227,0.08)" />
                    <XAxis type="number" fontSize={12} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" fontSize={12} width={110} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#E2833B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
