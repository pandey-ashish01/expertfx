"use client";

import Link from "next/link";
import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock, AlertCircle, TrendingUp, Shield, Zap, BarChart3, Globe, Sparkles } from "lucide-react";

export default function LoginForm() {
  const [userCode, setUserCode] = useState("");
  const [password, setPassword] = useState("");
  const [isSwapped, setIsSwapped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // ─── FIX: Already logged in? Redirect to dashboard ───────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      router.replace("/dashboard");
    }
  }, []);

  const texts = ["Professional Trading", "Institutional Execution", "Real-time Analytics", "Global Markets"];
  const [currentText, setCurrentText] = useState("");
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (index === texts.length) return;
    const timeout = setTimeout(() => {
      const fullText = texts[index];
      setCurrentText(
        deleting ? fullText.substring(0, subIndex - 1) : fullText.substring(0, subIndex + 1)
      );
      if (!deleting && subIndex === fullText.length) {
        setTimeout(() => setDeleting(true), 1500);
      } else if (deleting && subIndex === 0) {
        setDeleting(false);
        setIndex((prev) => (prev + 1) % texts.length);
      } else {
        setSubIndex((prev) => prev + (deleting ? -1 : 1));
      }
    }, deleting ? 60 : 120);
    return () => clearTimeout(timeout);
  }, [subIndex, deleting, index]);

  const handleUserCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setUserCode(value);
    setIsSwapped(value.length > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCode, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        router.push("/dashboard");
      } else {
        setError(data.message || "Login failed!");
      }
    } catch (err) {
      setError("Network error! Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Exo+2:wght@300;400;500;600;700&display=swap');

        .expertfx-login-root {
          font-family: 'Exo 2', sans-serif;
        }

        .expertfx-bg {
          background: #070b15;
          position: relative;
        }
        .expertfx-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 120% 100% at 20% 50%, #1a1a2e 0%, #0f1117 50%, #070b15 100%);
        }
        
        .expertfx-glow-1 {
          position: absolute;
          width: 600px;
          height: 600px;
          top: -200px;
          right: -200px;
          background: radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: floatGlow 8s ease-in-out infinite;
        }
        
        .expertfx-glow-2 {
          position: absolute;
          width: 400px;
          height: 400px;
          bottom: -100px;
          left: -100px;
          background: radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: floatGlow 10s ease-in-out infinite reverse;
        }
        
        @keyframes floatGlow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.1); }
        }

        .expertfx-stripes {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            -55deg, transparent, transparent 6px,
            rgba(255,255,255,0.008) 6px, rgba(255,255,255,0.008) 7px
          );
          pointer-events: none;
        }
        
        .expertfx-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(239,68,68,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239,68,68,0.03) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
          animation: gridPulse 4s ease-in-out infinite;
        }
        
        @keyframes gridPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .expertfx-shine {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle at 30% 40%,
            rgba(255,255,255,0.03) 0%,
            transparent 60%
          );
          pointer-events: none;
          animation: shineMove 12s ease-in-out infinite;
        }
        
        @keyframes shineMove {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10%, 5%); }
        }

        .expertfx-tri-tl {
          position: absolute;
          top: 0; left: 0;
          width: 0; height: 0;
          border-style: solid;
          border-width: 280px 220px 0 0;
          border-color: rgba(220,38,38,0.3) transparent transparent transparent;
          pointer-events: none;
        }
        .expertfx-tri-tl-inner {
          position: absolute;
          top: 10px; left: 10px;
          width: 0; height: 0;
          border-style: solid;
          border-width: 160px 125px 0 0;
          border-color: rgba(239,68,68,0.2) transparent transparent transparent;
          pointer-events: none;
        }
        .expertfx-tri-br {
          position: absolute;
          bottom: 0; right: 0;
          width: 0; height: 0;
          border-style: solid;
          border-width: 0 0 220px 180px;
          border-color: transparent transparent rgba(185,28,28,0.2) transparent;
          pointer-events: none;
        }

        .expertfx-orb-red {
          position: absolute;
          width: 450px; height: 450px;
          top: -100px; left: -80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 40%, transparent 70%);
          pointer-events: none;
          animation: orbPulse 6s ease-in-out infinite;
          filter: blur(40px);
        }
        .expertfx-orb-gold {
          position: absolute;
          width: 350px; height: 350px;
          bottom: -60px; right: 5%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%);
          pointer-events: none;
          animation: orbPulse 8s ease-in-out infinite 1.5s;
          filter: blur(40px);
        }
        .expertfx-orb-blue {
          position: absolute;
          width: 250px; height: 250px;
          top: 40%; left: 30%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
          pointer-events: none;
          animation: orbPulse 7s ease-in-out infinite 0.8s;
          filter: blur(40px);
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.5; }
          50% { transform: scale(1.15) translate(10px, -10px); opacity: 1; }
        }

        .expertfx-brand-name {
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          font-size: 3.5rem;
          line-height: 0.9;
          letter-spacing: -0.03em;
          position: relative;
        }
        .expertfx-brand-line1 {
          display: block;
          color: #f3f4f6;
          text-shadow: 0 0 60px rgba(239,68,68,0.2), 0 0 120px rgba(239,68,68,0.1);
        }
        .expertfx-brand-line2 {
          display: block;
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 40%, #f87171 70%, #dc2626 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 30px rgba(239,68,68,0.4));
          animation: gradientShine 4s ease-in-out infinite;
        }
        @keyframes gradientShine {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }

        .expertfx-tagline-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 7px 20px;
          border-radius: 100px;
          border: 1px solid rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.08);
          backdrop-filter: blur(10px);
          color: #fca5a5;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }
        .expertfx-tagline-badge:hover {
          border-color: rgba(239,68,68,0.6);
          background: rgba(239,68,68,0.15);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(239,68,68,0.1);
        }
        
        .expertfx-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef4444;
          display: inline-block;
          animation: dotPulse 1.5s ease-in-out infinite;
          box-shadow: 0 0 12px rgba(239,68,68,0.6);
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
        }

        .expertfx-typewriter {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          background: linear-gradient(135deg, #f3f4f6, #fca5a5, #f3f4f6);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.04em;
          animation: gradientShine 3s ease-in-out infinite;
        }
        .expertfx-cursor {
          -webkit-text-fill-color: #ef4444;
          color: #ef4444;
          animation: blink 0.8s step-end infinite;
          font-weight: 900;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        .expertfx-form-panel {
          background: rgba(7,11,21,0.92);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(239,68,68,0.08);
        }

        .expertfx-input-wrapper {
          position: relative;
          transition: all 0.3s ease;
        }
        .expertfx-input-wrapper:focus-within {
          transform: translateY(-1px);
        }

        .expertfx-input {
          width: 100%;
          background: rgba(26,28,42,0.5);
          border: 1.5px solid rgba(239,68,68,0.15);
          border-radius: 8px;
          padding: 14px 16px 14px 48px;
          color: #e5e7eb;
          font-family: 'Exo 2', sans-serif;
          font-size: 15px;
          outline: none;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }
        .expertfx-input::placeholder { color: rgba(156,163,175,0.3); }
        .expertfx-input:focus {
          border-color: rgba(239,68,68,0.5);
          background: rgba(26,28,42,0.8);
          box-shadow: 0 0 30px rgba(239,68,68,0.06), inset 0 0 30px rgba(239,68,68,0.02);
        }
        .expertfx-input:hover {
          border-color: rgba(239,68,68,0.3);
        }

        .expertfx-input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(239,68,68,0.4);
          pointer-events: none;
          transition: all 0.3s ease;
        }
        .expertfx-input-wrapper:focus-within .expertfx-input-icon {
          color: #ef4444;
        }

        .expertfx-submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: #fff;
          font-family: 'Exo 2', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 40px rgba(239,68,68,0.25), 0 4px 20px rgba(239,68,68,0.15);
          transition: all 0.3s ease;
        }
        .expertfx-submit-btn::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%);
          animation: btnShine 3s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes btnShine {
          0%, 100% { transform: translate(-20%, -20%); }
          50% { transform: translate(20%, 20%); }
        }
        .expertfx-submit-btn:hover:not(:disabled) {
          box-shadow: 0 0 60px rgba(239,68,68,0.4), 0 4px 30px rgba(239,68,68,0.3);
          transform: translateY(-2px);
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        .expertfx-submit-btn:active:not(:disabled) {
          transform: translateY(0px) scale(0.98);
        }
        .expertfx-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .expertfx-forgot {
          color: #fca5a5;
          font-size: 13px;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
        }
        .expertfx-forgot::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: #fca5a5;
          transition: width 0.3s ease;
        }
        .expertfx-forgot:hover::after {
          width: 100%;
        }
        .expertfx-forgot:hover { color: #f3f4f6; }

        .expertfx-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(156,163,175,0.5);
          margin-bottom: 8px;
          transition: color 0.3s ease;
        }
        .expertfx-input-wrapper:focus-within .expertfx-label {
          color: rgba(252,165,165,0.8);
        }

        .expertfx-error {
          padding: 12px 16px;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          color: #fca5a5;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          margin-bottom: 1.5rem;
          animation: shake 0.5s ease;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }

        .expertfx-stats-row {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(239,68,68,0.1);
        }
        .expertfx-stat-item {
          transition: all 0.3s ease;
        }
        .expertfx-stat-item:hover {
          transform: translateY(-3px);
        }
        .expertfx-stat-num {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #ef4444;
          text-shadow: 0 0 20px rgba(239,68,68,0.3);
          transition: all 0.3s ease;
        }
        .expertfx-stat-item:hover .expertfx-stat-num {
          text-shadow: 0 0 40px rgba(239,68,68,0.5);
        }
        .expertfx-stat-lbl {
          font-size: 10px;
          letter-spacing: 0.08em;
          color: rgba(156,163,175,0.4);
          margin-top: 4px;
          text-transform: uppercase;
        }

        .expertfx-features {
          display: flex;
          gap: 1.5rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
        .expertfx-feature {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(156,163,175,0.5);
          font-weight: 500;
          letter-spacing: 0.05em;
          transition: all 0.3s ease;
        }
        .expertfx-feature:hover {
          color: rgba(252,165,165,0.8);
        }
        .expertfx-feature svg {
          width: 14px;
          height: 14px;
          color: rgba(239,68,68,0.4);
        }

        .expertfx-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(239,68,68,0.15), transparent);
          margin: 0.25rem 0;
        }

        .expertfx-brand-icon {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          font-size: 1.2rem;
          color: #f3f4f6;
          letter-spacing: -0.02em;
        }
        .expertfx-brand-icon span {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Mobile responsiveness improvements */
        @media (max-width: 1024px) {
          .expertfx-brand-name {
            font-size: 2.8rem;
          }
          .expertfx-typewriter {
            font-size: 1.1rem;
          }
        }
        @media (max-width: 640px) {
          .expertfx-brand-name {
            font-size: 2.2rem;
          }
          .expertfx-typewriter {
            font-size: 1rem;
          }
          .expertfx-stats-row {
            gap: 1rem;
          }
          .expertfx-stat-num {
            font-size: 1.1rem;
          }
        }
      `}</style>

      <div className="expertfx-login-root h-screen w-screen flex overflow-hidden relative expertfx-bg">
        {/* Background Effects */}
        <div className="expertfx-stripes" />
        <div className="expertfx-grid-bg" />
        <div className="expertfx-glow-1" />
        <div className="expertfx-glow-2" />
        <div className="expertfx-shine" />
        <div className="expertfx-orb-red" />
        <div className="expertfx-orb-gold" />
        <div className="expertfx-orb-blue" />
        <div className="expertfx-tri-tl" />
        <div className="expertfx-tri-tl-inner" />
        <div className="expertfx-tri-br" />

        {/* ─── LEFT PANEL ─── */}
        <div
          className={`hidden lg:flex lg:w-1/2 relative overflow-hidden transition-all duration-700 ease-in-out ${
            isSwapped ? "lg:translate-x-full" : "lg:translate-x-0"
          }`}
          style={{ zIndex: isSwapped ? 10 : 1 }}
        >
          <div className="absolute inset-0">
            <img
              src="/images/login.png"
              alt="Background"
              className="w-full h-full object-cover"
              style={{ opacity: 0.15, mixBlendMode: "luminosity" }}
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(7,11,21,0.95) 0%, rgba(26,28,42,0.3) 60%, transparent 100%)",
            }}
          />

          <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
            <div>
              <div className="expertfx-tagline-badge">
                <span className="expertfx-dot" />
                <span>14 Years of Excellence</span>
                <Sparkles size={12} className="text-red-400/60" />
              </div>
              <div className="expertfx-brand-name">
                <span className="expertfx-brand-line1">EXPERT</span>
                <span className="expertfx-brand-line2">FX</span>
              </div>
            </div>

            <div>
              <div className="expertfx-typewriter">
                {currentText}
                <span className="expertfx-cursor">|</span>
              </div>
              <p
                style={{
                  color: "rgba(156,163,175,0.5)",
                  fontSize: "14px",
                  marginTop: "12px",
                  lineHeight: "1.8",
                  maxWidth: "380px",
                }}
              >
                Professional trading platform with{" "}
                <span style={{ color: "#fca5a5", fontWeight: 600 }}>
                  institutional execution
                </span>
                , advanced analytics, and real-time market data.
              </p>

              <div className="expertfx-features">
                <div className="expertfx-feature">
                  <Zap size={14} />
                  <span>Lightning Execution</span>
                </div>
                <div className="expertfx-feature">
                  <Shield size={14} />
                  <span>Institutional Security</span>
                </div>
                <div className="expertfx-feature">
                  <BarChart3 size={14} />
                  <span>Advanced Analytics</span>
                </div>
              </div>

              <div className="expertfx-stats-row">
                {[
                  { num: "$2.5B+", lbl: "Assets Managed" },
                  { num: "15K+", lbl: "Active Traders" },
                  { num: "99.9%", lbl: "Uptime" },
                ].map((s) => (
                  <div key={s.lbl} className="expertfx-stat-item">
                    <div className="expertfx-stat-num">{s.num}</div>
                    <div className="expertfx-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL — FORM ─── */}
        <div
          className={`w-full lg:w-1/2 expertfx-form-panel flex flex-col justify-center overflow-y-auto transition-all duration-700 ease-in-out ${
            isSwapped ? "lg:-translate-x-full" : "lg:translate-x-0"
          }`}
          style={{ zIndex: isSwapped ? 1 : 10, position: "relative" }}
        >
          <div
            style={{
              maxWidth: "440px",
              width: "100%",
              margin: "0 auto",
              padding: "2.5rem 2rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div style={{ marginBottom: "2.5rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "6px 16px",
                  borderRadius: "100px",
                  border: "1px solid rgba(239,68,68,0.2)",
                  background: "rgba(239,68,68,0.05)",
                  color: "#fca5a5",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "1.25rem",
                }}
              >
                <span className="expertfx-dot" style={{ width: 5, height: 5 }} />
                Trading Portal
              </div>

              <h1
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 900,
                  fontSize: "2.8rem",
                  lineHeight: 1,
                  marginBottom: "0.5rem",
                  background: "linear-gradient(135deg, #f3f4f6 0%, #fca5a5 50%, #e5e7eb 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Welcome Back
              </h1>
              <p style={{ color: "rgba(156,163,175,0.4)", fontSize: "14px", fontWeight: 400 }}>
                Enter your credentials to access your trading dashboard
              </p>
            </div>

            {error && (
              <div className="expertfx-error">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label className="expertfx-label">User Code / Mobile / Email</label>
                <div className="expertfx-input-wrapper">
                  <KeyRound size={18} className="expertfx-input-icon" />
                  <input
                    type="text"
                    value={userCode}
                    onChange={handleUserCodeChange}
                    className="expertfx-input"
                    placeholder="e.g. EXPERT001, mobile, or email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="expertfx-label">Password</label>
                <div className="expertfx-input-wrapper">
                  <Lock size={18} className="expertfx-input-icon" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="expertfx-input"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <Link href="/Secretkey">
                  <button type="button" className="expertfx-forgot">Forgot Password?</button>
                </Link>
              </div>

              <div className="expertfx-divider" />

              <button
                type="submit"
                disabled={loading}
                className="expertfx-submit-btn"
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Authenticating...
                  </span>
                ) : (
                  "Sign In →"
                )}
              </button>

              <p
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  color: "rgba(156,163,175,0.3)",
                  marginTop: "0.5rem",
                  letterSpacing: "0.05em",
                }}
              >
                Powered by{" "}
                <span style={{ color: "#fca5a5", fontWeight: 700, letterSpacing: "0.1em" }}>
                  EXPERTFX
                </span>
              </p>
            </form>
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  );
}