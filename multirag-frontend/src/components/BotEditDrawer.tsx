"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface BotEditDrawerProps {
  botId: string;
  onClose: () => void;
  onSaved: () => void;
}

interface BotFormData {
  name: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  status: string;
  isPublic: boolean;
}

export default function BotEditDrawer({
  botId,
  onClose,
  onSaved,
}: BotEditDrawerProps) {
  const router = useRouter();
  const [form, setForm] = useState<BotFormData>({
    name: "",
    systemPrompt: "",
    model: "",
    temperature: 0.7,
    maxTokens: 4096,
    status: "draft",
    isPublic: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedBot, setSavedBot] = useState<BotFormData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBot = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API}/api/bots/${botId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const data = await res.json();

        const botData = data.bot || data;

        setForm({
          name: botData.name || "",
          systemPrompt: botData.systemPrompt || "",
          model: botData.model || "",
          temperature: botData.temperature ?? 0.7,
          maxTokens: botData.maxTokens ?? 4096,
          status: botData.status || "draft",
          isPublic: botData.isPublic ?? false,
        });
        setSavedBot({
          name: botData.name || "",
          systemPrompt: botData.systemPrompt || "",
          model: botData.model || "",
          temperature: botData.temperature ?? 0.7,
          maxTokens: botData.maxTokens ?? 4096,
          status: botData.status || "draft",
          isPublic: botData.isPublic ?? false,
        });
      } catch {
        setError("Failed to load bot details");
      } finally {
        setLoading(false);
      }
    };

    fetchBot();
  }, [botId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "temperature"
            ? parseFloat(value)
            : name === "maxTokens"
              ? parseInt(value, 10)
              : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Bot name is required");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/bots/${botId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          systemPrompt: form.systemPrompt,
          model: form.model,
          temperature: form.temperature,
          maxTokens: form.maxTokens,
          status: form.status,
          isPublic: form.isPublic,
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update bot");
        return;
      }

      setSavedBot({ ...form });
      onSaved();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    savedBot &&
    (savedBot.name !== form.name ||
      savedBot.systemPrompt !== form.systemPrompt ||
      savedBot.model !== form.model ||
      savedBot.temperature !== form.temperature ||
      savedBot.maxTokens !== form.maxTokens ||
      savedBot.status !== form.status ||
      savedBot.isPublic !== form.isPublic);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-neutral-900 border-l border-white/10 z-50 shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Edit Bot</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            aria-label="Close drawer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Bot Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="My Chatbot"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                System Prompt
              </label>
              <textarea
                name="systemPrompt"
                value={form.systemPrompt}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="You are a helpful assistant..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Model
              </label>
              <select
                name="model"
                value={form.model}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="gemini-pro">Gemini Pro</option>
                <option value="gemini-ultra">Gemini Ultra</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Temperature
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="2"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                  Max Tokens
                </label>
                <input
                  type="number"
                  name="maxTokens"
                  value={form.maxTokens}
                  onChange={handleChange}
                  step="1"
                  min="1"
                  max="131072"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isPublic"
                checked={form.isPublic}
                onChange={handleChange}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-neutral-300">Public bot</span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
