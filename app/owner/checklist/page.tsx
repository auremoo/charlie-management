"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types";

const EMOJIS = ["🥣", "💧", "🚿", "🤗", "🐾", "🎾", "🛏️", "💊", "🧹", "🪟"];

export default function OwnerChecklistPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🐾");
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("tasks").select("*").order("sort_order");
    setTasks(data ?? []);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("tasks").insert({
      title: title.trim(),
      emoji,
      sort_order: tasks.length,
    });
    setTitle("");
    setEmoji("🐾");
    await load();
    setSaving(false);
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charlie-800">Liste des tâches</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gérer les tâches quotidiennes du cat sitter
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={add} className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h2 className="font-semibold text-charlie-700">➕ Ajouter une tâche</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nom de la tâche"
          required
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-charlie-300"
        />
        <div>
          <p className="text-xs text-gray-500 mb-2">Emoji</p>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-11 h-11 rounded-xl text-xl transition-all active:scale-95 ${
                  emoji === e
                    ? "bg-charlie-100 ring-2 ring-charlie-400"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
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
        {tasks.map((task, i) => (
          <div
            key={task.id}
            className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3"
          >
            <span className="text-2xl">{task.emoji}</span>
            <span className="flex-1 font-medium text-gray-800">{task.title}</span>
            <span className="text-xs text-gray-300">#{i + 1}</span>
            <button
              onClick={() => remove(task.id)}
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
