"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

// ---------------------------
// Types and Data (unchanged)
// ---------------------------
type OfferKey = "copyTrading" | "login" | "openAccount";

type Offer = {
  label: string;
  image: string;
  badge: string;
  badgeDot: string;
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
  description: string;
  partnerLabel: string;
  partnerHint: string;
  ctaLabel: string;
  redirectUrl: string;
  footerNote: string;
};

const offers: Record<OfferKey, Offer> = {
  openAccount: {
    label: "Open Account",
    image: "/IMG_2576.png",
    badge: "Regulated Global Broker",
    badgeDot: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]",
    eyebrow: "Start Trading Today",
    headingLine1: "Open Your",
    headingLine2: "XM Account",
    description:
      "Join millions of traders worldwide with a fast, secure account setup and start your trading journey today.",
    partnerLabel: "Partner Code",
    partnerHint: "Use this code during registration",
    ctaLabel: "Open Account Now",
    redirectUrl: "https://affs.click/4VXlA",
    footerNote:
      "By continuing, you acknowledge that trading financial instruments involves significant risk.",
  },
  login: {
    label: "Login",
    image: "/IMG_2575.png",
    badge: "XM Client Portal",
    badgeDot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]",
    eyebrow: "Welcome Back",
    headingLine1: "Login to Your",
    headingLine2: "XM Account",
    description:
      "Access your XM client area securely and manage your trading account from one place.",
    partnerLabel: "Partner Code",
    partnerHint: "Your registered partner code",
    ctaLabel: "Login to XM",
    redirectUrl: "https://my.xm.com/member/login",
    footerNote: "You will be redirected to the official XM client login page.",
  },
  copyTrading: {
    label: "Copy Trading",
    image: "/IMG_2573.png",
    badge: "Smart Copy Trading",
    badgeDot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]",
    eyebrow: "Trade Smarter",
    headingLine1: "Join Smart",
    headingLine2: "Copy Trading",
    description:
      "Follow experienced traders and automatically copy their strategies with a simple, streamlined experience.",
    partnerLabel: "Partner Code",
    partnerHint: "Your partner reference",
    ctaLabel: "Join Copy Trading",
    redirectUrl: "https://social.tp-redirect.com/s/0mYnoB8R",
    footerNote:
      "Copy trading does not guarantee profits. Past performance does not guarantee future results.",
  },
};

const sectionOrder: OfferKey[] = ["openAccount", "login", "copyTrading"];

// ---------------------------
// Custom hook for scroll detection
// ---------------------------
function useScrollDetection(threshold = 50) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolled;
}

