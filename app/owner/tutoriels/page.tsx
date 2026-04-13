"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tutorial } from "@/lib/types";

export default function OwnerTutorielsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("tutorials")
      .select("*")
      .order("sort_order");
    setTutorials(data ?? []);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("tutorials").insert({
      title: title.trim(),
      description: description.trim() || null,
      video_url: videoUrl.trim() || null,
      sort_order: tutorials.length,
    });
    setTitle("");
    setDescription("");
    setVideoUrl("");
    await load();
    setSaving(false);
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("tutorials").delete().eq("id", id);
    setTutorials((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charlie-800">Tutoriels</h1>
        <p className="text-gray-500 text-sm mt-1">Gérer les guides pour le cat sitter</p>
      </div>

      {/* Formulaire */}
      <form onSubmit={add} className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h2 className="font-semibold text-charlie-700">➕ Ajouter un tutoriel</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre (ex: Où sont les croquettes)"
          required
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-charlie-300"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (quantités, instructions…)"
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-charlie-300 resize-none"
        />
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="URL YouTube (optionnel)"
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-charlie-300"
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-charlie-500 hover:bg-charlie-600 disabled:bg-charlie-200 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          {saving ? "Ajout en cours…" : "Ajouter"}
        </button>
      </form>

      {/* Liste */}
      <div className="space-y-3">
        {tutorials.map((tuto) => (
          <div key={tuto.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {tuto.video_url ? (
              <div className="aspect-video">
                <iframe
                  src={tuto.video_url.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allowFullScreen
                  title={tuto.title}
                />
              </div>
            ) : (
              <div className="h-16 bg-charlie-50 flex items-center justify-center">
                <span className="text-charlie-300 text-2xl">🎬</span>
              </div>
            )}
            <div className="p-3 flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{tuto.title}</p>
                {tuto.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{tuto.description}</p>
                )}
              </div>
              <button
                onClick={() => remove(tuto.id)}
                className="text-gray-300 hover:text-red-400 transition-colors text-xl"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
