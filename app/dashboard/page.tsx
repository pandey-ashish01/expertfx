"use client";

import React, { useEffect, useState } from "react";
import {
  User, Settings, LogOut, Edit2, Save, X,
  Users, Mail, Share2, Phone,
  Sun, Moon, DollarSign, Plus, Trash2, AlertCircle,
  Eye, EyeOff, CreditCard, TrendingUp, Menu,
  Key, Clock, CheckCircle, XCircle,
  Copy, Zap, BarChart3, Wallet, Star, Shield, Activity,
  ShieldCheck, Network, ChevronDown, ChevronRight,
  FileText, ArrowLeft, Globe, Sparkles, Rocket, Award, Flame,
  Link2                               // <-- new icon for Connect Broker
} from "lucide-react";
import { Toaster, toast } from "sonner";
import ProfitDistributionPanel from "@/components/ProfitDistribution";
import { useRouter } from "next/navigation";   // <-- CORRECTED IMPORT for App Router

// ---------- Interfaces ----------
interface Payment {
  _id: string;
  amount: number;
  screenshot: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  dailyInterest?: number;
  maxInterest?: number;
  maxMonths?: number;
  createdAt: string;
  investmentCalc?: {
    daysElapsed: number;
    dailyInterest: number;
    totalInterest: number;
    maxInterest: number;
    isMatured: boolean;
    maturityDate: string;
  };
}

interface Portfolio {
  totalInvested: number;
  totalInterestEarned: number;
  totalValue: number;
  maxMonths: number;
}

interface PaymentSummary {
  totalInvested: number;
  approvedCount: number;
  pendingCount: number;
  totalInterestEarned: number;
}

interface UserNode {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  userCode?: string;
  referralToken?: string;
  parentId?: string;
  children: UserNode[];
  payments: Payment[];
  paymentSummary: PaymentSummary;
  level: number;
  createdAt: string;
}

interface UserData {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  userCode?: string;
  referralToken?: string;
  parentId?: string;
  children?: any[];
  payments?: Payment[];
  createdAt: string;
  country?: string;
  walletAddress?: string;
  walletNetwork?: string;
  mt5Email?: string;
  mt5Account?: string;
}

interface FormData {
  name: string;
  mobile: string;
  email: string;
  country: string;
  walletAddress: string;
  walletNetwork: string;
  mt5Email: string;
  mt5Account: string;
}

