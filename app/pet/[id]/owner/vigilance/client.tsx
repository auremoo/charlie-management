"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { VigilancePoint } from "@/lib/types";

const severities = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Attention" },
  { value: "danger", label: "Danger" },
];

const severityStyle: Record<string, string> = {
  danger: "border-l-2 border-red-300",
  warning: "border-l-2 border-amber-300",
  info: "border-l-2 border-sky-300",
};

export default function OwnerVigilancePage() {
  const { id: petId } = useParams<{ id: string }>();
  const [points, setPoints] = useState<VigilancePoint[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"info" | "warning" | "danger">("warning");
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [petId]);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("vigilance_points")
      .select("*")
      .eq("pet_id", petId)
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
      pet_id: petId,
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
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-charlie-900">
          Vigilance
        </h1>
        <p className="text-charlie-400 text-sm font-light mt-1">
          Consignes de sécurité
        </p>
      </div>

      {/* Form */}
      <form onSubmit={add} className="space-y-4">
        <h2 className="text-xs text-charlie-400 font-medium uppercase tracking-widest">
          Nouveau point
        </h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
          required
          className="w-full px-0 py-3 bg-transparent border-0 border-b border-charlie-200 focus:border-charlie-500 focus:outline-none focus:ring-0 text-sm text-charlie-900 placeholder-charlie-300 transition-colors"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          rows={2}
          className="w-full px-0 py-3 bg-transparent border-0 border-b border-charlie-200 focus:border-charlie-500 focus:outline-none focus:ring-0 text-sm text-charlie-900 placeholder-charlie-300 transition-colors resize-none"
        />
        <div className="flex gap-2">
          {severities.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSeverity(s.value as typeof severity)}
              className={`flex-1 py-2.5 rounded-full text-xs font-medium tracking-wide border transition-all ${
                severity === s.value
                  ? "border-charlie-900 bg-charlie-900 text-white"
                  : "border-charlie-200 text-charlie-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-charlie-900 hover:bg-charlie-800 disabled:bg-charlie-200 text-white text-sm font-medium tracking-wide rounded-full transition-colors"
        >
          {saving ? "Ajout..." : "Ajouter"}
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        {points.map((point) => (
          <div
            key={point.id}
            className={`bg-white rounded-2xl shadow-sm shadow-charlie-100 p-4 flex items-start gap-3 ${severityStyle[point.severity]}`}
          >
            <div className="flex-1 space-y-0.5">
              <p className="text-sm font-medium text-charlie-900">{point.title}</p>
              {point.description && (
                <p className="text-xs text-charlie-400 font-light">{point.description}</p>
              )}
            </div>
            <button
              onClick={() => remove(point.id)}
              className="text-charlie-200 hover:text-red-400 transition-colors text-lg w-8 h-8 flex items-center justify-center flex-shrink-0"
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
