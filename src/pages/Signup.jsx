import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await signUp(email, password, fullName);
      if (data.session) {
        navigate("/dashboard", { replace: true });
      } else {
        // Email confirmation is required before a session exists.
        setConfirmSent(true);
      }
    } catch (err) {
      setError(err.message || "Could not create your account.");
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
        .auth-success { background: rgba(226,131,59,0.1); color:#E2833B; font-size:13px; padding:.8rem; border-radius:8px; text-align:center; }
        .auth-submit { width:100%; padding:.75rem; border-radius:999px; border:none; background:#E2833B; color:#1C1512; font-size:14px; font-weight:500; cursor:pointer; margin-top:.5rem; }
        .auth-submit:disabled { opacity:.6; cursor:default; }
        .auth-foot { text-align:center; font-size:13px; margin-top:1.5rem; color:rgba(245,238,227,0.6); }
        .auth-foot a { color:#E2833B; font-weight:500; text-decoration:none; }
      `}</style>
      <div className="auth-card">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Ten free AI recipes, no card required.</p>
        {error && <div className="auth-error">{error}</div>}
        {confirmSent ? (
          <p className="auth-success">Check your inbox to confirm your email, then sign in.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="fullName">Full name</label>
              <input id="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jamie Oliver" />
            </div>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}
        <p className="auth-foot">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
