"use client";

import { useEffect, useState } from "react";
import { usePetId } from "@/lib/hooks/use-pet-id";
import { createClient } from "@/lib/supabase/client";
import type { Tutorial } from "@/lib/types";

export default function OwnerTutorielsPage() {
  const petId = usePetId();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [petId]);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("tutorials")
      .select("*")
      .eq("pet_id", petId)
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
      pet_id: petId,
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
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-charlie-900">
          Guides
        </h1>
        <p className="text-charlie-400 text-sm font-light mt-1">
          Guides pour le cat sitter
        </p>
      </div>

      {/* Form */}
      <form onSubmit={add} className="space-y-4">
        <h2 className="text-xs text-charlie-400 font-medium uppercase tracking-widest">
          Nouveau guide
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
          placeholder="Instructions (optionnel)"
          rows={2}
          className="w-full px-0 py-3 bg-transparent border-0 border-b border-charlie-200 focus:border-charlie-500 focus:outline-none focus:ring-0 text-sm text-charlie-900 placeholder-charlie-300 transition-colors resize-none"
        />
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="URL YouTube (optionnel)"
          className="w-full px-0 py-3 bg-transparent border-0 border-b border-charlie-200 focus:border-charlie-500 focus:outline-none focus:ring-0 text-sm text-charlie-900 placeholder-charlie-300 transition-colors"
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-charlie-900 hover:bg-charlie-800 disabled:bg-charlie-200 text-white text-sm font-medium tracking-wide rounded-full transition-colors"
        >
          {saving ? "Ajout..." : "Ajouter"}
        </button>
      </form>

      {/* List */}
      <div className="space-y-3">
        {tutorials.map((tuto) => (
          <div
            key={tuto.id}
            className="bg-white rounded-2xl shadow-sm shadow-charlie-100 overflow-hidden"
          >
            {tuto.video_url && (
              <div className="aspect-video">
                <iframe
                  src={tuto.video_url.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allowFullScreen
                  title={tuto.title}
                />
              </div>
            )}
            <div className="p-4 flex items-start gap-3">
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium text-charlie-900">{tuto.title}</p>
                {tuto.description && (
                  <p className="text-xs text-charlie-400 font-light">{tuto.description}</p>
                )}
              </div>
              <button
                onClick={() => remove(tuto.id)}
                className="text-charlie-200 hover:text-red-400 transition-colors text-lg w-8 h-8 flex items-center justify-center flex-shrink-0"
                aria-label="Supprimer"
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
