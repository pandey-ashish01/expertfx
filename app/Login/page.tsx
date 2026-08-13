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

        .expartfx-login-root {
          font-family: 'Exo 2', sans-serif;
        }

        .expartfx-bg {
          background: #070b15;
          position: relative;
        }
        .expartfx-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 120% 100% at 20% 50%, #1a1a2e 0%, #0f1117 50%, #070b15 100%);
        }
        
        .expartfx-glow-1 {
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
        
        .expartfx-glow-2 {
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

        .expartfx-stripes {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            -55deg, transparent, transparent 6px,
            rgba(255,255,255,0.008) 6px, rgba(255,255,255,0.008) 7px
          );
          pointer-events: none;
        }
        
        .expartfx-grid-bg {
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

        .expartfx-shine {
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

        .expartfx-tri-tl {
          position: absolute;
          top: 0; left: 0;
          width: 0; height: 0;
          border-style: solid;
          border-width: 280px 220px 0 0;
          border-color: rgba(220,38,38,0.3) transparent transparent transparent;
          pointer-events: none;
        }
        .expartfx-tri-tl-inner {
          position: absolute;
          top: 10px; left: 10px;
          width: 0; height: 0;
          border-style: solid;
          border-width: 160px 125px 0 0;
          border-color: rgba(239,68,68,0.2) transparent transparent transparent;
          pointer-events: none;
        }
        .expartfx-tri-br {
          position: absolute;
          bottom: 0; right: 0;
          width: 0; height: 0;
          border-style: solid;
          border-width: 0 0 220px 180px;
          border-color: transparent transparent rgba(185,28,28,0.2) transparent;
          pointer-events: none;
        }

        .expartfx-orb-red {
          position: absolute;
          width: 450px; height: 450px;
          top: -100px; left: -80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 40%, transparent 70%);
          pointer-events: none;
          animation: orbPulse 6s ease-in-out infinite;
          filter: blur(40px);
        }
        .expartfx-orb-gold {
          position: absolute;
          width: 350px; height: 350px;
          bottom: -60px; right: 5%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%);
          pointer-events: none;
          animation: orbPulse 8s ease-in-out infinite 1.5s;
          filter: blur(40px);
        }
        .expartfx-orb-blue {
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

        .expartfx-brand-name {
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          font-size: 3.5rem;
          line-height: 0.9;
          letter-spacing: -0.03em;
          position: relative;
        }
        .expartfx-brand-line1 {
          display: block;
          color: #f3f4f6;
          text-shadow: 0 0 60px rgba(239,68,68,0.2), 0 0 120px rgba(239,68,68,0.1);
        }
        .expartfx-brand-line2 {
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

        .expartfx-tagline-badge {
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
        .expartfx-tagline-badge:hover {
          border-color: rgba(239,68,68,0.6);
          background: rgba(239,68,68,0.15);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(239,68,68,0.1);
        }
        
        .expartfx-dot {
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

        .expartfx-typewriter {
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
        .expartfx-cursor {
          -webkit-text-fill-color: #ef4444;
          color: #ef4444;
          animation: blink 0.8s step-end infinite;
          font-weight: 900;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        .expartfx-form-panel {
          background: rgba(7,11,21,0.92);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(239,68,68,0.08);
        }

        .expartfx-input-wrapper {
          position: relative;
          transition: all 0.3s ease;
        }
        .expartfx-input-wrapper:focus-within {
          transform: translateY(-1px);
        }

        .expartfx-input {
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
        .expartfx-input::placeholder { color: rgba(156,163,175,0.3); }
        .expartfx-input:focus {
          border-color: rgba(239,68,68,0.5);
          background: rgba(26,28,42,0.8);
          box-shadow: 0 0 30px rgba(239,68,68,0.06), inset 0 0 30px rgba(239,68,68,0.02);
        }
        .expartfx-input:hover {
          border-color: rgba(239,68,68,0.3);
        }

        .expartfx-input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(239,68,68,0.4);
          pointer-events: none;
          transition: all 0.3s ease;
        }
        .expartfx-input-wrapper:focus-within .expartfx-input-icon {
          color: #ef4444;
        }

        .expartfx-submit-btn {
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
        .expartfx-submit-btn::before {
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
        .expartfx-submit-btn:hover:not(:disabled) {
          box-shadow: 0 0 60px rgba(239,68,68,0.4), 0 4px 30px rgba(239,68,68,0.3);
          transform: translateY(-2px);
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        .expartfx-submit-btn:active:not(:disabled) {
          transform: translateY(0px) scale(0.98);
        }
        .expartfx-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .expartfx-forgot {
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
        .expartfx-forgot::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: #fca5a5;
          transition: width 0.3s ease;
        }
        .expartfx-forgot:hover::after {
          width: 100%;
        }
        .expartfx-forgot:hover { color: #f3f4f6; }

        .expartfx-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(156,163,175,0.5);
          margin-bottom: 8px;
          transition: color 0.3s ease;
        }
        .expartfx-input-wrapper:focus-within .expartfx-label {
          color: rgba(252,165,165,0.8);
        }

        .expartfx-error {
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

        .expartfx-stats-row {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(239,68,68,0.1);
        }
        .expartfx-stat-item {
          transition: all 0.3s ease;
        }
        .expartfx-stat-item:hover {
          transform: translateY(-3px);
        }
        .expartfx-stat-num {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #ef4444;
          text-shadow: 0 0 20px rgba(239,68,68,0.3);
          transition: all 0.3s ease;
        }
        .expartfx-stat-item:hover .expartfx-stat-num {
          text-shadow: 0 0 40px rgba(239,68,68,0.5);
        }
        .expartfx-stat-lbl {
          font-size: 10px;
          letter-spacing: 0.08em;
          color: rgba(156,163,175,0.4);
          margin-top: 4px;
          text-transform: uppercase;
        }

        .expartfx-features {
          display: flex;
          gap: 1.5rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
        .expartfx-feature {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(156,163,175,0.5);
          font-weight: 500;
          letter-spacing: 0.05em;
          transition: all 0.3s ease;
        }
        .expartfx-feature:hover {
          color: rgba(252,165,165,0.8);
        }
        .expartfx-feature svg {
          width: 14px;
          height: 14px;
          color: rgba(239,68,68,0.4);
        }

        .expartfx-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(239,68,68,0.15), transparent);
          margin: 0.25rem 0;
        }

        .expartfx-brand-icon {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          font-size: 1.2rem;
          color: #f3f4f6;
          letter-spacing: -0.02em;
        }
        .expartfx-brand-icon span {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Mobile responsiveness improvements */
        @media (max-width: 1024px) {
          .expartfx-brand-name {
            font-size: 2.8rem;
          }
          .expartfx-typewriter {
            font-size: 1.1rem;
          }
        }
        @media (max-width: 640px) {
          .expartfx-brand-name {
            font-size: 2.2rem;
          }
          .expartfx-typewriter {
            font-size: 1rem;
          }
          .expartfx-stats-row {
            gap: 1rem;
          }
          .expartfx-stat-num {
            font-size: 1.1rem;
          }
        }
      `}</style>

      <div className="expartfx-login-root h-screen w-screen flex overflow-hidden relative expartfx-bg">
        {/* Background Effects */}
        <div className="expartfx-stripes" />
        <div className="expartfx-grid-bg" />
        <div className="expartfx-glow-1" />
        <div className="expartfx-glow-2" />
        <div className="expartfx-shine" />
        <div className="expartfx-orb-red" />
        <div className="expartfx-orb-gold" />
        <div className="expartfx-orb-blue" />
        <div className="expartfx-tri-tl" />
        <div className="expartfx-tri-tl-inner" />
        <div className="expartfx-tri-br" />

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
              alt="EXPARTFX Background"
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
              <div className="expartfx-tagline-badge">
                <span className="expartfx-dot" />
                <span>14 Years of Excellence</span>
                <Sparkles size={12} className="text-red-400/60" />
              </div>
              <div className="expartfx-brand-name">
                <span className="expartfx-brand-line1">EXPART</span>
                <span className="expartfx-brand-line2">FX</span>
              </div>
            </div>

            <div>
              <div className="expartfx-typewriter">
                {currentText}
                <span className="expartfx-cursor">|</span>
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

              <div className="expartfx-features">
                <div className="expartfx-feature">
                  <Zap size={14} />
                  <span>Lightning Execution</span>
                </div>
                <div className="expartfx-feature">
                  <Shield size={14} />
                  <span>Institutional Security</span>
                </div>
                <div className="expartfx-feature">
                  <BarChart3 size={14} />
                  <span>Advanced Analytics</span>
                </div>
              </div>

              <div className="expartfx-stats-row">
                {[
                  { num: "$2.5B+", lbl: "Assets Managed" },
                  { num: "15K+", lbl: "Active Traders" },
                  { num: "99.9%", lbl: "Uptime" },
                ].map((s) => (
                  <div key={s.lbl} className="expartfx-stat-item">
                    <div className="expartfx-stat-num">{s.num}</div>
                    <div className="expartfx-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT PANEL — FORM ─── */}
        <div
          className={`w-full lg:w-1/2 expartfx-form-panel flex flex-col justify-center overflow-y-auto transition-all duration-700 ease-in-out ${
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
                <span className="expartfx-dot" style={{ width: 5, height: 5 }} />
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
              <div className="expartfx-error">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label className="expartfx-label">User Code / Mobile / Email</label>
                <div className="expartfx-input-wrapper">
                  <KeyRound size={18} className="expartfx-input-icon" />
                  <input
                    type="text"
                    value={userCode}
                    onChange={handleUserCodeChange}
                    className="expartfx-input"
                    placeholder="e.g. EFX001, mobile, or email"   // ← अपडेटेड placeholder
                    required
                  />
                </div>
              </div>

              <div>
                <label className="expartfx-label">Password</label>
                <div className="expartfx-input-wrapper">
                  <Lock size={18} className="expartfx-input-icon" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="expartfx-input"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <Link href="/Secretkey">
                  <button type="button" className="expartfx-forgot">Forgot Password?</button>
                </Link>
              </div>

              <div className="expartfx-divider" />

              <button
                type="submit"
                disabled={loading}
                className="expartfx-submit-btn"
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
                  EXPARTFX
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