// ---------------------------
// Main Component
// ---------------------------
export default function ConnectBrokerPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isScrolled = useScrollDetection();
  const partnerCode = "X8BFK";

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(partnerCode);
  }, [partnerCode]);

  return (
    <div className="bg-[#0f1117] text-white min-h-screen antialiased">
      {/* ================= NAVBAR ================= */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#0f1117]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 group">
              <span className="font-bold text-xl tracking-tight text-white">
                XM<span className="text-red-500">Partner</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#open-account" className="text-[13px] text-slate-400 hover:text-white transition-colors">
                Open Account
              </a>
              <a href="#login" className="text-[13px] text-slate-400 hover:text-white transition-colors">
                Login
              </a>
              <a href="#copy-trading" className="text-[13px] text-slate-400 hover:text-white transition-colors">
                Copy Trading
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-5">
              <Link href="/Login" className="text-[13px] text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="#open-account"
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium text-[13px] rounded-[5px] transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-105 active:scale-95"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white p-2 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            mobileMenuOpen ? "max-h-96 bg-[#0f1117]/98 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20" : "max-h-0"
          }`}
        >
          <div className="px-5 py-6 space-y-1">
            {["open-account", "login", "copy-trading"].map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="block px-3 py-3 text-slate-400 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {id === "open-account" ? "Open Account" : id === "login" ? "Login" : "Copy Trading"}
              </a>
            ))}
            <div className="pt-4 flex gap-3">
              <Link
                href="/Login"
                className="flex-1 text-center px-4 py-3 border border-white/10 text-slate-400 text-sm rounded-[5px] hover:border-white/20 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="#open-account"
                className="flex-1 text-center px-4 py-3 bg-red-500 text-white font-medium text-sm rounded-[5px] shadow-lg shadow-red-500/20"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <div className="pt-16 sm:pt-20">
        {/* Page Heading */}
        <section className="py-12 sm:py-16 px-5 sm:px-6 lg:px-8 bg-[#0f1117]">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-xs tracking-[0.2em] uppercase text-red-400 mb-3 font-medium">XM Partner Offers</p>
            <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl mb-4 text-white">
              Choose Your Path to Trading
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Exclusive partner benefits with code <span className="text-white font-semibold">{partnerCode}</span>.
              Whether you're new or experienced, we've got you covered.
            </p>
          </div>
        </section>

        {/* Offer Sections Stacked */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 space-y-8 sm:space-y-12">
          {sectionOrder.map((key) => {
            const offer = offers[key];
            return (
              <section key={key} id={key} className="scroll-mt-24">
                <div className="bg-[#1a1d25] border border-[#2a2d35] rounded-[5px] overflow-hidden transition-all duration-300 hover:border-red-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-500/5
                  shadow-[0_8px_30px_rgba(0,0,0,0.3)] sm:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                  {/* Image Banner */}
                  <div className="relative h-52 sm:h-72 lg:h-80 w-full overflow-hidden">
                    <Image
                      src={offer.image}
                      alt={offer.label}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 80vw"
                      className="object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d25] via-[#1a1d25]/40 to-transparent" />

                    {/* Badge */}
                    <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 backdrop-blur-md shadow-lg shadow-black/20">
                        <span className={`h-2 w-2 rounded-full ${offer.badgeDot}`} />
                        <span className="text-xs font-medium text-white/80">{offer.badge}</span>
                      </div>
                    </div>

                    {/* Heading overlay */}
                    <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-400 mb-1">
                        {offer.eyebrow}
                      </p>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                        {offer.headingLine1}{" "}
                        <span className="text-red-500">{offer.headingLine2}</span>
                      </h2>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6 lg:p-8">
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-5 sm:mb-6">
                      {offer.description}
                    </p>

                    {/* Partner Code */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-black/20 border border-[#2a2d35] rounded-[5px] p-4 mb-5 sm:mb-6 shadow-inner">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                          {offer.partnerLabel}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">{offer.partnerHint}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-[5px] border border-[#2a2d35] bg-[#0f1117] px-4 py-2.5 shadow-lg shadow-black/20">
                          <span className="font-mono text-base font-bold tracking-[0.15em] text-white">
                            {partnerCode}
                          </span>
                        </div>
                        <button
                          onClick={copyCode}
                          className="rounded-[5px] border border-[#2a2d35] bg-[#1a1d25] hover:bg-[#2a2d35] px-3 py-2 text-xs font-semibold text-slate-300 transition-colors shadow-lg shadow-black/20"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <a
                      href={offer.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-h-[52px] w-full items-center justify-center rounded-[5px] bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {offer.ctaLabel}
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>

                    {/* Risk note */}
                    <div className="mt-5 flex items-center justify-center gap-3 text-xs text-slate-500">
                      <span>18+</span>
                      <span className="h-1 w-1 rounded-full bg-slate-700" />
                      <span>Trading involves risk</span>
                    </div>

                    {/* Footer note */}
                    <p className="mt-4 text-center text-xs leading-relaxed text-slate-600">
                      {offer.footerNote}
                    </p>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/[0.06] bg-[#0f1117] shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand and description */}
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">
                  XM<span className="text-red-500">Partner</span>
                </span>
              </Link>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
                Your trusted partner for trading excellence.
              </p>
              <div className="flex items-center gap-2">
                {["X", "in", "YT", "TG"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="w-7 h-7 flex items-center justify-center rounded-[5px] bg-[#1a1d25] border border-[#2a2d35] text-slate-500 hover:text-white hover:border-red-500/30 transition-all text-[10px] font-bold shadow-md shadow-black/20"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Footer links */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-3">
                Platform
              </h4>
              <ul className="space-y-2">
                {["Web Terminal", "Mobile App", "API & Algo", "Desktop Suite"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-3">
                Company
              </h4>
              <ul className="space-y-2">
                {["About Us", "Careers", "Press", "Contact"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-3">
                Legal
              </h4>
              <ul className="space-y-2">
                {["Privacy Policy", "Terms of Use", "Risk Disclosure", "Complaints"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#2a2d35] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {["FCA Regulated", "ASIC Licensed", "CySEC Authorized", "256-bit SSL"].map((badge) => (
                <span
                  key={badge}
                  className="text-[10px] text-slate-500 bg-[#1a1d25] border border-[#2a2d35] rounded-[5px] px-2.5 py-1 flex items-center gap-1 shadow-sm shadow-black/20"
                >
                  <svg className="w-2.5 h-2.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {badge}
                </span>
              ))}
            </div>
            <span className="text-[10px] text-slate-600">© 2026 XM Partner. All rights reserved.</span>
          </div>

          <p className="text-[9px] text-slate-600/60 text-center mt-4 leading-relaxed max-w-3xl mx-auto">
            Trading CFDs and leveraged products carries a high level of risk. Past performance does not guarantee future
            results. Please ensure you fully understand the risks before trading.
          </p>
        </div>
      </footer>
    </div>
  );
}