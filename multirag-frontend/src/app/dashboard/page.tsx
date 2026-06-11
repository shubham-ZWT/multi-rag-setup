"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface AnalyticsSummary {
  totalMessages: number;
  totalConversations: number;
  uniqueVisitors: number;
  totalTokensUsed: number;
  avgLatencyMs: number;
  thumbsUpPercent: number;
}

interface DailyRow {
  date: string;
  totalMessages: number;
  totalConversations: number;
  uniqueVisitors: number;
  totalTokensUsed: number;
  avgLatencyMs: number;
  thumbsUp: number;
  thumbsDown: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [botCount, setBotCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [analyticsRes, botsRes] = await Promise.all([
        fetch(`${API}/api/analytics/user`, { headers }),
        fetch(`${API}/api/bots/user?limit=1`, { headers }),
      ]);

      if (analyticsRes.status === 401 || botsRes.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const analyticsData = await analyticsRes.json();
      const botsData = await botsRes.json();

      setSummary(analyticsData.summary);
      setDaily(analyticsData.daily || []);
      setBotCount(botsData.pagination?.total || 0);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <Link
            href="/dashboard/manage-bots"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Manage Bots
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 bg-white/5 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                label="Total Bots"
                value={botCount}
              />
              <MetricCard
                label="Conversations"
                value={summary?.totalConversations ?? 0}
              />
              <MetricCard
                label="Messages"
                value={summary?.totalMessages ?? 0}
              />
              <MetricCard
                label="Unique Visitors"
                value={summary?.uniqueVisitors ?? 0}
              />
              <MetricCard
                label="Tokens Used"
                value={(summary?.totalTokensUsed ?? 0).toLocaleString()}
              />
              <MetricCard
                label="Avg Latency"
                value={`${summary?.avgLatencyMs ?? 0}ms`}
              />
              <MetricCard
                label="Satisfaction"
                value={`${summary?.thumbsUpPercent ?? 0}%`}
              />
            </div>

            {daily.length > 0 && (
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Recent Activity (Last 30 Days)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-neutral-400">
                        <th className="pb-3 pr-4 font-medium">Date</th>
                        <th className="pb-3 pr-4 font-medium">Conversations</th>
                        <th className="pb-3 pr-4 font-medium">Messages</th>
                        <th className="pb-3 pr-4 font-medium">Visitors</th>
                        <th className="pb-3 pr-4 font-medium">Tokens</th>
                        <th className="pb-3 pr-4 font-medium">👍</th>
                        <th className="pb-3 font-medium">👎</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daily.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-white/5 text-white/80"
                        >
                          <td className="py-3 pr-4">
                            {new Date(row.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 pr-4">{row.totalConversations}</td>
                          <td className="py-3 pr-4">{row.totalMessages}</td>
                          <td className="py-3 pr-4">{row.uniqueVisitors}</td>
                          <td className="py-3 pr-4">
                            {row.totalTokensUsed.toLocaleString()}
                          </td>
                          <td className="py-3 pr-4">{row.thumbsUp}</td>
                          <td className="py-3">{row.thumbsDown}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,

}: {
  label: string;
  value: string | number;

}) {
  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 p-5">
      <div className="flex items-center gap-3 mb-2">
        
        <p className="text-neutral-400 text-sm">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
