import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/recipes", label: "My recipes" },
  { to: "/generate", label: "Generate" },
  { to: "/meal-plan", label: "Meal plan" },
];

export default function AppNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/", { replace: true });
  }

  return (
    <nav className="app-nav">
      <style>{`
        .app-nav { display:flex; align-items:center; justify-content:space-between; padding:1rem 2rem; border-bottom:1px solid rgba(245,238,227,0.1); background:#1C1512; }
        .app-nav-brand { font-family:'Fraunces',serif; font-weight:600; font-size:18px; color:#F5EEE3; }
        .app-nav-links { display:flex; gap:1.5rem; }
        .app-nav-links a { color:rgba(245,238,227,0.6); text-decoration:none; font-size:14px; padding-bottom:4px; border-bottom:2px solid transparent; }
        .app-nav-links a.active { color:#F5EEE3; border-bottom-color:#E2833B; font-weight:500; }
        .app-nav-right { display:flex; align-items:center; gap:1rem; }
        .app-nav-email { font-size:13px; color:rgba(245,238,227,0.5); }
        .app-nav-out { border:1px solid rgba(245,238,227,0.18); background:none; color:#F5EEE3; border-radius:999px; padding:.45rem 1rem; font-size:13px; cursor:pointer; transition: background 0.15s ease; }
        .app-nav-out:hover { background: rgba(245,238,227,0.08); }
        @media (max-width: 720px) { .app-nav-links { display:none; } }
      `}</style>
      <span className="app-nav-brand">Ladle AI</span>
      <div className="app-nav-links">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? "active" : "")}>
            {l.label}
          </NavLink>
        ))}
      </div>
      <div className="app-nav-right">
        <span className="app-nav-email">{user?.email}</span>
        <button className="app-nav-out" onClick={handleSignOut}>Sign out</button>
      </div>
    </nav>
  );
}
