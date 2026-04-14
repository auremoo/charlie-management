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
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-charlie-900">
          Tâches
        </h1>
        <p className="text-charlie-400 text-sm font-light mt-1">
          Tâches quotidiennes du cat sitter
        </p>
      </div>

      {/* Form */}
      <form onSubmit={add} className="space-y-4">
        <h2 className="text-xs text-charlie-400 font-medium uppercase tracking-widest">
          Nouvelle tâche
        </h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nom de la tâche"
          required
          className="w-full px-0 py-3 bg-transparent border-0 border-b border-charlie-200 focus:border-charlie-500 focus:outline-none focus:ring-0 text-sm text-charlie-900 placeholder-charlie-300 transition-colors"
        />
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-full text-lg transition-all active:scale-95 ${
                emoji === e
                  ? "bg-charlie-900 ring-1 ring-charlie-900 ring-offset-2"
                  : "bg-charlie-100/60 hover:bg-charlie-100"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-charlie-900 hover:bg-charlie-800 disabled:bg-charlie-200 text-white text-sm font-medium tracking-wide rounded-full transition-colors"
        >
          {saving ? "Ajout…" : "Ajouter"}
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <div
            key={task.id}
            className="bg-white rounded-2xl shadow-sm shadow-charlie-100 p-4 flex items-center gap-4"
          >
            <span className="text-xl">{task.emoji}</span>
            <span className="flex-1 text-sm font-medium text-charlie-900">
              {task.title}
            </span>
            <span className="text-xs text-charlie-200 tabular-nums">{i + 1}</span>
            <button
              onClick={() => remove(task.id)}
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
