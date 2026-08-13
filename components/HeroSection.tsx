"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import Image from "next/image";

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const STATS = [
  { num: "$2.5B+", label: "Assets Managed" },
  { num: "15K+", label: "Active Investors" },
  { num: "99.9%", label: "Uptime" },
] as const;

const CARDS = [
  {
    title: "Portfolio Management",
    desc: "Track and optimize your investments with real-time analytics and insights.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 16l4-8 4 4 4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Market Intelligence",
    desc: "AI-driven market predictions and trend analysis for smarter decisions.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Risk Assessment",
    desc: "Comprehensive risk profiling and automated portfolio rebalancing.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Wealth Planning",
    desc: "Personalized financial planning with tax optimization strategies.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 6v12M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
] as const;

const PARTNERS = [
  { name: "Goldman Sachs", logo: "GS", color: "#2D6A4F" },
  { name: "Morgan Stanley", logo: "MS", color: "#1A3A5C" },
  { name: "BlackRock", logo: "BLK", color: "#1A1A1A" },
  { name: "Vanguard", logo: "VG", color: "#0F4C81" },
  { name: "Fidelity", logo: "FID", color: "#2B4B7C" },
] as const;

const SERVICES = [
  {
    title: "Forex Trading",
    desc: "Access 60+ currency pairs with spreads from 0.0 pips and lightning-fast execution.",
    features: ["60+ Currency Pairs", "Spreads from 0.0 pips", "Leverage up to 1:500"],
    image: "/images/forex.jpg",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Stock CFDs",
    desc: "Trade shares of global companies without owning the underlying asset.",
    features: ["3000+ Global Stocks", "Fractional Shares", "Dividend Adjustments"],
    image: "/images/1893.jpg",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 16l4-8 4 4 4-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Crypto Trading",
    desc: "24/7 cryptocurrency trading with institutional-grade security.",
    features: ["50+ Crypto Pairs", "Cold Storage Security", "Instant Withdrawals"],
    image: "/images/stock_market_bg_vctr.jpg",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Commodities",
    desc: "Diversify with gold, oil, silver and agricultural commodities.",
    features: ["Spot & Futures", "Deep Liquidity", "Hedging Tools"],
    image: "/images/Commodities.jpg",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
] as const;

const TESTIMONIALS = [
  {
    name: "Taylor Mitchell",
    role: "Professional Trader",
    text: "ExpartFX transformed my trading experience. The execution speed and analytics are unmatched.",
    avatar: "/images/3911.jpg",
    rating: 5,
    company: "Independent",
  },
  {
    name: "Lsheone Chen",
    role: "Investment Manager",
    text: "The portfolio tools and risk assessment features have significantly improved our fund performance.",
    avatar: "/images/3911.jpg",
    rating: 5,
    company: "Chen Capital",
  },
  {
    name: "Sarah Okonkwo",
    role: "Independent Investor",
    text: "Started with $1000, now managing a six-figure portfolio. ExpartFX gave me the edge.",
    avatar: "/images/3911.jpg",
    rating: 5,
    company: "Okonkwo Investments",
  },
] as const;

const NAV_ITEMS = ["Platform", "Markets", "Research", "Education", "About"] as const;

// Platform tabs: web / mobile / api / desktop
const PLATFORM_TABS = [
  {
    key: "web",
    label: "Web Terminal",
    title: "Trade from any browser, zero install",
    desc: "A full institutional terminal that runs entirely in-browser — charting, order routing, and portfolio tools load in under two seconds and sync instantly across every device you're signed into.",
    image: "/images/dashboard-preview.jpg",
    points: ["No download required", "Auto-saves layouts & watchlists", "Runs on any OS"],
  },
  {
    key: "mobile",
    label: "Mobile App",
    title: "Your desk, in your pocket",
    desc: "Place, modify, and close trades with the same execution engine as the desktop terminal. Push alerts fire the moment your price levels are hit, even with the app closed.",
    image: "/images/1893.jpg",
    points: ["Biometric login", "Real-time push alerts", "One-tap order execution"],
  },
  {
    key: "api",
    label: "API & Algo",
    title: "Build on top of the platform",
    desc: "A documented REST and WebSocket API for teams running systematic strategies — historical tick data, sub-50ms order acknowledgement, and sandbox keys issued instantly.",
    image: "/images/stock_market_bg_vctr.jpg",
    points: ["REST + WebSocket streams", "Free sandbox environment", "Python & Node SDKs"],
  },
  {
    key: "desktop",
    label: "Desktop Suite",
    title: "Built for multi-monitor workflows",
    desc: "A native Windows and macOS application with detachable chart windows, hotkey trading, and Level II depth-of-market panels for traders running four screens or more.",
    image: "/images/Commodities.jpg",
    points: ["Detachable multi-chart layout", "Hotkey order entry", "Level II market depth"],
  },
] as const;

const EDUCATION_RESOURCES = [
  {
    title: "Trading Academy",
    level: "Beginner",
    desc: "Self-paced video course covering order types, leverage, and risk management fundamentals — 6 modules, certificate on completion.",
    meta: "6 modules · 3h 20m",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3L2 8l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 10v6c0 1.5 2.7 3 6 3s6-1.5 6-3v-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Live Webinars",
    level: "All levels",
    desc: "Weekly sessions with senior market analysts breaking down live charts, macro events, and Q&A on your open positions.",
    meta: "Every Thursday · 5pm IST",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.7"/>
        <path d="M9 21h6M12 17v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Market Analysis",
    level: "Intermediate",
    desc: "Daily written briefings and technical setups across forex, indices, and crypto from our in-house research desk.",
    meta: "Published daily",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 19h16M6 19V9m6 10V5m6 14v-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Strategy Guides",
    level: "Advanced",
    desc: "Downloadable playbooks on hedging, scalping, and swing strategies, with backtested entry and exit criteria.",
    meta: "24 guides · PDF & video",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 4h11l5 5v11a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 13h6M9 17h6M9 9h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    ),
  },
] as const;

const FOOTER_COLUMNS = [
  {
    heading: "Platform",
    links: ["Web Terminal", "Mobile App", "API & Algo Trading", "Desktop Suite", "System Status"],
  },
  {
    heading: "Markets",
    links: ["Forex", "Stock CFDs", "Crypto", "Commodities", "Indices"],
  },
  {
    heading: "Education",
    links: ["Trading Academy", "Webinars", "Market Analysis", "Strategy Guides", "Glossary"],
  },
  {
    heading: "Company",
    links: ["About Us", "Careers", "Press", "Partners", "Contact"],
  },
  {
    heading: "Legal",
    links: ["Terms of Service", "Privacy Policy", "Risk Disclosure", "AML Policy", "Regulatory Info"],
  },
] as const;

const SOCIAL_LINKS = [
  {
    name: "X",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.15 1.45-2.15 2.94v5.66H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.35-1.85 3.59 0 4.25 2.36 4.25 5.44zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56z"/>
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23 12s0-3.6-.46-5.31a2.9 2.9 0 00-2.05-2.05C18.78 4.18 12 4.18 12 4.18s-6.78 0-8.49.46A2.9 2.9 0 001.46 6.7C1 8.4 1 12 1 12s0 3.6.46 5.31a2.9 2.9 0 002.05 2.05c1.71.46 8.49.46 8.49.46s6.78 0 8.49-.46a2.9 2.9 0 002.05-2.05C23 15.6 23 12 23 12zM9.75 15.5v-7l6 3.5z"/>
      </svg>
    ),
  },
  {
    name: "Telegram",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.9 4.3L18.6 20c-.25 1.1-.9 1.37-1.83.86l-5.06-3.73-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.16 9.38-8.47c.41-.36-.09-.56-.63-.2L6.1 12.6l-5-1.56c-1.09-.34-1.1-1.09.23-1.61L20.5 3.02c.9-.34 1.7.2 1.4 1.28z"/>
      </svg>
    ),
  },
] as const;

