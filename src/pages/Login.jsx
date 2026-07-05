import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <style>{`
        .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#120D0A; font-family:'Inter',sans-serif; padding:2rem; }
        .auth-card { width:100%; max-width:380px; background:#1C1512; border:1px solid rgba(245,238,227,0.12); border-radius:16px; padding:2.5rem; }
        .auth-title { font-family:'Fraunces',serif; font-size:26px; font-weight:600; margin:0 0 .5rem; text-align:center; }
        .auth-sub { text-align:center; font-size:14px; color:rgba(245,238,227,0.6); margin:0 0 1.75rem; }
        .auth-field { margin-bottom:1rem; }
        .auth-field label { display:block; font-size:13px; margin-bottom:.4rem; color:#F5EEE3; }
        .auth-field input { width:100%; padding:.65rem .8rem; border-radius:8px; border:1px solid rgba(245,238,227,0.18); font-size:14px; }
        .auth-error { background:rgba(200,60,50,0.08); color:#a33; font-size:13px; padding:.6rem .8rem; border-radius:8px; margin-bottom:1rem; }
        .auth-submit { width:100%; padding:.75rem; border-radius:999px; border:none; background:#E2833B; color:#1C1512; font-size:14px; font-weight:500; cursor:pointer; margin-top:.5rem; }
        .auth-submit:disabled { opacity:.6; cursor:default; }
        .auth-foot { text-align:center; font-size:13px; margin-top:1.5rem; color:rgba(245,238,227,0.6); }
        .auth-foot a { color:#E2833B; font-weight:500; text-decoration:none; }
      `}</style>
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your recipe box.</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="auth-foot">
          New to Ladle? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
