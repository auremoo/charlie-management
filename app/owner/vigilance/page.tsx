"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { VigilancePoint } from "@/lib/types";

const severities = [
  { value: "info", label: "Info", icon: "ℹ️" },
  { value: "warning", label: "Attention", icon: "⚠️" },
  { value: "danger", label: "Danger", icon: "🚨" },
];

const severityColors: Record<string, string> = {
  danger: "border-l-4 border-red-400",
  warning: "border-l-4 border-amber-400",
  info: "border-l-4 border-blue-400",
};

export default function OwnerVigilancePage() {
  const [points, setPoints] = useState<VigilancePoint[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"info" | "warning" | "danger">("warning");
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("vigilance_points")
      .select("*")
      .order("sort_order");
    setPoints(data ?? []);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("vigilance_points").insert({
      title: title.trim(),
      description: description.trim() || null,
      severity,
      sort_order: points.length,
    });
    setTitle("");
    setDescription("");
    setSeverity("warning");
    await load();
    setSaving(false);
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("vigilance_points").delete().eq("id", id);
    setPoints((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charlie-800">Points de vigilance</h1>
        <p className="text-gray-500 text-sm mt-1">Gérer les consignes de sécurité</p>
      </div>

      {/* Formulaire d'ajout */}
      <form onSubmit={add} className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h2 className="font-semibold text-charlie-700">➕ Ajouter un point</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre (ex: Fenêtres)"
          required
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-charlie-300"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description détaillée (optionnel)"
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-charlie-300 resize-none"
        />
        <div className="flex gap-2">
          {severities.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSeverity(s.value as typeof severity)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors active:scale-[0.97] ${
                severity === s.value
                  ? "border-charlie-500 bg-charlie-50 text-charlie-700"
                  : "border-gray-200 text-gray-500"
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-charlie-500 hover:bg-charlie-600 active:bg-charlie-700 disabled:bg-charlie-200 text-white rounded-xl font-semibold transition-colors"
        >
          {saving ? "Ajout en cours…" : "Ajouter"}
        </button>
      </form>

      {/* Liste */}
      <div className="space-y-3">
        {points.map((point) => (
          <div
            key={point.id}
            className={`bg-white rounded-2xl shadow-sm p-4 flex items-start gap-3 ${severityColors[point.severity]}`}
          >
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{point.title}</p>
              {point.description && (
                <p className="text-sm text-gray-500 mt-0.5">{point.description}</p>
              )}
            </div>
            <button
              onClick={() => remove(point.id)}
              className="text-gray-300 hover:text-red-400 active:text-red-500 transition-colors text-xl w-10 h-10 flex items-center justify-center flex-shrink-0 -mr-2"
              aria-label="Supprimer"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
