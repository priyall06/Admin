import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Background3D from "../components/Background3D";

const MARQUEE_WORDS = [
  "leftover rice", "charred leeks", "brown butter", "wilting spinach",
  "half an onion", "aged cheddar", "roasted garlic", "three eggs",
  "toasted cumin", "seared lemon", "smoked paprika", "stale bread",
];

const STEPS = [
  { n: "01", title: "Snap or type", body: "Photograph your fridge or list what you've got. Groq Vision reads the picture for you." },
  { n: "02", title: "Groq drafts it", body: "A full recipe comes back in seconds: ingredients, method, timing, calories." },
  { n: "03", title: "Plan the week", body: "Drop recipes into a meal planner and track what you actually cook." },
];

const FRAGMENTS = [
  { title: "Brown butter rice bowl", meta: "25 min · 480 kcal", rotate: -8, top: "8%", left: "4%" },
  { title: "Charred leek galette", meta: "45 min · 520 kcal", rotate: 6, top: "58%", left: "2%" },
  { title: "Roasted garlic chicken", meta: "50 min · 610 kcal", rotate: -5, top: "72%", left: "78%" },
  { title: "Seared lemon salmon", meta: "20 min · 390 kcal", rotate: 9, top: "14%", left: "80%" },
];

const CAROUSEL_DISHES = [
  { name: "Charred leek galette", tag: "Weeknight" },
  { name: "Brown butter rice bowl", tag: "One pot" },
  { name: "Roasted garlic chicken", tag: "Sunday" },
  { name: "Seared lemon salmon", tag: "15 min" },
  { name: "Smoked paprika stew", tag: "Batch cook" },
  { name: "Toasted cumin flatbread", tag: "Vegetarian" },
];

/* ---- isometric-style 3D icons, built from shaded SVG faces (no external images) ---- */

function IsoBowl(props) {
  return (
    <svg viewBox="0 0 120 120" {...props}>
      <ellipse cx="60" cy="88" rx="42" ry="12" fill="#000" opacity="0.25" />
      <path d="M18 55 L60 32 L102 55 L60 78 Z" fill="#E2833B" />
      <path d="M18 55 L60 78 L60 96 L18 73 Z" fill="#B85C1F" />
      <path d="M102 55 L60 78 L60 96 L102 73 Z" fill="#C96C29" />
      <path d="M30 50 L60 34 L90 50 L60 66 Z" fill="#F2A15C" opacity="0.9" />
      <circle cx="52" cy="47" r="3" fill="#F5EEE3" opacity="0.8" />
      <circle cx="66" cy="52" r="2.5" fill="#F5EEE3" opacity="0.6" />
    </svg>
  );
}

function IsoPan(props) {
  return (
    <svg viewBox="0 0 120 120" {...props}>
      <ellipse cx="55" cy="86" rx="46" ry="11" fill="#000" opacity="0.22" />
      <path d="M15 52 L55 30 L95 52 L55 74 Z" fill="#271E19" />
      <path d="M15 52 L55 74 L55 90 L15 68 Z" fill="#171310" />
      <path d="M95 52 L55 74 L55 90 L95 68 Z" fill="#1C1512" />
      <path d="M27 50 L55 35 L83 50 L55 65 Z" fill="#E2833B" opacity="0.95" />
      <circle cx="55" cy="50" r="9" fill="#F2A15C" />
      <circle cx="55" cy="50" r="9" fill="none" stroke="#B85C1F" strokeWidth="2" />
      <path d="M95 52 L118 46 L118 51 L98 57 Z" fill="#171310" />
    </svg>
  );
}

function IsoBoard(props) {
  return (
    <svg viewBox="0 0 120 120" {...props}>
      <ellipse cx="60" cy="90" rx="48" ry="10" fill="#000" opacity="0.2" />
      <path d="M12 58 L60 34 L108 58 L60 82 Z" fill="#B08154" />
      <path d="M12 58 L60 82 L60 92 L12 68 Z" fill="#8A6440" />
      <path d="M108 58 L60 82 L60 92 L108 68 Z" fill="#976E47" />
      <ellipse cx="46" cy="55" rx="9" ry="6" fill="#E2833B" transform="rotate(-10 46 55)" />
      <ellipse cx="64" cy="49" rx="7" ry="5" fill="#8FB763" transform="rotate(8 64 49)" opacity="0.85" />
      <ellipse cx="74" cy="60" rx="6" ry="4" fill="#D9622E" transform="rotate(15 74 60)" />
    </svg>
  );
}