// ============================================
// CUSTOM HOOKS
// ============================================

function useCounter(end: string | number, duration = 2000) {
  const [count, setCount] = useState<string | number>(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = performance.now();
    const numPart = typeof end === 'string' ? parseFloat(end.replace(/[^0-9.]/g, '')) : end;
    const suffix = typeof end === 'string' ? end.replace(/[0-9.]/g, '') : '';

    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = numPart * easeOut;

      if (typeof end === 'string') {
        setCount(Math.round(currentValue) + suffix);
      } else {
        setCount(Math.floor(currentValue));
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, end, duration]);

  return { count, elementRef };
}

function useScrollDetection(threshold = 50) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolled;
}

function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return position;
}

function usePartnerRotation(interval = 3000) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PARTNERS.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return currentIndex;
}

// ============================================
// COMPONENTS
// ============================================

const AnimatedStat = memo(function AnimatedStat({ 
  value, 
  label 
}: { 
  value: string | number; 
  label: string;
}) {
  const { count, elementRef } = useCounter(value);

  return (
    <div ref={elementRef} className="text-center">
      <p className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
        {count}
      </p>
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
});

AnimatedStat.displayName = "AnimatedStat";

const TrustBadge = memo(function TrustBadge({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-[#1a1d25] border border-[#2a2d35] rounded-[5px] px-4 py-3 hover:border-red-500/30 transition-all duration-300 hover:bg-[#1e212a] group">
      <div className="w-10 h-10 flex items-center justify-center rounded-[5px] bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
});

TrustBadge.displayName = "TrustBadge";

const Navigation = memo(function Navigation({ 
  isScrolled, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}: { 
  isScrolled: boolean; 
  mobileMenuOpen: boolean; 
  setMobileMenuOpen: (open: boolean) => void;
}) {
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0f1117]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20' 
          : 'bg-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-1.5 group" aria-label="ExpartFX Home">
            <span className="font-bold text-xl tracking-tight text-white group-hover:scale-105 transition-transform duration-300">
              EXPART<span className="text-red-500">FX</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[13px] text-slate-400 hover:text-white relative group transition-colors duration-200"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-5">
            <Link 
              href="/Login" 
              className="text-[13px] text-slate-400 hover:text-white transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/Login"
              className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium text-[13px] rounded-[5px] transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-400 hover:text-white p-2 transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
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

      <div 
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-96 bg-[#0f1117]/98 backdrop-blur-xl border-b border-white/[0.06]' : 'max-h-0'
        }`}
      >
        <div className="px-5 py-6 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="block px-3 py-3 text-slate-400 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <div className="pt-4 flex gap-3">
            <Link href="/Login" className="flex-1 text-center px-4 py-3 border border-white/10 text-slate-400 text-sm rounded-[5px] hover:border-white/20 transition-all">
              Sign In
            </Link>
            <Link href="/Login" className="flex-1 text-center px-4 py-3 bg-red-500 text-white font-medium text-sm rounded-[5px]">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
});

Navigation.displayName = "Navigation";

const HeroSection = memo(function HeroSection({ 
  mousePosition 
}: { 
  mousePosition: { x: number; y: number };
}) {
  const [hoveredPartner, setHoveredPartner] = useState<number | null>(null);
  const currentPartnerIndex = usePartnerRotation();

  return (
    <section className="relative w-full min-h-screen flex items-center bg-[#0f1117] overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      </div>

      {/* Parallax gradient orbs */}
      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl transition-transform duration-300"
        style={{ transform: `translate(${mousePosition.x * -0.03}px, ${mousePosition.y * -0.03}px)` }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl transition-transform duration-300"
        style={{ transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)` }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 7}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `translate(${mousePosition.x * 0.01 * (i % 3 - 1)}px, ${mousePosition.y * 0.01 * (i % 2 - 0.5)}px)`,
              transition: 'transform 0.2s ease-out',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Trust Bar */}
        <div className="text-center mb-12 sm:mb-16 animate-fadeIn">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-red-500/30" />
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-[11px] sm:text-xs tracking-[0.2em] uppercase text-slate-400 font-medium">
                Trusted by Industry Leaders
              </span>
            </div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-red-500/30" />
          </div>

          {/* Partner Logos */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            {PARTNERS.map((partner, index) => (
              <div
                key={partner.name}
                className="relative group"
                onMouseEnter={() => setHoveredPartner(index)}
                onMouseLeave={() => setHoveredPartner(null)}
              >
                <div 
                  className={`relative flex items-center gap-3 px-5 py-3 rounded-[5px] transition-all duration-500 ${
                    index === currentPartnerIndex || hoveredPartner === index
                      ? 'bg-[#1a1d25] border border-red-500/20 shadow-lg shadow-red-500/5 scale-110'
                      : 'hover:bg-[#1a1d25] hover:border border-white/5'
                  }`}
                >
                  <div 
                    className={`w-8 h-8 rounded-[5px] flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      index === currentPartnerIndex || hoveredPartner === index
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-slate-800/50 text-slate-500'
                    }`}
                  >
                    {partner.logo}
                  </div>
                  <span 
                    className={`text-xs font-medium tracking-wider transition-all duration-300 ${
                      index === currentPartnerIndex || hoveredPartner === index
                        ? 'text-white'
                        : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  >
                    {partner.name}
                  </span>

                  {index === currentPartnerIndex && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500">
                      <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-3xl mx-auto">
            <TrustBadge 
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              label="Security"
              value="256-bit SSL"
            />
            <TrustBadge 
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              label="Regulation"
              value="FCA, ASIC, CySEC"
            />
            <TrustBadge 
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              label="Execution"
              value="< 40ms"
            />
            <TrustBadge 
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              label="Liquidity"
              value="100+ Banks"
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-6 order-2 lg:order-1 animate-slideUp">
            <div className="inline-flex animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <span className="text-[11px] sm:text-xs tracking-wide text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-[5px]">
                Institutional Trading Platform
              </span>
            </div>

            <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <h1 className="font-extrabold leading-[0.9] tracking-tight">
                <span className="block text-[clamp(48px,8vw,96px)] text-white hover:scale-105 transition-transform duration-500 inline-block">
                  EXPART
                </span>
                <span className="block text-[clamp(48px,8vw,96px)] text-red-500 hover:scale-105 transition-transform duration-500 inline-block">
                  FX
                </span>
              </h1>
              <div className="mt-4 flex items-center gap-3 justify-center lg:justify-start">
                <div className="h-0.5 w-12 bg-red-500/50 animate-pulse" />
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                <div className="h-0.5 w-20 bg-gradient-to-r from-red-500/50 to-transparent" />
              </div>
            </div>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
              Professional trading platform with 
              <span className="text-white font-medium"> institutional execution</span>, 
              <span className="text-white font-medium"> advanced analytics</span>, and 
              <span className="text-red-400"> real-time market data</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-1 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
              <Link
                href="/Login"
                className="group px-7 py-3.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-[5px] transition-all duration-200 text-center shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-105 active:scale-95"
              >
                <span className="flex items-center justify-center gap-2">
                  Open Live Account
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/Login"
                className="px-7 py-3.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-sm rounded-[5px] transition-all duration-200 text-center hover:scale-105 active:scale-95"
              >
                Try Demo Account
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 border-t border-white/[0.06] max-w-lg mx-auto lg:mx-0">
              {STATS.map((s, i) => (
                <div key={s.label} className="animate-fadeIn" style={{ animationDelay: `${1 + i * 0.2}s` }}>
                  <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {s.num}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Cards */}
          <div className="grid grid-cols-2 gap-3 order-1 lg:order-2">
            {CARDS.map((card, index) => (
              <div
                key={card.title}
                className="group p-4 sm:p-5 bg-[#1a1d25] border border-[#2a2d35] hover:border-red-500/30 rounded-[5px] transition-all duration-500 hover:bg-[#1e212a] hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-500/5 animate-scaleIn"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-[5px] bg-red-500/10 text-red-400 mb-3 group-hover:bg-red-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  {card.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors duration-300">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-600">Scroll</span>
        <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
});

HeroSection.displayName = "HeroSection";

const PlatformSection = memo(function PlatformSection() {
  const [activeTab, setActiveTab] = useState<string>(PLATFORM_TABS[0].key);
  const active = PLATFORM_TABS.find((t) => t.key === activeTab) ?? PLATFORM_TABS[0];

  return (
    <section id="platform" className="py-20 sm:py-28 px-5 sm:px-6 lg:px-8 bg-[#0f1117] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.015]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-red-500/[0.04] rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-14">
          <p className="text-xs tracking-[0.2em] uppercase text-red-400 mb-3 font-medium">Platform</p>
          <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl mb-4 text-white">
            One Account, Every Way to Trade
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            The same execution engine and live positions follow you from browser to phone to your own code.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {PLATFORM_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 sm:px-5 py-2.5 rounded-[5px] text-[13px] font-medium transition-all duration-300 border ${
                activeTab === tab.key
                  ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20'
                  : 'bg-[#1a1d25] border-[#2a2d35] text-slate-400 hover:text-white hover:border-red-500/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="relative rounded-[5px] overflow-hidden border border-[#2a2d35] shadow-2xl shadow-black/50 group order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
            <div className="aspect-[16/10] bg-[#1a1d25] relative">
              <Image
                key={active.image}
                src={active.image}
                alt={active.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-[5px] z-20">
              {active.label}
            </div>
          </div>

          <div className="order-1 lg:order-2" key={active.key}>
            <h3 className="font-bold text-2xl sm:text-3xl mb-4 text-white animate-fadeIn">
              {active.title}
            </h3>
            <p className="text-slate-400 mb-6 leading-relaxed animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              {active.desc}
            </p>
            <ul className="space-y-3 mb-8">
              {active.points.map((point, i) => (
                <li
                  key={point}
                  className="flex items-center gap-3 text-sm text-slate-300 animate-fadeIn"
                  style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                >
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/Login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-[5px] transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-105 active:scale-95"
            >
              Explore {active.label}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out both;
        }
      `}</style>
    </section>
  );
});

PlatformSection.displayName = "PlatformSection";

const EducationSection = memo(function EducationSection() {
  return (
    <section id="education" className="py-20 sm:py-28 px-5 sm:px-6 lg:px-8 bg-[#13161c] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.015]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 sm:mb-14">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-red-400 mb-3 font-medium">Education</p>
            <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
              Learn Before You Leverage
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl">
              Free courses, live sessions, and research built by our trading desk — for every stage from first trade to full-time.
            </p>
          </div>
          <Link
            href="/Login"
            className="hidden sm:inline-flex items-center gap-2 text-sm text-white hover:text-red-400 transition-colors duration-200 group whitespace-nowrap"
          >
            View all resources
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {EDUCATION_RESOURCES.map((item, index) => (
            <div
              key={item.title}
              className="group bg-[#1a1d25] border border-[#2a2d35] hover:border-red-500/30 rounded-[5px] p-5 sm:p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/5"
              style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-[5px] bg-red-500/10 text-red-400 group-hover:bg-red-500/20 group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-[5px]">
                  {item.level}
                </span>
              </div>
              <h3 className="text-base font-semibold mb-2 text-white">{item.title}</h3>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">{item.desc}</p>
              <div className="flex items-center justify-between pt-4 border-t border-[#2a2d35] group-hover:border-red-500/20 transition-colors duration-500">
                <span className="text-[11px] text-slate-600">{item.meta}</span>
                <Link
                  href="/Login"
                  className="text-xs font-medium text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  Start
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/Login"
          className="sm:hidden mt-8 inline-flex items-center gap-2 text-sm text-white hover:text-red-400 transition-colors duration-200 group"
        >
          View all resources
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
});

EducationSection.displayName = "EducationSection";

const Footer = memo(function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  }, [email]);

  return (
    <footer className="border-t border-white/[0.04] bg-[#0f1117]">
      {/* Newsletter strip */}
      <div className="border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">Get market insight in your inbox</h3>
            <p className="text-sm text-slate-500">One email a week. No noise, unsubscribe anytime.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto max-w-sm gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-label="Email address"
              className="flex-1 lg:w-64 bg-[#1a1d25] border border-[#2a2d35] focus:border-red-500/50 outline-none text-sm text-white placeholder:text-slate-600 rounded-[5px] px-4 py-3 transition-colors"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-medium text-sm rounded-[5px] transition-all duration-200 whitespace-nowrap hover:scale-105 active:scale-95"
            >
              {subscribed ? "Subscribed ✓" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-1.5 mb-4">
              <span className="font-bold text-lg tracking-tight text-white">
                EXPART<span className="text-red-500">FX</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed mb-5 max-w-[220px]">
              Institutional-grade execution for retail and professional traders across forex, equities, crypto, and commodities.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-8 h-8 flex items-center justify-center rounded-[5px] bg-[#1a1d25] border border-[#2a2d35] text-slate-500 hover:text-white hover:border-red-500/30 hover:bg-[#1e212a] transition-all duration-200"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">{column.heading}</h4>
              <ul className="space-y-2.5">
                {column.links.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Regulatory badges */}
        <div className="flex flex-wrap items-center gap-3 pb-8 border-b border-[#2a2d35]">
          {["FCA Regulated", "ASIC Licensed", "CySEC Authorized", "256-bit SSL Encryption"].map((badge) => (
            <span
              key={badge}
              className="text-[11px] text-slate-500 bg-[#1a1d25] border border-[#2a2d35] rounded-[5px] px-3 py-1.5 flex items-center gap-1.5"
            >
              <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {badge}
            </span>
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-600">© 2026 ExpartFX. All rights reserved.</span>
          </div>
          <p className="text-[11px] text-slate-600 text-center max-w-2xl leading-relaxed">
            Trading CFDs and leveraged products carries a high level of risk and may not be suitable for all investors.
            Past performance does not guarantee future results. Please ensure you fully understand the risks before trading.
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

// ============================================
// MAIN COMPONENT
// ============================================

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isScrolled = useScrollDetection();
  const mousePosition = useMousePosition();

  return (
    <div className="bg-[#0f1117] text-white min-h-screen">
      <Navigation 
        isScrolled={isScrolled} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />

      <HeroSection mousePosition={mousePosition} />

      {/* Image Showcase Section */}
      <section className="py-20 sm:py-28 bg-[#13161c] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
              transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div 
              className="relative animate-slideRight" 
              style={{ transform: `translateY(${mousePosition.y * 0.02}px)` }}
            >
              <div className="relative rounded-[5px] overflow-hidden border border-[#2a2d35] shadow-2xl shadow-black/50 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                
                <div className="aspect-[16/10] bg-[#1a1d25] relative flex items-center justify-center">
                  <Image 
                    src="/images/dashboard-preview.jpg" 
                    alt="Trading Dashboard" 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-[5px] z-20">
                  Real-time Trading Dashboard
                </div>
              </div>

              <div 
                className="absolute -bottom-4 -right-4 bg-[#1a1d25] border border-[#2a2d35] rounded-[5px] p-4 shadow-xl animate-float z-20 hidden lg:block"
                style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-[5px] flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">EUR/USD</p>
                    <p className="text-sm font-bold text-green-400">+0.42%</p>
                  </div>
                </div>
              </div>
            </div>

            <div 
              className="animate-slideLeft"
              style={{ transform: `translateY(${mousePosition.y * -0.02}px)` }}
            >
              <p className="text-xs tracking-[0.2em] uppercase text-red-400 mb-3 font-medium">Platform</p>
              <h2 className="font-bold text-3xl sm:text-4xl mb-4 text-white">
                Professional Trading <span className="text-red-500">Platform</span>
              </h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Experience lightning-fast execution with our institutional-grade trading platform. Access advanced charting tools, real-time market data, and seamless order management.
              </p>
              <ul className="space-y-3">
                {["Advanced charting with 100+ indicators", "One-click trading execution", "Real-time P&L tracking", "Multi-device synchronization"].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <PlatformSection />

      {/* Markets Section */}
      <section id="markets" className="py-16 sm:py-20 px-5 sm:px-6 lg:px-8 bg-[#13161c] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.01]">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-14">
            <p className="text-xs tracking-[0.2em] uppercase text-red-400 mb-3 font-medium">Markets</p>
            <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl mb-4 text-white">
              Trade Global Markets
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Access 10,000+ trading instruments across multiple asset classes with institutional-grade execution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {SERVICES.map((service, index) => (
              <div
                key={service.title}
                className="group bg-[#1a1d25] border border-[#2a2d35] hover:border-red-500/30 rounded-[5px] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
                style={{ 
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                  transform: `translateY(${mousePosition.y * 0.01 * (index % 2 === 0 ? 1 : -1)}px)`,
                }}
              >
                <div className="relative h-40 overflow-hidden">
                  <div className="absolute inset-0 bg-[#1e212a] flex items-center justify-center">
                    <Image 
                      src={service.image} 
                      alt={service.title} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d25] via-transparent to-transparent" />
                </div>

                <div className="p-5 sm:p-6">
                  <div className="w-10 h-10 flex items-center justify-center rounded-[5px] bg-red-500/10 text-red-400 mb-3 group-hover:bg-red-500/20 transition-all duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-white">{service.title}</h3>
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">{service.desc}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="text-xs text-slate-400 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <AnimatedStat value={10000} label="Instruments" />
            <AnimatedStat value="0.0" label="Min Spread" />
            <AnimatedStat value={40} label="Execution Speed" />
            <AnimatedStat value={99.9} label="Uptime" />
          </div>
        </div>
      </section>

      <EducationSection />

      {/* Testimonials Section */}
      <section className="py-20 sm:py-28 px-5 sm:px-6 lg:px-8 bg-[#0f1117] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-red-500/50" />
              <span className="text-xs tracking-[0.2em] uppercase text-red-400 font-medium">
                Testimonials
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-red-500/50" />
            </div>

            <h2 className="font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
              Trusted by <span className="text-red-500">Professionals</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              Hear what our community of successful traders and investors say about their experience with ExpartFX
            </p>

            <div className="flex items-center justify-center gap-8 mt-6">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-slate-400">4.9/5</span>
              </div>
              <div className="w-px h-6 bg-slate-700" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">2,500+</span>
                <span className="text-sm text-slate-400">Reviews</span>
              </div>
              <div className="w-px h-6 bg-slate-700" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">98%</span>
                <span className="text-sm text-slate-400">Satisfaction</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="group relative bg-gradient-to-br from-[#1a1d25] to-[#13161c] border border-[#2a2d35] hover:border-red-500/40 rounded-[5px] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/10 overflow-hidden"
                style={{ 
                  animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                <div className="relative p-7">
                  <div className="flex gap-1 mb-5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed mb-6 min-h-[80px]">
                    "{testimonial.text}"
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-wider text-green-400 font-medium">Verified Trader</span>
                  </div>

                  <div className="flex items-center gap-4 pt-5 border-t border-[#2a2d35] group-hover:border-red-500/20 transition-colors duration-500">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1a1d25] border-2 border-[#2a2d35] group-hover:border-red-500/50 transition-colors duration-500 flex-shrink-0">
                        <Image 
                          src={testimonial.avatar} 
                          alt={testimonial.name} 
                          width={48} 
                          height={48} 
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {testimonial.role}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {testimonial.company}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-[5px] bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors duration-500">
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-6 bg-[#1a1d25] border border-[#2a2d35] rounded-[5px] px-6 py-3 hover:border-red-500/30 transition-all duration-300">
              <span className="text-sm text-slate-400">Join 15,000+ traders</span>
              <div className="w-px h-6 bg-[#2a2d35]" />
              <Link 
                href="/Login" 
                className="text-sm text-white hover:text-red-400 transition-colors duration-200 flex items-center gap-2 group"
              >
                Start your journey
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#1a1d25] opacity-50">
          <Image 
            src="/images/stock_market_bg_vctr.jpg" 
            alt="Trading background" 
            fill 
            className="object-cover opacity-90"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1117] via-transparent to-[#0f1117]" />

        <div 
          className="relative z-10 max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center"
          style={{ transform: `translateY(${mousePosition.y * -0.02}px)` }}
        >
          <h2 className="font-bold text-3xl sm:text-4xl lg:text-5xl mb-4 text-white animate-fadeIn">
            Ready to Start <span className="text-red-500">Trading</span>?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-lg mx-auto animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Join thousands of professional traders who trust ExpartFX. Open your account in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/Login"
              className="group px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-[5px] transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 hover:scale-105 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                Open Live Account
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
            <Link
              href="/Login"
              className="px-8 py-4 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-sm rounded-[5px] transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Try Demo Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out both;
        }
        .animate-slideUp {
          animation: slideUp 0.8s ease-out both;
        }
        .animate-slideRight {
          animation: slideRight 0.8s ease-out both;
        }
        .animate-slideLeft {
          animation: slideLeft 0.8s ease-out both;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out both;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}