"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BotEditDrawer from "../../../components/BotEditDrawer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Bot {
  id: string;
  name: string;
  slug: string;
  model: string;
  status: string;
  messageCount: number;
  lastActiveAt: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ManageBotsPage() {
  const router = useRouter();
  const [bots, setBots] = useState<Bot[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchBots = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search: debouncedSearch,
      });
      const res = await fetch(`${API}/api/bots/user?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to fetch bots");
        return;
      }

      setBots(data.bots);
      setPagination(data.pagination);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const handleEdit = (botId: string) => {
    setSelectedBotId(botId);
    setDrawerOpen(true);
  };

  const handleDelete = async (botId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API}/api/bots/${botId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete bot");
        return;
      }

      setConfirmDelete(null);
      fetchBots();
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleToggleStatus = async (botId: string, currentStatus: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      const res = await fetch(`${API}/api/bots/${botId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update status");
        return;
      }

      fetchBots();
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedBotId(null);
  };

  const handleDrawerSaved = () => {
    handleDrawerClose();
    fetchBots();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "inactive":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "draft":
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
      case "archived":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Bots</h1>
            <p className="text-neutral-400 text-sm mt-1">
              View and manage your chatbot configurations
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bots by name..."
            className="w-full max-w-md px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-white/5 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : bots.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg">No bots found</p>
            <p className="text-neutral-600 text-sm mt-2">
              {debouncedSearch
                ? "Try a different search term"
                : "Create your first bot to get started"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {bots.map((bot) => (
                <div
                  key={bot.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-semibold truncate">
                          {bot.name}
                        </h3>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full border font-medium capitalize ${statusColor(bot.status)}`}
                        >
                          {bot.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                        <span>Model: {bot.model}</span>
                        <span>
                          Messages: {bot.messageCount.toLocaleString()}
                        </span>
                        {bot.lastActiveAt && (
                          <span>
                            Last active:{" "}
                            {new Date(bot.lastActiveAt).toLocaleDateString()}
                          </span>
                        )}
                        <span>
                          Created:{" "}
                          {new Date(bot.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() =>
                          handleToggleStatus(bot.id, bot.status)
                        }
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          bot.status === "active"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
                            : "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                        }`}
                      >
                        {bot.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleEdit(bot.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/20 text-neutral-300 hover:bg-white/10 transition-colors"
                      >
                        Edit
                      </button>
                      {confirmDelete === bot.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(bot.id)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 text-neutral-400 border border-white/20 hover:bg-white/20 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(bot.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-transparent text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-neutral-400 px-4">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {drawerOpen && selectedBotId && (
        <BotEditDrawer
          botId={selectedBotId}
          onClose={handleDrawerClose}
          onSaved={handleDrawerSaved}
        />
      )}
    </div>
  );
}