interface PaymentFormData {
  amount: string;
  description: string;
  screenshot: File | null;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const MONTHLY_RATE = 0.08;
const DAYS_PER_MONTH = 30;
const DEFAULT_MAX_MONTHS = 24;
const REFERRAL_MAX_MONTHS = 30;
const SUPER_ADMIN_CODE = "EXPERT000";

function getDailyInterest(amount: number) {
  return (amount * MONTHLY_RATE) / DAYS_PER_MONTH;
}

function getStatusConfig(status: string) {
  switch (status) {
    case "approved":
      return { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30", label: "Approved" };
    case "rejected":
      return { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/30", label: "Rejected" };
    default:
      return { icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30", label: "Pending" };
  }
}

function normalizeTreeNode(node: any, level: number = 0): UserNode {
  const ps = node.paymentSummary || {};
  const paymentSummary: PaymentSummary = {
    totalInvested:       ps.totalInvested       ?? ps.totalAmount  ?? 0,
    approvedCount:       ps.approvedCount        ?? ps.paymentCount ?? 0,
    pendingCount:        ps.pendingCount         ?? 0,
    totalInterestEarned: ps.totalInterestEarned  ?? 0,
  };
  const children: UserNode[] = (node.children || [])
    .filter((c: any) => c && typeof c === "object" && c._id)
    .map((c: any) => normalizeTreeNode(c, level + 1));
  return {
    ...node,
    payments: node.payments || [],
    paymentSummary,
    children,
    level: node.level ?? level,
    createdAt: node.createdAt || "",
  };
}

// ─── Admin Panel ─────────────────────────────────────────────────────────────
interface AdminPayment {
  _id: string;
  amount: number;
  screenshot: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  userName: string;
  userCode: string;
  userMobile: string;
  userId: string;
}

function AdminPanel({ isDarkMode, card }: { isDarkMode: boolean; card: string }) {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setPayments(data.data);
      else setError(data.message);
    } catch {
      setError("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: string, paymentId: string, status: "approved" | "rejected") => {
    setActionLoading(paymentId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/payments/${userId}/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setPayments((prev) => prev.map((p) => p._id === paymentId ? { ...p, status } : p));
        toast.success(`Payment ${status}`);
      } else {
        toast.error(data.message || "Error");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = payments.filter((p) => filter === "all" || p.status === filter);
  const pendingCount = payments.filter((p) => p.status === "pending").length;

  const statusStyle = {
    pending:  "bg-amber-400/10 text-amber-400 border-amber-400/30",
    approved: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
    rejected: "bg-red-400/10 text-red-400 border-red-400/30",
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-red-500" /> Admin Panel
          </h1>
          <p className={`text-xs md:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Approve or reject user investments
          </p>
        </div>
        <button onClick={fetchPayments} className={`px-3 py-2.5 rounded-xl text-xs md:text-sm font-semibold ${isDarkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {[
          { label: "Total",    value: payments.length,                                      color: "from-red-500 to-red-600"       },
          { label: "Pending",  value: pendingCount,                                         color: "from-amber-500 to-orange-500"    },
          { label: "Approved", value: payments.filter(p => p.status === "approved").length, color: "from-emerald-500 to-emerald-600" },
        ].map((s) => (
          <div key={s.label} className={`${card} p-3 md:p-4`}>
            <p className={`text-xs mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{s.label}</p>
            <p className={`text-lg md:text-2xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-xs md:text-sm font-semibold capitalize transition-all ${
              filter === f ? "bg-red-500 text-white" : isDarkMode ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f}
            {f === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 bg-black/20 px-1.5 py-0.5 rounded-full text-xs">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs md:text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-t-transparent border-red-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${card} p-12 text-center`}>
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>No {filter} payments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((payment) => (
            <div key={payment._id} className={`${card} p-4 md:p-5`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {payment.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{payment.userName}</p>
                    <p className="text-xs text-red-400 font-mono">{payment.userCode}</p>
                    <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{payment.userMobile}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full border text-xs font-semibold ${statusStyle[payment.status]}`}>
                  {payment.status}
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xl md:text-2xl font-black">
                    {payment.amount} <span className="text-xs md:text-sm font-normal text-gray-400">USDT</span>
                  </p>
                  <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button onClick={() => window.open(payment.screenshot, "_blank")} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs md:text-sm transition-all ${isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}>
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
              </div>
              {payment.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(payment.userId, payment._id, "approved")}
                    disabled={actionLoading === payment._id}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold py-3 rounded-xl transition-all disabled:opacity-50 text-sm"
                  >
                    {actionLoading === payment._id ? <div className="w-4 h-4 border-2 border-t-transparent border-emerald-400 rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(payment.userId, payment._id, "rejected")}
                    disabled={actionLoading === payment._id}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-3 rounded-xl transition-all disabled:opacity-50 text-sm"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Network Panel ────────────────────────────────────────────────────────────
function NetworkPanel({ userId, isDarkMode, card }: { userId: string; isDarkMode: boolean; card: string }) {
  const [hierarchyData, setHierarchyData] = useState<UserNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  useEffect(() => { fetchNetwork(); }, []);

  const fetchNetwork = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/tree/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const normalized = normalizeTreeNode(data.data);
        setHierarchyData(normalized);
        setExpandedNodes(new Set([normalized._id]));
      } else {
        setError(data.message || "Failed to load network");
      }
    } catch {
      setError("Failed to load network");
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getInitials = (name: string) => {
    const w = name.trim().split(" ");
    return w.length >= 2 ? (w[0][0] + w[w.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  const avatarGradients = [
    "from-red-500 to-red-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
  ];
  const getGradient = (name: string) => avatarGradients[name.charCodeAt(0) % avatarGradients.length];

  const renderNode = (node: UserNode): React.ReactElement => {
    const hasChildren = node.children?.length > 0;
    const isExpanded  = expandedNodes.has(node._id);
    const isRoot      = node.level === 0;
    const ps          = node.paymentSummary;

    return (
      <div key={node._id} className="mb-2">
        <div
          className={`rounded-2xl border transition-all ${
            isRoot
              ? "bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/40"
              : isDarkMode ? "bg-white/3 border-white/8 hover:bg-white/6" : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
          style={{ marginLeft: `${Math.min(node.level * 16, 44)}px` }}
        >
          <div className="flex items-center gap-2 p-3 md:p-4 cursor-pointer" onClick={() => hasChildren && toggleNode(node._id)}>
            <div className="w-5 flex-shrink-0 flex items-center justify-center">
              {hasChildren ? (
                isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />
              ) : <span className="w-4" />}
            </div>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getGradient(node.name)} flex items-center justify-center text-white font-black text-xs flex-shrink-0`}>
              {getInitials(node.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-bold text-sm md:text-base truncate">{node.name}</p>
                {isRoot && <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0">YOU</span>}
                {node.userCode && <span className="font-mono text-xs text-red-400 flex-shrink-0">{node.userCode}</span>}
              </div>
              <p className={`text-xs md:text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{node.mobile}</p>
            </div>
            {hasChildren && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${isDarkMode ? "bg-white/8 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                <Users className="w-3 h-3" />{node.children.length}
              </div>
            )}
          </div>
          <div className={`mx-3 mb-3 p-2.5 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-2 ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
            {[
              { label: "Invested",  value: `${ps.totalInvested} USDT`,                  icon: Wallet,      color: "text-blue-400"    },
              { label: "Interest",  value: `${ps.totalInterestEarned.toFixed(2)} USDT`, icon: TrendingUp,  color: "text-emerald-400" },
              { label: "Approved",  value: `${ps.approvedCount} plans`,                 icon: CheckCircle, color: "text-emerald-400" },
              { label: "Pending",   value: `${ps.pendingCount} plans`,                  icon: Clock,       color: "text-amber-400"   },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="text-center">
                <Icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${color}`} />
                <p className={`text-xs mb-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{label}</p>
                <p className="font-bold text-xs">{value}</p>
              </div>
            ))}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className={`mt-1.5 ml-4 pl-3 border-l-2 border-dashed ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-t-transparent border-red-500 rounded-full animate-spin" /></div>;
  if (error) return <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}</div>;
  if (!hierarchyData) return <div className={`${card} p-12 text-center`}><Users className="w-12 h-12 mx-auto mb-3 text-gray-600" /><p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>No network data found.</p></div>;

  const countAll = (node: UserNode): number =>
    (node.children?.length || 0) + (node.children?.reduce((s, c) => s + countAll(c), 0) || 0);
  const totalMembers = countAll(hierarchyData);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
            <Network className="w-5 h-5 md:w-6 md:h-6 text-red-500" /> My Network
          </h1>
          <p className={`text-xs md:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            {totalMembers} member{totalMembers !== 1 ? "s" : ""} in your network
          </p>
        </div>
        <button onClick={fetchNetwork} className={`px-3 py-2.5 rounded-xl text-xs md:text-sm font-semibold ${isDarkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>
          Refresh
        </button>
      </div>
      <div className={`${card} p-3 md:p-5`}>{renderNode(hierarchyData)}</div>
    </div>
  );
}

// ─── Membership Component ────────────────────────────────────────────────────
interface LevelStats {
  level: number;
  members: UserNode[];
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  totalBusiness: number;
}

function Membership({ userId, isDarkMode, card }: { userId: string; isDarkMode: boolean; card: string }) {
  const [hierarchyData, setHierarchyData] = useState<UserNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<LevelStats | null>(null);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/tree/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const normalized = normalizeTreeNode(data.data);
        setHierarchyData(normalized);
      } else {
        setError(data.message || "Failed to load membership data");
      }
    } catch {
      setError("Failed to load membership data");
    } finally {
      setLoading(false);
    }
  };

  const getLevelStats = (root: UserNode): LevelStats[] => {
    const levelMap: Map<number, UserNode[]> = new Map();

    const traverse = (node: UserNode) => {
      if (node.level > 0) {
        const existing = levelMap.get(node.level) || [];
        existing.push(node);
        levelMap.set(node.level, existing);
      }
      if (node.children?.length) {
        node.children.forEach(child => traverse(child));
      }
    };

    traverse(root);

    return Array.from(levelMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([level, members]) => ({
        level,
        members,
        totalMembers: members.length,
        activeMembers: members.filter(m => m.paymentSummary.approvedCount > 0).length,
        inactiveMembers: members.filter(m => m.paymentSummary.approvedCount === 0).length,
        totalBusiness: members.reduce((s, m) => s + m.paymentSummary.totalInvested, 0),
      }));
  };

  const levelColors = [
    { badge: isDarkMode ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700", bar: "from-red-400 to-red-500", dot: "bg-red-400" },
    { badge: isDarkMode ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-700", bar: "from-purple-400 to-purple-500", dot: "bg-purple-400" },
    { badge: isDarkMode ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700", bar: "from-emerald-400 to-emerald-500", dot: "bg-emerald-400" },
    { badge: isDarkMode ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-700", bar: "from-amber-400 to-amber-500", dot: "bg-amber-400" },
    { badge: isDarkMode ? "bg-pink-500/20 text-pink-300" : "bg-pink-100 text-pink-700", bar: "from-pink-400 to-pink-500", dot: "bg-pink-400" },
  ];
  const getColor = (level: number) => levelColors[(level - 1) % levelColors.length];

  const getInitials = (name: string) => {
    const w = name.trim().split(" ");
    return w.length >= 2 ? (w[0][0] + w[w.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  const avatarGradients = ["from-red-500 to-red-600", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500"];
  const getGrad = (name: string) => avatarGradients[name.charCodeAt(0) % avatarGradients.length];

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-10 h-10 border-4 border-t-transparent border-red-500 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
    </div>
  );

  if (!hierarchyData) return (
    <div className={`${card} p-12 text-center`}>
      <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
      <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>No network data yet.</p>
    </div>
  );

  const levelStats = getLevelStats(hierarchyData);
  const totalAll = levelStats.reduce((s, l) => s + l.totalMembers, 0);
  const totalActive = levelStats.reduce((s, l) => s + l.activeMembers, 0);
  const totalInactive = levelStats.reduce((s, l) => s + l.inactiveMembers, 0);
  const totalBusiness = levelStats.reduce((s, l) => s + l.totalBusiness, 0);

  if (selectedLevel) {
    const color = getColor(selectedLevel.level);
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedLevel(null)}
            className={`p-2.5 rounded-xl flex-shrink-0 ${isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-2xl font-black">Level {selectedLevel.level}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${color.badge}`}>
                {selectedLevel.totalMembers} members
              </span>
            </div>
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              {selectedLevel.activeMembers} active · {selectedLevel.inactiveMembers} inactive
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className={`${card} p-3`}>
            <p className={`text-xs mb-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Active Members</p>
            <p className="text-lg font-black text-emerald-400">{selectedLevel.activeMembers}</p>
          </div>
          <div className={`${card} p-3`}>
            <p className={`text-xs mb-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Total Business</p>
            <p className="text-lg font-black text-blue-400">{selectedLevel.totalBusiness.toFixed(0)} USDT</p>
          </div>
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className={`px-4 py-3 border-b ${isDarkMode ? "border-white/5" : "border-gray-100"}`}>
            <p className="font-bold text-sm">All Members — Level {selectedLevel.level}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs uppercase tracking-wider ${isDarkMode ? "bg-white/3 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Code</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Mobile</th>
                  <th className="px-4 py-3 text-right">Invested</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Interest</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-100"}`}>
                {selectedLevel.members.map((member, idx) => {
                  const isActive = member.paymentSummary.approvedCount > 0;
                  return (
                    <tr key={member._id} className={`transition-colors ${isDarkMode ? "hover:bg-white/3" : "hover:bg-gray-50"}`}>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{idx + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getGrad(member.name)} flex items-center justify-center text-white font-black text-xs flex-shrink-0`}>
                            {getInitials(member.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate max-w-[100px] md:max-w-none">{member.name}</p>
                            <p className={`text-xs md:hidden ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{member.mobile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {member.userCode ? (
                          <span className="font-mono text-xs text-red-400">{member.userCode}</span>
                        ) : (
                          <span className={`text-xs ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>—</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-xs hidden md:table-cell ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {member.mobile}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold text-sm ${member.paymentSummary.totalInvested > 0 ? "text-blue-400" : isDarkMode ? "text-gray-600" : "text-gray-300"}`}>
                          {member.paymentSummary.totalInvested > 0 ? `${member.paymentSummary.totalInvested}` : "—"}
                        </span>
                        {member.paymentSummary.totalInvested > 0 && (
                          <span className={`text-xs ml-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>USDT</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className={`font-bold text-sm ${member.paymentSummary.totalInterestEarned > 0 ? "text-emerald-400" : isDarkMode ? "text-gray-600" : "text-gray-300"}`}>
                          {member.paymentSummary.totalInterestEarned > 0 ? member.paymentSummary.totalInterestEarned.toFixed(2) : "—"}
                        </span>
                        {member.paymentSummary.totalInterestEarned > 0 && (
                          <span className={`text-xs ml-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>USDT</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : isDarkMode ? "bg-white/5 text-gray-500 border border-white/10" : "bg-gray-100 text-gray-400 border border-gray-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : isDarkMode ? "bg-gray-600" : "bg-gray-300"}`} />
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className={`text-xs font-bold border-t-2 ${isDarkMode ? "border-white/10 bg-white/3 text-gray-300" : "border-gray-200 bg-gray-50 text-gray-700"}`}>
                  <td className="px-4 py-3" colSpan={2}>Total</td>
                  <td className="hidden md:table-cell"></td>
                  <td className="hidden md:table-cell"></td>
                  <td className="px-4 py-3 text-right text-blue-400">{selectedLevel.totalBusiness.toFixed(0)} USDT</td>
                  <td className="px-4 py-3 text-right text-emerald-400 hidden sm:table-cell">
                    {selectedLevel.members.reduce((s, m) => s + m.paymentSummary.totalInterestEarned, 0).toFixed(2)} USDT
                  </td>
                  <td className="px-4 py-3 text-center text-emerald-400">{selectedLevel.activeMembers} active</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <p className={`text-xs text-center ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
          {selectedLevel.members.length} member{selectedLevel.members.length !== 1 ? "s" : ""} at level {selectedLevel.level}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-red-500" /> Membership
          </h1>
          <p className={`text-xs md:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Network breakdown by level
          </p>
        </div>
        <button
          onClick={fetchStats}
          className={`px-3 py-2.5 rounded-xl text-xs md:text-sm font-semibold ${isDarkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <div className={`${card} p-3 md:p-4 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 opacity-10 rounded-full -mr-2 -mt-2" />
          <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-2">
            <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
          </div>
          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} mb-0.5`}>Total Members</p>
          <p className="font-bold text-base md:text-lg">{totalAll}</p>
        </div>
        <div className={`${card} p-3 md:p-4 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-10 rounded-full -mr-2 -mt-2" />
          <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-2">
            <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
          </div>
          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} mb-0.5`}>Active</p>
          <p className="font-bold text-base md:text-lg">{totalActive}</p>
        </div>
        <div className={`${card} p-3 md:p-4 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 opacity-10 rounded-full -mr-2 -mt-2" />
          <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mb-2">
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
          </div>
          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} mb-0.5`}>Inactive</p>
          <p className="font-bold text-base md:text-lg">{totalInactive}</p>
        </div>
        <div className={`${card} p-3 md:p-4 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 opacity-10 rounded-full -mr-2 -mt-2" />
          <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-2">
            <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
          </div>
          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} mb-0.5`}>Total Business</p>
          <p className="font-bold text-base md:text-lg">{totalBusiness.toFixed(0)} USDT</p>
        </div>
      </div>

      {levelStats.length === 0 ? (
        <div className={`${card} p-10 text-center`}>
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
            No downline members yet. Share your referral link to build your network.
          </p>
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className={`px-4 py-3 border-b ${isDarkMode ? "border-white/5" : "border-gray-100"} flex items-center justify-between`}>
            <p className="font-bold text-sm">Membership Breakdown by Level</p>
            <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{levelStats.length} levels</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs uppercase tracking-wider ${isDarkMode ? "bg-white/3 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
                  <th className="px-4 py-3 text-left">Level No.</th>
                  <th className="px-4 py-3 text-right">Member Count</th>
                  <th className="px-4 py-3 text-right">Active Member</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Inactive Member</th>
                  <th className="px-4 py-3 text-right">Total Business (USDT)</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">Active %</th>
                  <th className="px-4 py-3 text-center">Details</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-100"}`}>
                {levelStats.map(ls => {
                  const color = getColor(ls.level);
                  const activePercent = ls.totalMembers > 0 ? Math.round((ls.activeMembers / ls.totalMembers) * 100) : 0;
                  return (
                    <tr key={ls.level} className={`transition-colors ${isDarkMode ? "hover:bg-white/3" : "hover:bg-gray-50"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color.dot}`} />
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${color.badge}`}>
                            Level {ls.level}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-base">{ls.totalMembers}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-emerald-400 text-base">{ls.activeMembers}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className={`font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{ls.inactiveMembers}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-blue-400">
                          {ls.totalBusiness > 0 ? ls.totalBusiness.toFixed(0) : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-2 justify-end">
                          <div className={`flex-1 h-1.5 rounded-full min-w-[50px] max-w-[80px] ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`}>
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${color.bar} transition-all`}
                              style={{ width: `${activePercent}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold w-8 text-right ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {activePercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedLevel(ls)}
                          className={`inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                            isDarkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className={`text-xs font-bold border-t-2 ${isDarkMode ? "border-white/10 bg-white/3 text-gray-200" : "border-gray-200 bg-gray-50 text-gray-800"}`}>
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right text-base">{totalAll}</td>
                  <td className="px-4 py-3 text-right text-emerald-400 text-base">{totalActive}</td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-400">{totalInactive}</td>
                  <td className="px-4 py-3 text-right text-blue-400 text-base">{totalBusiness.toFixed(0)}</td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-amber-400">
                    {totalAll > 0 ? Math.round((totalActive / totalAll) * 100) : 0}%
                  </td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <p className={`text-xs text-center ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
        Active = at least 1 approved investment
      </p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();   // <-- now from next/navigation

  const [activeTab, setActiveTab]   = useState("dashboard");
  const [user, setUser]             = useState<UserData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [isEditing, setIsEditing]   = useState(false);
  const [payments, setPayments]     = useState<Payment[]>([]);
  const [portfolio, setPortfolio]   = useState<Portfolio | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [showAddPayment, setShowAddPayment]   = useState(false);
  const [copied, setCopied]         = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState<FormData>({
    name: "", mobile: "", email: "", country: "", walletAddress: "", walletNetwork: "", mt5Email: "", mt5Account: "",
  });

  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    amount: "", description: "", screenshot: null,
  });

  const isAdmin = user?.userCode === SUPER_ADMIN_CODE;

  useEffect(() => {
    const token    = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      window.location.href = "/login";
      return;
    }
    try {
      const parsedUser: UserData = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserDetails(parsedUser._id, token);
    } catch {
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (activeTab === "investments") fetchPayments(user._id);
  }, [activeTab, user]);

  const fetchUserDetails = async (userId: string, token: string) => {
    try {
      const res  = await fetch(`/api/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        setFormData({
          name:   data.data.name   || "",
          mobile: data.data.mobile || "",
          email:  data.data.email  || "",
          country: data.data.country || "",
          walletAddress: data.data.walletAddress || "",
          walletNetwork: data.data.walletNetwork || "",
          mt5Email: data.data.mt5Email || "",
          mt5Account: data.data.mt5Account || "",
        });
        fetchPayments(data.data._id);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchPayments = async (userId: string) => {
    setPaymentsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`/api/users/${userId}/payments`, { headers: { Authorization: `Bearer ${token}` } });
      const data  = await res.json();
      if (data.success) { setPayments(data.data); setPortfolio(data.portfolio || null); }
    } catch (e) { console.error(e); }
    finally { setPaymentsLoading(false); }
  };

  const handleAddPayment = async () => {
    if (!user || !paymentForm.amount || !paymentForm.screenshot) {
      toast.error("Please fill all required fields!");
      return;
    }
    const amount = parseFloat(paymentForm.amount);
    if (amount < 50 || amount > 5000) {
      toast.error("Investment must be between 50 and 5,000 USDT!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("amount", paymentForm.amount);
      fd.append("description", paymentForm.description);
      fd.append("screenshot", paymentForm.screenshot);
      const res  = await fetch(`/api/users/${user._id}/payments`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (data.success) {
        toast.success(`Investment submitted! ${data.data.note || ""}`);
        setPaymentForm({ amount: "", description: "", screenshot: null });
        setShowAddPayment(false);
        fetchPayments(user._id);
      } else {
        toast.error(data.message || "Error submitting investment");
      }
    } catch {
      toast.error("Error submitting investment");
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!user || !confirm("Delete this investment record?")) return;
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`/api/users/${user._id}/payments/${paymentId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data  = await res.json();
      if (data.success) {
        toast.success("Payment deleted");
        fetchPayments(user._id);
      } else {
        toast.error(data.message || "Error deleting");
      }
    } catch {
      toast.error("Error deleting payment");
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        localStorage.setItem("user", JSON.stringify(data.data));
        setIsEditing(false);
        toast.success("Profile updated!");
      } else {
        toast.error(data.message || "Error updating profile");
      }
    } catch {
      toast.error("Error updating profile");
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;
    setPasswordMessage({ type: "", text: "" });
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "All fields required!" });
      toast.error("All fields required!");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match!" });
      toast.error("New passwords do not match!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Minimum 6 characters required!" });
      toast.error("Minimum 6 characters required!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`/api/users/${user._id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMessage({ type: "success", text: "Password updated successfully!" });
        toast.success("Password updated!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPasswordMessage({ type: "error", text: data.message || "Error" });
        toast.error(data.message || "Error");
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Error updating password" });
      toast.error("Error updating password");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "Login";
  };

  const handleCopyCode = () => {
    if (!user?.userCode) return;
    navigator.clipboard.writeText(user.userCode);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyShareLink = () => {
    if (!user?.userCode) return;
    const link = `${window.location.origin}/join/${user.userCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name: string) => {
    const w = name.trim().split(" ");
    return w.length >= 2 ? (w[0][0] + w[w.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  const approvedPayments = payments.filter(p => p.status === "approved");
  const pendingPayments  = payments.filter(p => p.status === "pending");

  // Define tabs – add "connectBroker" at the end
  const tabs = [
    { id: "dashboard",   label: "Dashboard",  icon: BarChart3 },
    { id: "investments", label: "Investments", icon: TrendingUp },
    { id: "network",     label: "Network",     icon: Network },
    { id: "membership",  label: "Membership",  icon: Users },
    { id: "profits",     label: "Profits",     icon: DollarSign },
    { id: "profile",     label: "Profile",     icon: User },
    { id: "finance",     label: "Finance",     icon: Wallet },
    { id: "share",       label: "Share",       icon: Share2 },
    { id: "settings",    label: "Settings",    icon: Settings },
    ...(isAdmin ? [{ id: "admin", label: "Admin", icon: ShieldCheck }] : []),
    { id: "connectBroker", label: "Connect Broker", icon: Link2 },   // <-- new tab
  ];

  // Helper to handle tab clicks
  const handleTabClick = (tabId: string) => {
    if (tabId === "connectBroker") {
      router.push("/connect-broker");   // navigate to the page
    } else {
      setActiveTab(tabId);
    }
  };

  const bg   = isDarkMode ? "min-h-screen bg-[#080c14] text-white" : "min-h-screen bg-gray-50 text-gray-900";
  const card = isDarkMode ? "bg-[#111827] border border-white/5 rounded-2xl" : "bg-white border border-gray-200 rounded-2xl shadow-sm";
  const input = isDarkMode
    ? "bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 w-full focus:outline-none focus:border-red-500/50 transition-all text-sm"
    : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 w-full focus:outline-none focus:border-red-500 transition-all text-sm";

  if (loading) return (
    <div className={`${bg} flex items-center justify-center`}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-t-transparent border-red-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-red-500/70 text-sm tracking-widest uppercase">Loading...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#080c14]">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-white">Session Expired</h2>
        <button onClick={() => window.location.href = "/login"} className="bg-red-500 text-white font-bold px-6 py-3 rounded-xl">
          Go to Login
        </button>
      </div>
    </div>
  );

  return (
    <div className={bg}>
      <Toaster position="top-right" richColors closeButton />

      {/* Mobile Header */}
      <div className={`md:hidden sticky top-0 z-50 ${isDarkMode ? "bg-[#080c14]/95 backdrop-blur-xl border-b border-white/5" : "bg-white/95 backdrop-blur-xl border-b border-gray-200"}`}>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-black text-xs flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs leading-tight truncate max-w-[120px]">{user.name}</p>
              {user.userCode && <p className="text-[10px] text-red-400 font-mono">{user.userCode}</p>}
            </div>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg hover:bg-white/5" aria-label="Toggle theme">
              {isDarkMode ? <Sun className="w-4 h-4 text-gray-400" /> : <Moon className="w-4 h-4 text-gray-400" />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg hover:bg-white/5" aria-label="Menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-out menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className={`absolute right-0 top-0 h-full w-64 ${isDarkMode ? "bg-[#111827]" : "bg-white"} shadow-2xl`}>
            <div className={`p-4 border-b ${isDarkMode ? "border-white/10" : "border-gray-100"}`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-black text-sm">
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="font-bold text-sm">{user.name}</p>
                  {user.userCode && <p className="text-xs text-red-400 font-mono">{user.userCode}</p>}
                </div>
              </div>
            </div>
            <div className="p-3 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { handleTabClick(tab.id); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 w-full p-3.5 rounded-xl transition-all text-sm ${
                    activeTab === tab.id
                      ? "bg-red-500 text-white font-bold"
                      : isDarkMode ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
              <div className={`pt-2 mt-2 border-t ${isDarkMode ? "border-white/10" : "border-gray-100"}`}>
                <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3.5 rounded-xl text-red-400 hover:bg-red-400/10 text-sm">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen">
        <div className={`w-20 flex flex-col items-center py-6 border-r ${isDarkMode ? "bg-[#0d1117] border-white/5" : "bg-white border-gray-200"}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-black text-sm mb-8">E</div>
          <div className="flex flex-col items-center gap-2 flex-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl w-16 transition-all ${
                  activeTab === tab.id
                    ? "bg-red-500 text-white"
                    : isDarkMode ? "text-gray-500 hover:text-white hover:bg-white/5" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-xl ${isDarkMode ? "text-gray-500 hover:text-white hover:bg-white/5" : "text-gray-400 hover:bg-gray-50"}`}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={handleLogout} className="p-3 rounded-xl text-red-500 hover:bg-red-500/10">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden p-3 pb-6">{renderContent()}</div>
    </div>
  );

  // ─── Render Content Switch ────────────────────────────────────────────────
  function renderContent() {
    switch (activeTab) {
      case "dashboard":   return renderDashboard();
      case "investments": return renderInvestments();
      case "network":     return <NetworkPanel userId={user!._id} isDarkMode={isDarkMode} card={card} />;
      case "membership":  return <Membership userId={user!._id} isDarkMode={isDarkMode} card={card} />;
      case "profits":     return <ProfitDistributionPanel isAdmin={isAdmin} isDarkMode={isDarkMode} card={card} />;
      case "profile":     return renderProfile();
      case "finance":     return renderFinance();
      case "share":       return renderShare();
      case "settings":    return renderSettings();
      case "admin":       return isAdmin ? <AdminPanel isDarkMode={isDarkMode} card={card} /> : renderDashboard();
      // connectBroker is not handled here because we navigate away
      default:            return renderDashboard();
    }
  }

  // ─── Dashboard Render ──────────────────────────────────────────────────────
  function renderDashboard() {
    const totalInterestEarned = approvedPayments.reduce((sum, p) => sum + (p.investmentCalc?.totalInterest || 0), 0);
    const totalInvested       = approvedPayments.reduce((sum, p) => sum + p.amount, 0);

    return (
      <div className="space-y-4 md:space-y-5 max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-xs md:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Welcome back</p>
            <h1 className="text-lg md:text-3xl font-black mt-0.5 truncate">{user!.name}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAdmin && (
              <button onClick={() => setActiveTab("admin")} className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 px-2.5 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all">
                <ShieldCheck className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            {user!.userCode && (
              <div className={`text-right ${card} px-2.5 py-1.5 md:px-3 md:py-2`}>
                <p className="text-[10px] md:text-xs text-gray-500 mb-0.5">Code</p>
                <p className="font-mono font-bold text-red-400 text-xs md:text-sm">{user!.userCode}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {[
            { label: "Total Invested",  value: `${totalInvested.toFixed(2)} USDT`,              icon: Wallet,     color: "from-blue-500 to-blue-600",       sub: `${approvedPayments.length} active`  },
            { label: "Interest Earned", value: `${totalInterestEarned.toFixed(4)} USDT`,         icon: TrendingUp, color: "from-emerald-500 to-emerald-600", sub: "Total so far"                       },
            { label: "Daily Return",    value: `${approvedPayments.reduce((s, p) => s + (p.investmentCalc?.dailyInterest || 0), 0).toFixed(4)} USDT`, icon: Activity, color: "from-amber-500 to-orange-500", sub: "Per day" },
            { label: "Pending",         value: `${pendingPayments.length}`,                      icon: Clock,      color: "from-purple-500 to-purple-600",   sub: "Awaiting approval"                  },
          ].map((stat, i) => (
            <div key={i} className={`${card} p-2.5 md:p-4 relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-14 h-14 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-3 -mt-3`} />
              <div className={`w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-1.5 md:mb-2`}>
                <stat.icon className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              <p className={`text-[10px] md:text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} mb-0.5 truncate`}>{stat.label}</p>
              <p className="font-bold text-xs md:text-base truncate">{stat.value}</p>
              <p className={`text-[10px] md:text-xs mt-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"} truncate`}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {approvedPayments.length > 0 && (
          <div className={card}>
            <div className="p-3 md:p-5">
              <h2 className="font-bold text-sm md:text-base mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-400" /> Active Investments
              </h2>
              <div className="space-y-3">
                {approvedPayments.slice(0, 3).map(payment => {
                  const calc     = payment.investmentCalc;
                  const maxMo    = payment.maxMonths || DEFAULT_MAX_MONTHS;
                  const progress = calc ? Math.min((calc.daysElapsed / (maxMo * 30)) * 100, 100) : 0;
                  return (
                    <div key={payment._id} className={`p-3 md:p-4 rounded-xl ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-sm md:text-base">{payment.amount} USDT</p>
                          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{new Date(payment.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-emerald-400 font-bold text-sm">{calc?.totalInterest.toFixed(4)} USDT</p>
                          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>earned</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{calc?.daysElapsed || 0} days</span>
                          <span>{maxMo}mo max</span>
                        </div>
                        <div className={`h-1.5 rounded-full ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`}>
                          <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-600" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {approvedPayments.length > 3 && (
                <button onClick={() => setActiveTab("investments")} className="w-full mt-3 text-red-400 text-xs md:text-sm font-semibold hover:underline">
                  View all {approvedPayments.length} investments →
                </button>
              )}
            </div>
          </div>
        )}

        {pendingPayments.length > 0 && (
          <div className={`${card} border-l-4 border-amber-400`}>
            <div className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-400" />
                <h2 className="font-bold text-sm">{pendingPayments.length} Pending Approval{pendingPayments.length > 1 ? "s" : ""}</h2>
              </div>
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Awaiting Super Admin approval.</p>
            </div>
          </div>
        )}

        {approvedPayments.length === 0 && pendingPayments.length === 0 && (
          <div className={`${card} p-6 md:p-8 text-center`}>
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="font-bold text-base md:text-lg mb-2">Start Investing</h3>
            <p className={`text-xs md:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"} mb-4`}>
              Invest 50–5,000 USDT and earn 8% monthly interest for up to {DEFAULT_MAX_MONTHS} months
            </p>
            <button onClick={() => setActiveTab("investments")} className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all text-sm">
              Make First Investment
            </button>
          </div>
        )}
      </div>
    );
  }

 // ─── Investments Render ────────────────────────────────────────────────────
  function renderInvestments() {
    const amountVal       = parseFloat(paymentForm.amount) || 0;
    const dailyInterest   = amountVal >= 50 && amountVal <= 5000 ? getDailyInterest(amountVal) : 0;
    const monthlyInterest = amountVal * MONTHLY_RATE;

    // ── Pricing Plans ──
    const plans = [
      {
        amount: 100,
        label: "Starter",
        tagline: "Try it out",
        badge: "OFFER",
        icon: Sparkles,
        accent: "from-amber-400 to-orange-500",
        glow: "shadow-[0_8px_24px_-8px_rgba(251,191,36,0.35)]",
        glowHover: "hover:shadow-[0_12px_32px_-8px_rgba(251,191,36,0.5)]",
        ring: "hover:ring-amber-400/40",
        features: ["Instant activation", "Daily payout", "24 months validity", "Referral bonus"],
        highlight: false,
      },
      {
        amount: 200,
        label: "Basic",
        tagline: "Get started",
        badge: null,
        icon: Rocket,
        accent: "from-blue-400 to-cyan-500",
        glow: "shadow-[0_8px_24px_-8px_rgba(59,130,246,0.35)]",
        glowHover: "hover:shadow-[0_12px_32px_-8px_rgba(59,130,246,0.5)]",
        ring: "hover:ring-blue-400/40",
        features: ["Instant activation", "Daily payout", "24 months validity", "Referral bonus"],
        highlight: false,
      },
      {
        amount: 500,
        label: "Personal",
        tagline: "Most chosen",
        badge: "POPULAR",
        icon: Flame,
        accent: "from-red-500 to-orange-500",
        glow: "shadow-[0_10px_30px_-6px_rgba(239,68,68,0.45)]",
        glowHover: "hover:shadow-[0_16px_40px_-8px_rgba(239,68,68,0.6)]",
        ring: "hover:ring-red-500/50",
        features: ["Instant activation", "Daily payout", "24 months validity", "Priority support"],
        highlight: true,
      },
      {
        amount: 1000,
        label: "Business",
        tagline: "Go big",
        badge: null,
        icon: Award,
        accent: "from-purple-500 to-fuchsia-500",
        glow: "shadow-[0_8px_24px_-8px_rgba(168,85,247,0.35)]",
        glowHover: "hover:shadow-[0_12px_32px_-8px_rgba(168,85,247,0.5)]",
        ring: "hover:ring-purple-400/40",
        features: ["Instant activation", "Daily payout", "24 months validity", "Priority support"],
        highlight: false,
      },
    ];

    const selectPlan = (amt: number) => {
      setPaymentForm({ ...paymentForm, amount: String(amt) });
      setShowAddPayment(true);
      setTimeout(() => {
        document.getElementById("investment-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    };

    return (
      <div className="space-y-5 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-black">Investments</h1>
            <p className={`flex items-center gap-1.5 text-xs md:text-sm font-bold mt-0.5 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>
              <TrendingUp className="w-3.5 h-3.5" /> Monthly Approx 40% – 50% Profits
            </p>
          </div>
          <button
            onClick={() => setShowAddPayment(!showAddPayment)}
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-[length:200%_auto] hover:bg-right text-white font-bold px-3.5 md:px-5 py-2.5 md:py-3 rounded-lg text-xs md:text-sm flex-shrink-0 shadow-[0_6px_20px_-4px_rgba(239,68,68,0.5)] hover:shadow-[0_8px_26px_-4px_rgba(239,68,68,0.65)] ring-1 ring-white/10 transition-all duration-300 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Custom Amount
          </button>
        </div>

        {/* ── Pricing Plan Cards ── */}
        <div>
          <div className={`flex gap-2.5 overflow-x-auto pb-2 -mx-3 px-3 snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden`} style={{ scrollbarWidth: "none" }}>
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.amount}
                  className={`group relative flex-shrink-0 w-[72%] xs:w-[64%] sm:w-[42%] md:w-auto snap-center rounded-xl overflow-hidden transition-all duration-300 ease-out active:scale-[0.97] hover:-translate-y-1 ring-1 ring-transparent ${plan.ring} ${
                    plan.highlight
                      ? `bg-gradient-to-b ${isDarkMode ? "from-[#1a1024] to-[#150c1e]" : "from-red-50 to-white"} ring-2 ring-red-500/70 ${plan.glow} ${plan.glowHover}`
                      : isDarkMode
                      ? `bg-[#111827] border border-white/[0.06] ${plan.glow} ${plan.glowHover}`
                      : `bg-white border border-gray-200 ${plan.glow} ${plan.glowHover}`
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-red-500/20 to-transparent pointer-events-none" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {plan.badge && (
                    <span
                      className={`absolute top-3 right-3 z-10 flex items-center gap-1 text-[9px] font-black px-2 py-[3px] rounded-full tracking-wide shadow-sm ${
                        plan.badge === "OFFER"
                          ? "bg-gradient-to-r from-amber-400 to-orange-400 text-black"
                          : "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                      }`}
                    >
                      {plan.badge === "POPULAR" && <Flame className="w-2.5 h-2.5" />}
                      {plan.badge}
                    </span>
                  )}

                  <div className="p-3.5 md:p-4 relative">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${plan.accent} flex items-center justify-center mb-3 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>

                    <p className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{plan.label}</p>
                    <p className={`text-[11px] mb-2.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{plan.tagline}</p>

                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl md:text-3xl font-black tracking-tight">{plan.amount}</span>
                      <span className={`text-xs font-bold ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>USDT</span>
                    </div>

                    <div className={`h-px w-full mb-3 ${isDarkMode ? "bg-white/10" : "bg-gray-100"}`} />

                    <div className="space-y-1.5 mb-4">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${plan.accent} flex items-center justify-center flex-shrink-0`}>
                            <CheckCircle className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                          </div>
                          <span className={`text-[11px] ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{f}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => selectPlan(plan.amount)}
                      className={`w-full py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95 ${
                        plan.highlight
                          ? `bg-gradient-to-r ${plan.accent} bg-[length:180%_auto] hover:bg-right text-white shadow-lg ${plan.glow} ring-1 ring-white/10`
                          : isDarkMode
                          ? "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      Get this plan <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className={`md:hidden text-center text-[10px] mt-1 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>← swipe to see all plans →</p>
        </div>

        {/* Mobile floating custom-amount button */}
        <button
          onClick={() => setShowAddPayment(!showAddPayment)}
          className="sm:hidden w-full flex items-center justify-center gap-1.5 bg-white/5 border border-white/10 text-gray-300 font-semibold px-4 py-3 rounded-lg text-xs transition-all active:scale-[0.98] hover:bg-white/[0.08]"
        >
          <Plus className="w-3.5 h-3.5" /> Enter a custom amount instead
        </button>

        {showAddPayment && (
          <div id="investment-form" className={`${card} overflow-hidden scroll-mt-4 !rounded-xl shadow-[0_8px_30px_-8px_rgba(0,0,0,0.35)]`}>
            <div className="h-1 bg-gradient-to-r from-red-500 to-red-600" />
            <div className="p-3 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm md:text-base">New Investment</h3>
                <button onClick={() => setShowAddPayment(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-widest mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Amount (USDT) *</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className={`${input} !rounded-lg`}
                    placeholder="Min: 50 – Max: 5,000 USDT"
                    min="50"
                    max="5000"
                  />
                  {amountVal >= 50 && amountVal <= 5000 && (
                    <div className={`mt-2 p-3 rounded-lg ${isDarkMode ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"}`}>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><p className="text-xs text-gray-500 mb-0.5">Daily</p><p className="font-bold text-emerald-400 text-xs md:text-sm">{dailyInterest.toFixed(4)} USDT</p></div>
                        <div><p className="text-xs text-gray-500 mb-0.5">Monthly</p><p className="font-bold text-emerald-400 text-xs md:text-sm">{monthlyInterest.toFixed(2)} USDT</p></div>
                        <div><p className="text-xs text-gray-500 mb-0.5">Max Return</p><p className="font-bold text-amber-400 text-xs md:text-sm">{(amountVal * 2).toFixed(0)} USDT</p></div>
                      </div>
                    </div>
                  )}
                  {amountVal > 0 && (amountVal < 50 || amountVal > 5000) && <p className="text-red-400 text-xs mt-1">Amount must be between 50 and 5,000 USDT</p>}
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-widest mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Note (Optional)</label>
                  <input
                    type="text"
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                    className={`${input} !rounded-lg`}
                    placeholder="Add a note or transaction ID"
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-widest mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    MT5 Deposit Screenshot *
                  </label>
                  <div
                    className={`relative rounded-xl p-5 text-center transition-all duration-300 overflow-hidden group ${
                      paymentForm.screenshot
                        ? isDarkMode
                          ? "border border-emerald-500/30 bg-emerald-500/[0.04]"
                          : "border border-emerald-400/40 bg-emerald-50/60"
                        : isDarkMode
                        ? "border-2 border-dashed border-white/12 hover:border-red-500/40 bg-white/[0.02] hover:bg-white/[0.04]"
                        : "border-2 border-dashed border-gray-200 hover:border-red-400/60 bg-gray-50/50 hover:bg-red-50/30"
                    }`}
                  >
                    {paymentForm.screenshot ? (
                      <div className="space-y-3">
                        <div className="relative inline-block">
                          <img
                            src={URL.createObjectURL(paymentForm.screenshot)}
                            alt="Preview"
                            className={`mx-auto h-28 w-auto object-contain rounded-lg shadow-md ring-1 ${isDarkMode ? "ring-white/10" : "ring-gray-200"}`}
                          />
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md ring-2 ring-[#111827]">
                            <CheckCircle className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <p className={`text-xs truncate max-w-[160px] font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{paymentForm.screenshot.name}</p>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <label className={`text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${isDarkMode ? "bg-white/5 hover:bg-white/10 text-gray-300" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"}`}>
                            Replace
                            <input type="file" accept="image/*" onChange={(e) => setPaymentForm({ ...paymentForm, screenshot: e.target.files?.[0] || null })} className="hidden" />
                          </label>
                          <button onClick={() => setPaymentForm({ ...paymentForm, screenshot: null })} className="text-xs font-semibold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all">
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${isDarkMode ? "bg-red-500/10" : "bg-red-50"}`}>
                          <CreditCard className="w-5 h-5 text-red-400" />
                        </div>
                        <p className={`text-sm font-semibold mb-1 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>Upload your MT5 deposit screenshot</p>
                        <p className="text-xs text-gray-500 mb-3">PNG or JPG · Drag & drop or click to browse</p>
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-[0_4px_14px_-3px_rgba(239,68,68,0.5)] hover:shadow-[0_6px_18px_-3px_rgba(239,68,68,0.65)] transition-all">
                          <Plus className="w-3.5 h-3.5" /> Choose File
                        </span>
                        <input type="file" accept="image/*" onChange={(e) => setPaymentForm({ ...paymentForm, screenshot: e.target.files?.[0] || null })} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-lg flex items-start gap-2 ${isDarkMode ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
                  <Shield className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-300">Investment will be <strong>pending</strong> until Super Admin approves it.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddPayment} disabled={!paymentForm.amount || !paymentForm.screenshot || amountVal < 50 || amountVal > 5000} className="flex-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-[length:200%_auto] hover:bg-right text-white font-bold py-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-[0_6px_20px_-4px_rgba(239,68,68,0.5)] hover:shadow-[0_8px_26px_-4px_rgba(239,68,68,0.65)] transition-all duration-300 active:scale-[0.98]">
                    Submit Investment
                  </button>
                  <button onClick={() => setShowAddPayment(false)} className={`px-4 py-3 rounded-lg border text-sm transition-colors ${isDarkMode ? "border-white/10 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"}`}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {paymentsLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-t-transparent border-red-500 rounded-full animate-spin" /></div>
        ) : payments.length === 0 ? (
          <div className={`${card} !rounded-xl p-8 text-center`}>
            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-500" />
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>No investments yet. Start with as little as 50 USDT!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {payments.map(payment => {
              const statusCfg  = getStatusConfig(payment.status);
              const StatusIcon = statusCfg.icon;
              const calc       = payment.investmentCalc;
              const maxMo      = payment.maxMonths || DEFAULT_MAX_MONTHS;
              return (
                <div key={payment._id} className={`${card} !rounded-xl transition-all duration-300 hover:-translate-y-0.5 ${isDarkMode ? "hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] hover:border-white/10" : "hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]"}`}>
                  <div className="p-3 md:p-4">
                    <div className="flex items-start justify-between mb-2.5 gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDarkMode ? "bg-red-500/10" : "bg-red-50"}`}>
                          <DollarSign className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm md:text-base">{payment.amount} <span className="text-xs md:text-sm font-normal text-gray-400">USDT</span></p>
                          <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                            {new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-semibold ${statusCfg.bg}`}>
                          <StatusIcon className={`w-3 h-3 ${statusCfg.color}`} />
                          <span className={`${statusCfg.color} hidden sm:inline`}>{statusCfg.label}</span>
                        </div>
                        <button onClick={() => window.open(payment.screenshot, "_blank")} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"><Eye className="w-3.5 h-3.5 text-gray-400" /></button>
                        <button onClick={() => handleDeletePayment(payment._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    {payment.status === "approved" && calc && (
                      <div className={`rounded-lg p-2.5 ${isDarkMode ? "bg-white/3" : "bg-gray-50"}`}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2.5">
                          <div><p className={`text-xs mb-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Days Active</p><p className="font-bold text-xs md:text-sm">{calc.daysElapsed} days</p></div>
                          <div><p className={`text-xs mb-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Daily</p><p className="font-bold text-xs md:text-sm text-emerald-400">{calc.dailyInterest} USDT</p></div>
                          <div><p className={`text-xs mb-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Earned</p><p className="font-bold text-xs md:text-sm text-emerald-400">{calc.totalInterest.toFixed(4)} USDT</p></div>
                          <div><p className={`text-xs mb-0.5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Max Return</p><p className="font-bold text-xs md:text-sm text-amber-400">{calc.maxInterest.toFixed(2)} USDT</p></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{calc.daysElapsed}/{maxMo * 30}d</span>
                            <span>{((calc.daysElapsed / (maxMo * 30)) * 100).toFixed(1)}%</span>
                          </div>
                          <div className={`h-1.5 rounded-full ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`}>
                            <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-600" style={{ width: `${Math.min((calc.daysElapsed / (maxMo * 30)) * 100, 100)}%` }} />
                          </div>
                          <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                            Matures: {new Date(calc.maturityDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            {calc.isMatured && <span className="text-red-400 ml-2 font-semibold">Matured</span>}
                          </p>
                        </div>
                      </div>
                    )}
                    {payment.status === "pending" && (
                      <div className={`rounded-lg p-2.5 flex items-center gap-2 ${isDarkMode ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"}`}>
                        <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <p className="text-xs text-amber-300">Awaiting approval. Daily interest of <strong>{getDailyInterest(payment.amount).toFixed(4)} USDT</strong> starts once approved.</p>
                      </div>
                    )}
                    {payment.description && <p className={`text-xs mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>{payment.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── Profile Render ────────────────────────────────────────────────────────
  function renderProfile() {
    const wasEmailRegistered = !!user!.email;
    const hasMobileAlready   = !!user!.mobile;
    const mobileIsEditable   = wasEmailRegistered && !hasMobileAlready;

    const countries = [
      "India", "United States", "United Kingdom", "Canada", "Australia",
      "Germany", "France", "Japan", "Brazil", "South Africa",
      "United Arab Emirates", "Singapore", "Malaysia", "Indonesia", "Nigeria"
    ];

    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-2xl font-black">Profile</h1>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 bg-red-500 text-white font-bold px-3 py-2.5 rounded-xl text-xs md:text-sm">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSaveProfile} className="flex items-center gap-1.5 bg-emerald-500 text-white font-bold px-3 py-2.5 rounded-xl text-xs md:text-sm">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={() => setIsEditing(false)} className={`px-3 py-2.5 rounded-xl text-xs md:text-sm border ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>Cancel</button>
            </div>
          )}
        </div>

        {user!.userCode && (
          <div className={`${card} p-3 md:p-4`}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Your User Code</p>
                <p className="text-xl md:text-3xl font-black text-red-400 font-mono truncate">{user!.userCode}</p>
                <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Login ID · Referral ID</p>
              </div>
              <button onClick={handleCopyCode} className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-gray-50 hover:bg-gray-100"}`}>
                {copied ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-red-400" />}
              </button>
            </div>
          </div>
        )}

        <div className={`${card} p-3 md:p-4`}>
          <h2 className={`text-sm font-bold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Personal Information</h2>
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {[
              { key: "name",    label: "Full Name",     icon: User,  editable: true },
              {
                key: "mobile",
                label: "Mobile Number",
                icon: Phone,
                editable: mobileIsEditable,
                lockedReason: !mobileIsEditable ? (hasMobileAlready ? "Fixed" : "Add email first") : undefined,
              },
              {
                key: "email",
                label: "Email Address",
                icon: Mail,
                editable: !wasEmailRegistered,
                lockedReason: wasEmailRegistered ? "Fixed" : undefined,
              },
              { key: "country", label: "Country",       icon: Globe,      editable: true },
            ].map(({ key, label, icon: Icon, editable, lockedReason }) => (
              <div key={key}>
                <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</label>
                {isEditing && editable ? (
                  key === "country" ? (
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className={input}
                    >
                      <option value="">Select your country</option>
                      {countries.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData[key as keyof FormData]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className={input}
                      placeholder={`Enter your ${label.toLowerCase()}`}
                    />
                  )
                ) : (
                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className={`text-sm flex-1 truncate ${!formData[key as keyof FormData] ? "text-gray-500 italic" : ""}`}>{formData[key as keyof FormData] || "Not provided"}</span>
                    {lockedReason && <span className="text-xs text-gray-500 bg-gray-500/10 px-1.5 py-0.5 rounded flex-shrink-0">{lockedReason}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
          {mobileIsEditable && isEditing && (
            <div className={`mt-3 p-3 rounded-xl ${isDarkMode ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-200"}`}>
              <p className="text-xs text-blue-300 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                You registered with email. Add your mobile number now — it will be locked once saved.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Finance Render ────────────────────────────────────────────────────────
  function renderFinance() {
    const walletNetworks = [
      "USDT-BEP20", "USDT-TRC20", "USDT-ERC20",
      "Bitcoin", "Ethereum", "Other"
    ];

    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-2xl font-black">Finance Details</h1>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 bg-red-500 text-white font-bold px-3 py-2.5 rounded-xl text-xs md:text-sm">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSaveProfile} className="flex items-center gap-1.5 bg-emerald-500 text-white font-bold px-3 py-2.5 rounded-xl text-xs md:text-sm">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={() => setIsEditing(false)} className={`px-3 py-2.5 rounded-xl text-xs md:text-sm border ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>Cancel</button>
            </div>
          )}
        </div>

        <div className={`${card} p-3 md:p-4`}>
          <h2 className={`text-sm font-bold mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Payout & Trading Details</h2>
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Payout Wallet</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="w-full sm:w-48">
                  {isEditing ? (
                    <select
                      value={formData.walletNetwork}
                      onChange={(e) => setFormData({ ...formData, walletNetwork: e.target.value })}
                      className={input}
                    >
                      <option value="">Select network</option>
                      {walletNetworks.map(nw => (
                        <option key={nw} value={nw}>{nw}</option>
                      ))}
                    </select>
                  ) : (
                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
                      <Wallet className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className={`text-sm flex-1 truncate ${!formData.walletNetwork ? "text-gray-500 italic" : ""}`}>
                        {formData.walletNetwork || "Not selected"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.walletAddress}
                      onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                      className={input}
                      placeholder="e.g. 0x1234... or TXXXX..."
                    />
                  ) : (
                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className={`text-sm flex-1 truncate ${!formData.walletAddress ? "text-gray-500 italic" : ""}`}>
                        {formData.walletAddress || "Not provided"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>XM Registered Email (MT5)</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.mt5Email}
                  onChange={(e) => setFormData({ ...formData, mt5Email: e.target.value })}
                  className={input}
                  placeholder="Your XM registered email address"
                />
              ) : (
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className={`text-sm flex-1 truncate ${!formData.mt5Email ? "text-gray-500 italic" : ""}`}>
                    {formData.mt5Email || "Not provided"}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>MT5 Account Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.mt5Account}
                  onChange={(e) => setFormData({ ...formData, mt5Account: e.target.value })}
                  className={input}
                  placeholder="e.g. MT5-123456"
                />
              ) : (
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
                  <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className={`text-sm flex-1 truncate ${!formData.mt5Account ? "text-gray-500 italic" : ""}`}>
                    {formData.mt5Account || "Not provided"}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className={`mt-4 p-3 rounded-xl ${isDarkMode ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"}`}>
            <p className="text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Wallet details are used for withdrawal processing. XM MT5 email is separate from your account login email.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Share Render ──────────────────────────────────────────────────────────
  function renderShare() {
    const shareLink = user!.userCode ? `${window.location.origin}/join/${user!.userCode}` : "";
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div>
          <h1 className="text-lg md:text-2xl font-black">Share & Earn</h1>
          <p className={`text-xs md:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Invite friends to extend your investment to {REFERRAL_MAX_MONTHS} months
          </p>
        </div>
        <div className={`${card} p-3 md:p-4`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Referral Bonus</p>
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Invite → your plan extends to <strong className="text-red-400">{REFERRAL_MAX_MONTHS} months</strong>
              </p>
            </div>
          </div>
          {user!.userCode && (
            <>
              <label className={`block text-xs font-semibold uppercase tracking-widest mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Your Referral Link</label>
              <div className={`flex items-center gap-2 p-3 rounded-xl mb-3 ${isDarkMode ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"}`}>
                <p className={`flex-1 text-xs truncate font-mono ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{shareLink}</p>
                <button onClick={handleCopyShareLink} className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex-shrink-0">
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className={`p-3 rounded-xl ${isDarkMode ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
                <p className={`text-xs font-bold mb-0.5 ${isDarkMode ? "text-red-300" : "text-red-700"}`}>Code: {user!.userCode}</p>
                <p className={`text-xs ${isDarkMode ? "text-red-400/70" : "text-red-600"}`}>
                  Share this code to extend plan from {DEFAULT_MAX_MONTHS} to {REFERRAL_MAX_MONTHS} months!
                </p>
              </div>
            </>
          )}
        </div>

        {user!.children && user!.children.length > 0 && (
          <div className={`${card} overflow-hidden`}>
            <div className={`px-4 py-3 border-b ${isDarkMode ? "border-white/5" : "border-gray-100"}`}>
              <p className="font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-red-400" />
                {user!.children.length} Referred Member{user!.children.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="divide-y divide-white/5">
              {user!.children.slice(0, 5).map((child: any, i: number) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${isDarkMode ? "hover:bg-white/3" : "hover:bg-gray-50"}`}>
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {child.name ? child.name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{child.name || "Member"}</p>
                    {child.userCode && <p className="text-xs text-red-400 font-mono">{child.userCode}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Settings Render ──────────────────────────────────────────────────────
  function renderSettings() {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <h1 className="text-lg md:text-2xl font-black">Settings</h1>
        <div className={card}>
          <div className="p-3 md:p-4">
            <h3 className="font-bold text-sm mb-0.5">Update Password</h3>
            <p className={`text-xs mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Change your account password</p>
            {passwordMessage.text && (
              <div className={`mb-3 p-3 rounded-xl text-xs md:text-sm ${passwordMessage.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                {passwordMessage.text}
              </div>
            )}
            <div className="space-y-3">
              {[
                { label: "Current Password", key: "currentPassword", show: "current" },
                { label: "New Password",      key: "newPassword",     show: "new"     },
                { label: "Confirm Password",  key: "confirmPassword", show: "confirm" },
              ].map(({ label, key, show }) => (
                <div key={key}>
                  <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</label>
                  <div className="relative">
                    <input
                      type={showPassword[show as keyof typeof showPassword] ? "text" : "password"}
                      value={passwordForm[key as keyof PasswordFormData]}
                      onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                      className={`${input} pr-12`}
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                    <button onClick={() => setShowPassword({ ...showPassword, [show]: !showPassword[show as keyof typeof showPassword] })} className="absolute right-3 top-1/2 -translate-y-1/2">
                      {showPassword[show as keyof typeof showPassword] ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={handleUpdatePassword} className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 rounded-xl text-sm">
                Update Password
              </button>
            </div>
          </div>
        </div>
        <div className={`${card} p-3 md:p-4`}>
          <h3 className="font-bold text-sm mb-0.5">Session</h3>
          <p className={`text-xs mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Sign out of your account</p>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 font-bold px-4 py-2.5 rounded-xl w-full justify-center text-sm">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>
    );
  }
}