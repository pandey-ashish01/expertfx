"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2, UserPlus, Phone, AlertCircle,
  CheckCircle, Mail, User, Copy,
  AlertTriangle, Lock, ShieldCheck, ArrowRight, Clock,
} from "lucide-react";

interface ReferrerInfo { name: string; userCode: string }
interface SuccessData  { userCode: string; name: string }

const TICKER = [
  { pair: "EUR/USD", px: "1.08421", up: true  },
  { pair: "GBP/USD", px: "1.27339", up: false },
  { pair: "USD/JPY", px: "156.204", up: true  },
  { pair: "AUD/USD", px: "0.65124", up: false },
  { pair: "USD/CHF", px: "0.88431", up: true  },
  { pair: "NZD/USD", px: "0.58903", up: false },
  { pair: "USD/CAD", px: "1.37652", up: true  },
  { pair: "EUR/GBP", px: "0.85117", up: false },
  { pair: "EUR/JPY", px: "169.381", up: true  },
  { pair: "XAU/USD", px: "2418.60", up: true  },
];

export default function JoinReferralForm() {
  const [loading,       setLoading]       = useState(false);
  const [validating,    setValidating]    = useState(true);
  const [referralToken, setReferralToken] = useState("");
  const [referrerInfo,  setReferrerInfo]  = useState<ReferrerInfo | null>(null);
  const [successData,   setSuccessData]   = useState<SuccessData  | null>(null);
  const [copiedId,      setCopiedId]      = useState(false);
  const [copiedPwd,     setCopiedPwd]     = useState(false);
  const [error,         setError]         = useState("");
  const [form, setForm] = useState({ name: "", mobile: "", email: "" });

  const DEFAULT_PASSWORD = "123456";

  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (!params?.referralToken) { setValidating(false); return; }
      const token = params.referralToken as string;
      setReferralToken(token);
      try {
        const res  = await fetch(`/api/users/referrer/${token}`);
        const data = await res.json();
        if (data.success) setReferrerInfo(data.data);
      } catch {}
      setValidating(false);
    })();
  }, [params]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    if (!form.name.trim())
      return "Full name is required.";
    if (!/^\d{10}$/.test(form.mobile))
      return "Please enter a valid 10-digit mobile number.";
    if (!form.email.trim())
      return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email address.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    try {
      const res  = await fetch(`/api/join/${referralToken}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessData({ userCode: data.data.userCode, name: data.data.name });
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyId = () => {
    if (!successData?.userCode) return;
    navigator.clipboard.writeText(successData.userCode);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(DEFAULT_PASSWORD);
    setCopiedPwd(true);
    setTimeout(() => setCopiedPwd(false), 2000);
  };

  // ── Validating ─────────────────────────────────────────────────────────────
  if (validating) return (
    <Shell>
      <div className="efx-panel efx-bracketed" style={{ padding: "2.5rem 1.5rem", textAlign: "center" }}>
        <div className="efx-spinner" />
        <p className="efx-eyebrow" style={{ marginTop: "1.25rem" }}>Verifying referral link</p>
      </div>
    </Shell>
  );

  // ── Invalid link ───────────────────────────────────────────────────────────
  if (!referralToken) return (
    <Shell>
      <div className="efx-panel efx-bracketed" style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
        <div className="efx-icon-badge efx-icon-badge--red">
          <AlertCircle size={22} />
        </div>
        <p className="efx-h2" style={{ marginTop: "1.1rem" }}>Link not recognized</p>
        <p className="efx-body-dim" style={{ marginTop: "0.35rem" }}>
          This referral link is invalid or has expired. Ask your referrer to resend it.
        </p>
        <a href="/login" className="efx-btn efx-btn--primary" style={{ marginTop: "1.75rem" }}>
          Go to login <ArrowRight size={15} />
        </a>
      </div>
    </Shell>
  );

  // ── Success screen (ticket) ─────────────────────────────────────────────────
  if (successData) return (
    <Shell>
      <div className="efx-panel efx-bracketed efx-ticket">
        <div className="efx-ticket-head">
          <div className="efx-icon-badge efx-icon-badge--green">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="efx-h2">Account confirmed</p>
            <p className="efx-body-dim">
              Welcome aboard, {successData.name.split(" ")[0]}.
            </p>
          </div>
        </div>

        <div className="efx-perforation" />

        <div className="efx-ticket-body">
          <p className="efx-eyebrow">Access credentials</p>

          <div className="efx-credential efx-credential--gold">
            <div className="efx-credential-top">
              <span><User size={12} /> User ID · Login ID · Referral ID</span>
              <button onClick={copyId} className="efx-copy">
                <Copy size={12} /> {copiedId ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="efx-mono-lg">{successData.userCode}</p>
          </div>

          <div className="efx-credential efx-credential--green">
            <div className="efx-credential-top">
              <span><Lock size={12} /> Temporary password</span>
              <button onClick={copyPassword} className="efx-copy">
                <Copy size={12} /> {copiedPwd ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="efx-mono-lg">{DEFAULT_PASSWORD}</p>
            <p className="efx-fine-print">Change this from Settings after your first login.</p>
          </div>
        </div>

        <div className="efx-perforation" />

        <div className="efx-ticket-body" style={{ gap: "0.6rem" }}>
          <div className="efx-notice efx-notice--red">
            <AlertTriangle size={15} />
            <p>Save your User ID now — it cannot be recovered later if lost.</p>
          </div>

          <button onClick={copyId} className="efx-btn efx-btn--primary" style={{ width: "100%" }}>
            <Copy size={15} /> Copy User ID
          </button>
          <button onClick={() => router.push("/login")} className="efx-btn efx-btn--ghost" style={{ width: "100%" }}>
            Proceed to login <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </Shell>
  );

  // ── Registration form ────────────────────────────────────────────────────────
  return (
    <Shell>
      <div className="efx-panel efx-bracketed">
        <div className="efx-form-head">
          <p className="efx-eyebrow">New account · Referred access</p>
          <p className="efx-h2">Open your trading account</p>
        </div>

        {referrerInfo && (
          <div className="efx-referrer">
            <div className="efx-referrer-avatar">{referrerInfo.name.charAt(0).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <p className="efx-fine-print" style={{ margin: 0 }}>Referred by</p>
              <p className="efx-body" style={{ margin: 0, fontWeight: 600 }}>{referrerInfo.name}</p>
            </div>
            <span className="efx-mono-tag">{referrerInfo.userCode}</span>
          </div>
        )}

        {error && (
          <div className="efx-notice efx-notice--red" style={{ marginTop: "1.1rem" }}>
            <AlertCircle size={15} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="efx-form">
          <Field label="Full name">
            <User className="efx-input-icon" size={15} />
            <input
              className="efx-input"
              placeholder="As per your ID"
              value={form.name}
              onChange={set("name")}
              required
            />
          </Field>

          <Field label="Mobile">
            <Phone className="efx-input-icon" size={15} />
            <input
              className="efx-input efx-mono-input"
              placeholder="10-digit number"
              type="tel"
              maxLength={10}
              value={form.mobile}
              onChange={set("mobile")}
              required
            />
          </Field>

          <Field label="Email address">
            <Mail className="efx-input-icon" size={15} />
            <input
              className="efx-input"
              placeholder="you@domain.com"
              type="email"
              value={form.email}
              onChange={set("email")}
              required
            />
          </Field>

          <div className="efx-soon">
            <Clock size={12} />
            <span>PAN verification — coming soon</span>
          </div>

          <div className="efx-info-box">
            <div className="efx-info-row">
              <span className="efx-dot efx-dot--gold" />
              <p><strong>User ID</strong> — permanent login &amp; referral code</p>
            </div>
            <div className="efx-info-row">
              <span className="efx-dot efx-dot--green" />
              <p><strong>Password</strong> — <span className="efx-mono-inline">123456</span>, change after first login</p>
            </div>
          </div>

          <button type="submit" disabled={loading} className="efx-btn efx-btn--primary" style={{ width: "100%", marginTop: "0.35rem" }}>
            {loading
              ? <><Loader2 size={15} className="efx-spin" /> Creating account…</>
              : <><UserPlus size={15} /> Create account</>
            }
          </button>
        </form>

        <p className="efx-footer-link">
          Already registered? <a href="/Login">Log in</a>
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const items = [...TICKER, ...TICKER];
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@800;900&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        :root {
          --efx-bg: #0a0c11;
          --efx-panel: #12151c;
          --efx-panel-2: #171b24;
          --efx-border: #242933;
          --efx-border-strong: #333b49;
          --efx-text: #e9ecf2;
          --efx-text-dim: #8892a0;
          --efx-text-faint: #4d5563;
          --efx-red: #ea4a52;
          --efx-red-dim: rgba(234,74,82,0.12);
          --efx-green: #22c17d;
          --efx-green-dim: rgba(34,193,125,0.12);
          --efx-gold: #e6b23d;
          --efx-gold-dim: rgba(230,178,61,0.12);
        }

        .efx-root {
          font-family: 'Inter', sans-serif;
          background: var(--efx-bg);
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 34px 34px;
          min-height: 100vh;
          color: var(--efx-text);
        }

        /* ── Ticker tape ───────────────────────────────────────────────── */
        .efx-ticker {
          position: sticky;
          top: 0;
          z-index: 20;
          height: 34px;
          overflow: hidden;
          background: #08090d;
          border-bottom: 1px solid var(--efx-border);
        }
        .efx-ticker-track {
          display: flex;
          align-items: center;
          height: 100%;
          width: max-content;
          animation: efx-scroll 42s linear infinite;
        }
        @keyframes efx-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .efx-ticker-item {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
          padding: 0 18px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.02em;
          white-space: nowrap;
          border-right: 1px solid var(--efx-border);
          color: var(--efx-text-dim);
        }
        .efx-ticker-item b { color: var(--efx-text); font-weight: 600; }
        .efx-ticker-up   { color: var(--efx-green); }
        .efx-ticker-down { color: var(--efx-red); }

        /* ── Page shell ────────────────────────────────────────────────── */
        .efx-stage {
          min-height: calc(100vh - 34px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1.25rem;
        }
        .efx-col { width: 100%; max-width: 392px; }

        .efx-brandrow {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 1rem;
        }
        .efx-mark {
          width: 30px; height: 30px;
          border: 1px solid var(--efx-border-strong);
          display: flex; align-items: center; justify-content: center;
          color: var(--efx-red);
          flex-shrink: 0;
        }
        .efx-brand-word {
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          font-size: 0.92rem;
          letter-spacing: 0.02em;
          color: var(--efx-text);
        }
        .efx-brand-word em { font-style: normal; color: var(--efx-red); }
        .efx-brand-sub { font-size: 10.5px; color: var(--efx-text-faint); margin-top: 1px; }

        /* ── Bracketed terminal frame ─────────────────────────────────── */
        .efx-bracketed { position: relative; }
        .efx-bracketed::before, .efx-bracketed::after {
          content: '';
          position: absolute;
          width: 16px; height: 16px;
          pointer-events: none;
        }
        .efx-bracketed::before { top: -1px; left: -1px; border-top: 2px solid var(--efx-red); border-left: 2px solid var(--efx-red); }
        .efx-bracketed::after  { top: -1px; right: -1px; border-top: 2px solid var(--efx-red); border-right: 2px solid var(--efx-red); }

        .efx-panel {
          background: var(--efx-panel);
          border: 1px solid var(--efx-border);
        }

        .efx-eyebrow {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--efx-text-faint);
        }
        .efx-h2 {
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--efx-text);
          margin-top: 0.25rem;
        }
        .efx-body { font-size: 13px; color: var(--efx-text); }
        .efx-body-dim { font-size: 12.5px; color: var(--efx-text-dim); line-height: 1.55; }
        .efx-fine-print { font-size: 10.5px; color: var(--efx-text-faint); }

        .efx-form-head { padding: 1.35rem 1.35rem 0; }
        .efx-form { padding: 1rem 1.35rem 1.35rem; display: flex; flex-direction: column; gap: 0.7rem; }

        .efx-referrer {
          margin: 0.9rem 1.35rem 0;
          display: flex; align-items: center; gap: 9px;
          padding: 8px 10px;
          background: var(--efx-panel-2);
          border: 1px solid var(--efx-border);
        }
        .efx-referrer-avatar {
          width: 27px; height: 27px;
          background: var(--efx-gold-dim);
          color: var(--efx-gold);
          border: 1px solid rgba(230,178,61,0.3);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px; flex-shrink: 0;
        }
        .efx-mono-tag {
          margin-left: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--efx-gold);
          flex-shrink: 0;
        }

        .efx-field-label {
          display: block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--efx-text-faint);
          margin-bottom: 5px;
        }

        .efx-input-icon {
          position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
          color: var(--efx-text-faint);
          pointer-events: none;
        }
        .efx-input {
          width: 100%;
          background: #0d1016;
          border: 1px solid var(--efx-border);
          padding: 9px 11px 9px 34px;
          color: var(--efx-text);
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s ease, background 0.15s ease;
          box-sizing: border-box;
        }
        .efx-mono-input { font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em; }
        .efx-input::placeholder { color: var(--efx-text-faint); }
        .efx-input:focus { border-color: var(--efx-red); background: #0f1219; }
        .efx-input:hover { border-color: var(--efx-border-strong); }

        .efx-soon {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          padding: 4px 9px;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--efx-text-faint);
          background: var(--efx-panel-2);
          border: 1px dashed var(--efx-border-strong);
        }

        .efx-info-box {
          background: var(--efx-panel-2);
          border: 1px solid var(--efx-border);
          padding: 0.7rem 0.85rem;
          display: flex; flex-direction: column; gap: 0.4rem;
        }
        .efx-info-row { display: flex; align-items: flex-start; gap: 7px; }
        .efx-info-row p { font-size: 12px; color: var(--efx-text-dim); line-height: 1.5; margin: 0; }
        .efx-info-row strong { color: var(--efx-text); font-weight: 600; }
        .efx-dot { width: 5px; height: 5px; margin-top: 5px; flex-shrink: 0; border-radius: 1px; }
        .efx-dot--gold { background: var(--efx-gold); }
        .efx-dot--green { background: var(--efx-green); }
        .efx-mono-inline { font-family: 'JetBrains Mono', monospace; color: var(--efx-green); }

        .efx-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 18px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.01em;
          border: 1px solid transparent;
          cursor: pointer;
          text-decoration: none;
          transition: filter 0.15s ease, background 0.15s ease, border-color 0.15s ease;
        }
        .efx-btn--primary {
          background: var(--efx-red);
          color: #0a0c11;
        }
        .efx-btn--primary:hover:not(:disabled) { filter: brightness(1.1); }
        .efx-btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .efx-btn--ghost {
          background: transparent;
          border-color: var(--efx-border-strong);
          color: var(--efx-text-dim);
        }
        .efx-btn--ghost:hover { border-color: var(--efx-red); color: var(--efx-text); }

        .efx-footer-link {
          text-align: center;
          font-size: 12px;
          color: var(--efx-text-faint);
          padding: 0 1.35rem 1.35rem;
        }
        .efx-footer-link a { color: var(--efx-red); font-weight: 600; text-decoration: none; }
        .efx-footer-link a:hover { text-decoration: underline; }

        .efx-icon-badge {
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid;
          flex-shrink: 0;
        }
        .efx-icon-badge--red   { background: var(--efx-red-dim);   border-color: rgba(234,74,82,0.35);  color: var(--efx-red); margin: 0 auto; }
        .efx-icon-badge--green { background: var(--efx-green-dim); border-color: rgba(34,193,125,0.35); color: var(--efx-green); }

        .efx-notice {
          display: flex; align-items: flex-start; gap: 9px;
          padding: 10px 12px;
          background: var(--efx-red-dim);
          border: 1px solid rgba(234,74,82,0.3);
        }
        .efx-notice p { font-size: 12px; color: #f3b1b5; line-height: 1.5; margin: 0; }

        .efx-ticket-head {
          display: flex; align-items: center; gap: 11px;
          padding: 1.25rem 1.35rem 1.1rem;
        }
        .efx-perforation {
          position: relative;
          height: 1px;
          background: repeating-linear-gradient(90deg, var(--efx-border) 0 8px, transparent 8px 14px);
          margin: 0 1.35rem;
        }
        .efx-perforation::before, .efx-perforation::after {
          content: '';
          position: absolute; top: -6px;
          width: 12px; height: 12px;
          background: var(--efx-bg);
          border-radius: 50%;
        }
        .efx-perforation::before { left: -22px; }
        .efx-perforation::after  { right: -22px; }
        .efx-ticket-body { padding: 1.1rem 1.35rem; display: flex; flex-direction: column; gap: 0.65rem; }

        .efx-credential { border: 1px solid; padding: 0.65rem 0.85rem; }
        .efx-credential--gold  { background: var(--efx-gold-dim);  border-color: rgba(230,178,61,0.3); }
        .efx-credential--green { background: var(--efx-green-dim); border-color: rgba(34,193,125,0.3); }
        .efx-credential-top {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase;
          margin-bottom: 6px;
        }
        .efx-credential--gold .efx-credential-top  { color: rgba(230,178,61,0.85); }
        .efx-credential--green .efx-credential-top { color: rgba(34,193,125,0.85); }
        .efx-credential-top span { display: inline-flex; align-items: center; gap: 6px; }
        .efx-copy {
          display: inline-flex; align-items: center; gap: 4px;
          background: none; border: none; cursor: pointer;
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
          color: inherit; opacity: 0.75;
        }
        .efx-copy:hover { opacity: 1; }
        .efx-mono-lg {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.45rem; font-weight: 700; letter-spacing: 0.03em;
          color: var(--efx-text);
        }
        .efx-credential--gold .efx-mono-lg  { color: var(--efx-gold); }
        .efx-credential--green .efx-mono-lg { color: var(--efx-green); }

        .efx-spinner {
          width: 30px; height: 30px;
          border: 2px solid var(--efx-border);
          border-top-color: var(--efx-red);
          border-radius: 50%;
          margin: 0 auto;
          animation: efx-spin 0.7s linear infinite;
        }
        .efx-spin { animation: efx-spin 0.7s linear infinite; }
        @keyframes efx-spin { to { transform: rotate(360deg); } }

        @media (max-width: 420px) {
          .efx-form-head, .efx-form, .efx-footer-link, .efx-ticket-head, .efx-ticket-body { padding-left: 1.05rem; padding-right: 1.05rem; }
          .efx-referrer { margin-left: 1.05rem; margin-right: 1.05rem; }
          .efx-perforation { margin: 0 1.05rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .efx-ticker-track { animation: none; }
        }
      `}</style>

      <div className="efx-root">
        <div className="efx-ticker" aria-hidden="true">
          <div className="efx-ticker-track">
            {items.map((t, i) => (
              <span className="efx-ticker-item" key={i}>
                <b>{t.pair}</b> {t.px}
                <span className={t.up ? "efx-ticker-up" : "efx-ticker-down"}>{t.up ? "▲" : "▼"}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="efx-stage">
          <div className="efx-col">
            <div className="efx-brandrow">
              <div className="efx-mark"><ShieldCheck size={17} /></div>
              <div>
                {/* ब्रांड नाम अब EXPARTFX है */}
                <p className="efx-brand-word">EXPART<em>FX</em></p>
                <p className="efx-brand-sub">Referred account opening</p>
              </div>
            </div>

            {children}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="efx-field-label">{label}</label>
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}