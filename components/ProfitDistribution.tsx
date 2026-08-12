"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, AlertCircle, Zap, Clock, TrendingUp, Wallet } from "lucide-react";
import { toast } from "sonner";

interface IncomeHistoryItem {
  distributionId: string;
  date: string;
  totalTradingProfit: number;
  level: number;
  personalInvestment: number;
  downlineInvestment: number;
  branchInvestment: number;
  ratio: number;
  income: number;
}

interface DistributionEntry {
  userId: { _id: string; name: string; userCode: string; mobile: string };
  level: number;
  personalInvestment: number;
  downlineInvestment: number;
  branchInvestment: number;
  ratio: number;
  income: number;
}

interface DistributionRecord {
  _id: string;
  createdAt: string;
  totalTradingProfit: number;
  compensationPool: number;
  levelIncomePool: number;
  salaryPool: number;
  leadershipPool: number;
  entries: DistributionEntry[];
}

export default function ProfitDistribution({
  isAdmin,
  isDarkMode,
  card,
}: {
  isAdmin: boolean;
  isDarkMode: boolean;
  card: string;
}) {
  const [walletBalance, setWalletBalance] = useState(0);
  const [history, setHistory] = useState<IncomeHistoryItem[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);

  const [profitInput, setProfitInput] = useState("");
  const [distributing, setDistributing] = useState(false);
  const [pastDistributions, setPastDistributions] = useState<DistributionRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedDistribution, setExpandedDistribution] = useState<string | null>(null);

  useEffect(() => {
    fetchMyWallet();
    if (isAdmin) fetchPastDistributions();
  }, [isAdmin]);

  const fetchMyWallet = async () => {
    setLoadingWallet(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setWalletBalance(data.walletBalance);
        setHistory(data.history);
      }
    } catch {
      toast.error("Failed to load wallet");
    } finally {
      setLoadingWallet(false);
    }
  };

  const fetchPastDistributions = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/distributions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setPastDistributions(data.data);
    } catch {
      toast.error("Failed to load distribution history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDistribute = async () => {
    const amount = parseFloat(profitInput);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid profit amount");
      return;
    }
    if (!confirm(`Distribute ${amount} USDT trading profit? This will credit user wallets immediately.`)) {
      return;
    }
    setDistributing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/distribute-profit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ totalTradingProfit: amount }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Distributed to ${data.entriesCount} members`);
        setProfitInput("");
        fetchPastDistributions();
        fetchMyWallet();
      } else {
        toast.error(data.message || "Distribution failed");
      }
    } catch {
      toast.error("Distribution failed");
    } finally {
      setDistributing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-black flex items-center gap-2">
          <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" /> Profit Distribution
        </h1>
        <p className={`text-xs md:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          Level income based on personal + downline branch investment
        </p>
      </div>

      <div className={`${card} p-4 md:p-5`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Wallet Balance</p>
            <p className="text-xl md:text-2xl font-black text-emerald-400">
              {loadingWallet ? "..." : `${walletBalance.toFixed(2)} USDT`}
            </p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className={`${card} p-4 md:p-5 border-l-4 border-red-500`}>
          <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-400" /> Distribute New Profit (Admin)
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              value={profitInput}
              onChange={(e) => setProfitInput(e.target.value)}
              placeholder="Total trading profit (USDT)"
              className={`flex-1 rounded-xl px-4 py-3 text-sm ${
                isDarkMode
                  ? "bg-white/5 border border-white/10 text-white placeholder-white/30"
                  : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
            />
            <button
              onClick={handleDistribute}
              disabled={distributing}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-5 py-3 rounded-xl text-sm disabled:opacity-50"
            >
              {distributing ? "Distributing..." : "Distribute Now"}
            </button>
          </div>
          <p className={`text-xs mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            30% goes to compensation pool → 50% level income, 25% salary, 25% leadership.
            Wallets are credited immediately and cannot be undone.
          </p>
        </div>
      )}

      {isAdmin && (
        <div className={`${card} overflow-hidden`}>
          <div className={`px-4 py-3 border-b ${isDarkMode ? "border-white/5" : "border-gray-100"}`}>
            <p className="font-bold text-sm">Distribution History</p>
          </div>
          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-t-transparent border-red-500 rounded-full animate-spin" />
            </div>
          ) : pastDistributions.length === 0 ? (
            <p className={`p-6 text-center text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              No distributions yet.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {pastDistributions.map((d) => (
                <div key={d._id}>
                  <button
                    onClick={() =>
                      setExpandedDistribution(expandedDistribution === d._id ? null : d._id)
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 text-left ${
                      isDarkMode ? "hover:bg-white/3" : "hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{d.totalTradingProfit} USDT profit</p>
                      <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                        {new Date(d.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-xs text-emerald-400 font-semibold">
                      {d.entries.length} members paid
                    </p>
                  </button>

                  {expandedDistribution === d._id && (
                    <div className="overflow-x-auto px-4 pb-4">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                            <th className="text-left py-2">Member</th>
                            <th className="text-right py-2">Level</th>
                            <th className="text-right py-2">Branch Inv.</th>
                            <th className="text-right py-2">Ratio</th>
                            <th className="text-right py-2">Income</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-100"}`}>
                          {d.entries.map((e, idx) => (
                            <tr key={idx}>
                              <td className="py-2">{e.userId?.name || "—"}</td>
                              <td className="py-2 text-right">{e.level}</td>
                              <td className="py-2 text-right">{e.branchInvestment.toFixed(2)}</td>
                              <td className="py-2 text-right">{(e.ratio * 100).toFixed(2)}%</td>
                              <td className="py-2 text-right text-emerald-400 font-bold">
                                {e.income.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={`${card} overflow-hidden`}>
        <div className={`px-4 py-3 border-b ${isDarkMode ? "border-white/5" : "border-gray-100"}`}>
          <p className="font-bold text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> My Income History
          </p>
        </div>
        {loadingWallet ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-t-transparent border-red-500 rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-10 h-10 mx-auto mb-2 text-gray-500" />
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              No income yet. Build your network and invest to start earning level income.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs uppercase ${isDarkMode ? "bg-white/3 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Level</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Branch Investment</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">Ratio</th>
                  <th className="px-4 py-3 text-right font-bold text-emerald-400">Income</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-100"}`}>
                {history.map((h) => (
                  <tr key={h.distributionId} className={isDarkMode ? "hover:bg-white/3" : "hover:bg-gray-50"}>
                    <td className="px-4 py-3 text-xs">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">L{h.level}</td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      {h.branchInvestment?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      {(h.ratio * 100)?.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400">
                      {h.income?.toFixed(2)} USDT
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}