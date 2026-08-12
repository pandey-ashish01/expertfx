"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle, XCircle, Clock, Eye, Users,
  LogOut, AlertCircle, RefreshCw
} from "lucide-react";

interface Payment {
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

export default function AdminPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!user || !token) { router.push("/login"); return; }

    const parsed = JSON.parse(user);
    if (parsed.userCode !== "ZENO000") {
      router.push("/dashboard");
      return;
    }

    fetchPayments();
  }, []);

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setPayments((prev) =>
          prev.map((p) =>
            p._id === paymentId ? { ...p, status } : p
          )
        );
      } else {
        alert(data.message || "Error");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = payments.filter((p) => filter === "all" || p.status === filter);
  const pendingCount = payments.filter((p) => p.status === "pending").length;

  const statusStyle = {
    pending: "bg-amber-400/10 text-amber-400 border-amber-400/30",
    approved: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
    rejected: "bg-red-400/10 text-red-400 border-red-400/30",
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#080c14]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-black font-black">
            Z
          </div>
          <div>
            <h1 className="font-black text-lg">Super Admin</h1>
            <p className="text-xs text-amber-400">ZENO000 · SUMANTA NANDI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPayments}
            className="p-2 rounded-xl hover:bg-white/5 text-gray-400"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => { localStorage.clear(); router.push("/login"); }}
            className="p-2 rounded-xl hover:bg-red-500/10 text-red-400"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: payments.length, color: "from-blue-500 to-blue-600" },
            { label: "Pending", value: pendingCount, color: "from-amber-500 to-orange-500" },
            { label: "Approved", value: payments.filter(p => p.status === "approved").length, color: "from-emerald-500 to-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="bg-[#111827] border border-white/5 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-amber-500 text-black"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {f} {f === "pending" && pendingCount > 0 && (
                <span className="ml-1 bg-black/30 px-1.5 rounded-full text-xs">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Payments List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-t-transparent border-amber-400 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#111827] border border-white/5 rounded-2xl p-12 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">No {filter} payments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((payment) => (
              <div key={payment._id} className="bg-[#111827] border border-white/5 rounded-2xl p-5">
                {/* User Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-black text-sm">
                      {payment.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">{payment.userName}</p>
                      <p className="text-xs text-amber-400 font-mono">{payment.userCode}</p>
                      <p className="text-xs text-gray-500">{payment.userMobile}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${statusStyle[payment.status]}`}>
                    {payment.status}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-black">{payment.amount} <span className="text-sm font-normal text-gray-400">USDT</span></p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                    {payment.description && (
                      <p className="text-xs text-gray-400 mt-1">{payment.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => window.open(payment.screenshot, "_blank")}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm transition-all"
                  >
                    <Eye className="w-4 h-4" /> Screenshot
                  </button>
                </div>

                {/* Actions — only for pending */}
                {payment.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(payment.userId, payment._id, "approved")}
                      disabled={actionLoading === payment._id}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                      {actionLoading === payment._id ? (
                        <div className="w-4 h-4 border-2 border-t-transparent border-emerald-400 rounded-full animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(payment.userId, payment._id, "rejected")}
                      disabled={actionLoading === payment._id}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}