export default function Landing() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const layerRefs = useRef([]);

  useEffect(() => {
    function onMove(e) {
      const el = heroRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      if (titleRef.current) {
        titleRef.current.style.transform = `rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
      }
      layerRefs.current.forEach((node, i) => {
        if (!node) return;
        const depth = (i + 1) * 14;
        node.style.transform = `translate(${(px * depth).toFixed(1)}px, ${(py * depth).toFixed(1)}px) rotate(var(--r, 0deg))`;
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="landing">
      <Background3D />
      <style>{`
        .landing {
          --ink: #F4EEE3;
          --dim: #A79E8C;
          --ember: #E2833B;
          --ember-deep: #B85C1F;
          --char: #100D0A;
          --char-800: #191410;
          --line: rgba(244,238,227,0.1);
          background: var(--char);
          color: var(--ink);
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          position: relative;
        }
        .landing * { box-sizing: border-box; }

        .l-nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.75rem 2.5rem; max-width: 1200px; margin: 0 auto;
          position: relative; z-index: 20;
        }
        .l-brand { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 700; letter-spacing: -0.01em; }
        .l-brand span { color: var(--ember); }
        .l-nav-links { display: flex; gap: 0.75rem; align-items: center; }
        .l-btn {
          border-radius: 999px; padding: 0.6rem 1.35rem; font-size: 13.5px; font-weight: 600;
          text-decoration: none; display: inline-block; transition: all 0.2s ease; cursor: pointer;
        }
        .l-btn-ghost { color: var(--ink); border: 1px solid rgba(244,238,227,0.22); background: rgba(244,238,227,0.03); }
        .l-btn-ghost:hover { background: rgba(244,238,227,0.1); }
        .l-btn-primary {
          background: linear-gradient(180deg, var(--ember), var(--ember-deep));
          color: #1A0E04; border: none;
          box-shadow: 0 8px 20px rgba(226,131,59,0.35);
        }
        .l-btn-primary:hover { box-shadow: 0 12px 26px rgba(226,131,59,0.45); }

        /* ---- marquee ---- */
        .l-marquee-wrap {
          position: absolute; top: 30%; left: 0; width: 100%;
          transform: rotate(-4deg) translateY(-50%);
          z-index: 1; pointer-events: none;
          opacity: 0.5;
        }
        .l-marquee {
          display: flex; white-space: nowrap;
          animation: scrollLeft 40s linear infinite;
        }
        .l-marquee span {
          font-family: 'Fraunces', serif; font-size: 84px; font-weight: 700;
          color: transparent; -webkit-text-stroke: 1.5px rgba(244,238,227,0.14);
          margin-right: 3rem; flex-shrink: 0;
        }
        .l-marquee span:nth-child(3n) { -webkit-text-stroke: 1.5px rgba(226,131,59,0.28); }
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .l-glow {
          position: absolute; width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(226,131,59,0.16) 0%, transparent 70%);
          top: -180px; left: 50%; transform: translateX(-50%);
          z-index: 0; pointer-events: none;
        }

        /* ---- hero ---- */
        .l-hero {
          position: relative; z-index: 10;
          max-width: 880px; margin: 0 auto; text-align: center;
          padding: 5rem 2rem 3rem;
          perspective: 1200px;
        }
        .l-eyebrow {
          display: inline-flex; align-items: center; gap: 0.6rem;
          color: var(--ember); font-size: 12.5px; letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 1.75rem;
        }
        .l-eyebrow::before, .l-eyebrow::after { content: ""; width: 24px; height: 1px; background: rgba(226,131,59,0.5); }

        .l-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(2.75rem, 8vw, 6rem);
          line-height: 0.98;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 1.5rem;
          transform-style: preserve-3d;
          transition: transform 0.15s ease-out;
        }
        .l-title .r1 { display: block; color: var(--ink); }
        .l-title .r2 {
          display: block; font-style: italic; color: var(--ember);
          text-shadow: 0 4px 0 rgba(226,131,59,0.35), 0 18px 30px rgba(0,0,0,0.5);
        }

        .l-sub {
          color: var(--dim); font-size: 16.5px; line-height: 1.7;
          max-width: 480px; margin: 0 auto 2.5rem;
        }
        .l-hero-actions { display: flex; gap: 0.85rem; justify-content: center; margin-bottom: 1.5rem; }
        .l-hero-note { font-size: 12.5px; color: rgba(167,158,140,0.6); }

        /* ---- floating recipe fragments ---- */
        .l-fragment {
          position: absolute; z-index: 5;
          background: linear-gradient(155deg, #211A14, #171310);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 0.9rem 1.1rem;
          box-shadow: 0 25px 40px rgba(0,0,0,0.5);
          width: 190px;
          animation: fragFloat 7s ease-in-out infinite;
          display: none;
        }
        .l-fragment .ft { font-family: 'Fraunces', serif; font-size: 14px; font-weight: 600; margin: 0 0 0.3rem; color: var(--ink); }
        .l-fragment .fm { font-size: 11px; color: var(--dim); }
        @keyframes fragFloat {
          0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-14px) rotate(var(--r, 0deg)); }
        }
        @media (min-width: 1080px) {
          .l-fragment { display: block; }
        }

        /* ---- 3D isometric icons, parallax on mouse move ---- */
        .l-icon3d {
          position: absolute; z-index: 6;
          width: 92px; height: 92px;
          filter: drop-shadow(0 18px 24px rgba(0,0,0,0.5));
          transition: transform 0.05s linear;
          display: none;
        }
        .l-icon3d svg { width: 100%; height: 100%; }
        @media (min-width: 1080px) {
          .l-icon3d { display: block; }
        }

        /* ---- steps ---- */
        .l-steps {
          position: relative; z-index: 10;
          max-width: 1000px; margin: 0 auto; padding: 5rem 2rem 3rem;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap: 1.5rem;
          border-top: 1px solid var(--line);
        }
        .l-step {
          background: var(--char-800); border: 1px solid var(--line); border-radius: 16px;
          padding: 1.85rem 1.6rem;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .l-step:hover { transform: translateY(-4px); border-color: rgba(226,131,59,0.35); }
        .l-step-n {
          font-family: 'Fraunces', serif; color: var(--ember); font-size: 13px;
          letter-spacing: 0.1em;
        }
        .l-step h3 { font-size: 17px; font-weight: 600; margin: 0.85rem 0 0.5rem; color: var(--ink); }
        .l-step p { font-size: 14px; line-height: 1.65; color: var(--dim); margin: 0; }

        /* ---- 3D rotating dish carousel ---- */
        .l-carousel-section {
          position: relative; z-index: 10;
          padding: 2rem 2rem 5rem;
          text-align: center;
        }
        .l-carousel-title {
          font-family: 'Fraunces', serif; font-size: 26px; font-weight: 700;
          margin: 0 0 3rem;
        }
        .l-carousel-title em { color: var(--ember); font-style: italic; }
        .l-carousel-stage {
          width: 100%;
          max-width: 720px;
          height: 260px;
          margin: 0 auto;
          perspective: 1400px;
        }
        .l-carousel-ring {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: spinRing 22s linear infinite;
        }
        .l-carousel-stage:hover .l-carousel-ring {
          animation-play-state: paused;
        }
        @keyframes spinRing {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .l-carousel-card {
          position: absolute;
          top: 50%; left: 50%;
          width: 180px; height: 130px;
          margin: -65px 0 0 -90px;
          background: linear-gradient(155deg, #211A14, #171310);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 1rem 1.1rem;
          box-shadow: 0 20px 30px rgba(0,0,0,0.45);
          backface-visibility: hidden;
        }
        .l-carousel-card .ct {
          font-family: 'Fraunces', serif; font-size: 14.5px; font-weight: 600;
          margin: 0 0 0.5rem; color: var(--ink);
        }
        .l-carousel-card .cm {
          font-size: 11px;
          background: rgba(226,131,59,0.14); color: var(--ember);
          display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px;
        }

        /* ---- cta ---- */
        .l-cta {
          position: relative; z-index: 10;
          max-width: 720px; margin: 0 auto; padding: 1rem 2rem 6rem; text-align: center;
        }
        .l-cta h2 {
          font-family: 'Fraunces', serif; font-size: 32px; font-weight: 700;
          margin: 0 0 1.5rem; letter-spacing: -0.01em;
        }
        .l-cta h2 em { color: var(--ember); font-style: italic; }

        .l-footer {
          position: relative; z-index: 10;
          border-top: 1px solid var(--line); padding: 2rem; text-align: center;
          font-size: 12.5px; color: rgba(167,158,140,0.5);
        }

        @media (max-width: 640px) {
          .l-nav { padding: 1.25rem 1.5rem; }
          .l-marquee span { font-size: 48px; }
          .l-carousel-stage { height: 200px; }
          .l-carousel-card { width: 140px; height: 110px; margin: -55px 0 0 -70px; }
        }
      `}</style>

      <div className="l-glow" aria-hidden="true"></div>
      <div className="l-marquee-wrap" aria-hidden="true">
        <div className="l-marquee">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
      </div>

      <nav className="l-nav">
        <span className="l-brand">Ladle<span>.</span></span>
        <div className="l-nav-links">
          <Link to="/login" className="l-btn l-btn-ghost">Sign in</Link>
          <Link to="/signup" className="l-btn l-btn-primary">Get started</Link>
        </div>
      </nav>

      <header className="l-hero" ref={heroRef}>
        <p className="l-eyebrow">AI recipe generator &amp; meal planner</p>

        <h1 className="l-title" ref={titleRef}>
          <span className="r1">Cook what's</span>
          <span className="r2">already there.</span>
        </h1>

        {FRAGMENTS.map((f, i) => (
          <div
            key={i}
            className="l-fragment"
            style={{ top: f.top, left: f.left, "--r": `${f.rotate}deg` }}
          >
            <p className="ft">{f.title}</p>
            <p className="fm">{f.meta}</p>
          </div>
        ))}

        {/* isometric 3D food icons, drift with mouse parallax */}
        <div
          className="l-icon3d"
          style={{ top: "6%", left: "38%" }}
          ref={(el) => (layerRefs.current[0] = el)}
        >
          <IsoBowl />
        </div>
        <div
          className="l-icon3d"
          style={{ top: "62%", left: "18%", "--r": "-6deg" }}
          ref={(el) => (layerRefs.current[1] = el)}
        >
          <IsoPan />
        </div>
        <div
          className="l-icon3d"
          style={{ top: "68%", left: "60%", "--r": "5deg" }}
          ref={(el) => (layerRefs.current[2] = el)}
        >
          <IsoBoard />
        </div>

        <p className="l-sub">
          Photograph your fridge or type out your ingredients. Groq turns it into a real
          recipe in seconds, and Ladle helps you plan the week around it.
        </p>
        <div className="l-hero-actions">
          <Link to="/signup" className="l-btn l-btn-primary">Try Ladle free</Link>
          <Link to="/login" className="l-btn l-btn-ghost">I have an account</Link>
        </div>
        <p className="l-hero-note">Ten free recipes. No card required.</p>
      </header>

      <section className="l-steps">
        {STEPS.map((s) => (
          <div className="l-step" key={s.n}>
            <span className="l-step-n">{s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </section>

      <section className="l-carousel-section">
        <h2 className="l-carousel-title">A taste of what's <em>waiting for you.</em></h2>
        <div className="l-carousel-stage">
          <div className="l-carousel-ring">
            {CAROUSEL_DISHES.map((d, i) => {
              const angle = (360 / CAROUSEL_DISHES.length) * i;
              return (
                <div
                  key={d.name}
                  className="l-carousel-card"
                  style={{ transform: `rotateY(${angle}deg) translateZ(320px)` }}
                >
                  <p className="ct">{d.name}</p>
                  <span className="cm">{d.tag}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="l-cta">
        <h2>Stop scrolling recipes. <em>Start cooking one.</em></h2>
        <Link to="/signup" className="l-btn l-btn-primary">Create your account</Link>
      </section>

      <footer className="l-footer">Ladle AI &mdash; built with Supabase, Groq, and Resend.</footer>
    </div>
  );
}