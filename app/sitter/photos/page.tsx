"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import type { NewsItem, Photo } from "@/lib/types";

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const [{ data: p }, { data: n }] = await Promise.all([
      supabase.from("photos").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("news").select("*").order("created_at", { ascending: false }).limit(10),
    ]);
    setPhotos(p ?? []);
    setNews(n ?? []);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const filename = `${user!.id}/${Date.now()}-${file.name}`;

    const { data: uploadData, error } = await supabase.storage
      .from("charlie-photos")
      .upload(filename, file);

    if (!error && uploadData) {
      const { data: { publicUrl } } = supabase.storage
        .from("charlie-photos")
        .getPublicUrl(uploadData.path);

      await supabase.from("photos").insert({
        url: publicUrl,
        caption: caption || null,
        author_id: user!.id,
      });
      setCaption("");
      await loadData();
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("news").insert({
      content: message.trim(),
      author_id: user!.id,
    });
    setMessage("");
    await loadData();
    setSending(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charlie-800">Photos & nouvelles</h1>
        <p className="text-gray-500 text-sm mt-1">
          Envoie des photos et messages à la propriétaire
        </p>
      </div>

      {/* Upload photo */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h2 className="font-semibold text-charlie-700">📸 Envoyer une photo</h2>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Légende (optionnel)"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-charlie-300"
        />
        <label
          className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors active:scale-[0.98] ${
            uploading
              ? "border-charlie-300 bg-charlie-50 text-charlie-400"
              : "border-charlie-200 hover:border-charlie-400 text-charlie-600"
          }`}
        >
          <span className="text-2xl">{uploading ? "⏳" : "📷"}</span>
          <span className="font-medium">
            {uploading ? "Envoi en cours…" : "Choisir une photo"}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Envoyer un message */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        <h2 className="font-semibold text-charlie-700">💬 Envoyer un message</h2>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Charlie va super bien !"
            className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-charlie-300"
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="px-4 py-2.5 bg-charlie-500 hover:bg-charlie-600 active:bg-charlie-700 disabled:bg-charlie-200 text-white rounded-xl font-medium transition-colors"
          >
            {sending ? "…" : "Envoyer"}
          </button>
        </form>
      </div>

      {/* News envoyées */}
      {news.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">Messages envoyés</h2>
          {news.map((n) => (
            <div key={n.id} className="bg-charlie-50 rounded-xl px-4 py-3">
              <p className="text-gray-800 text-sm">{n.content}</p>
              <p className="text-gray-400 text-xs mt-1">
                {new Date(n.created_at).toLocaleString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Galerie photos */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">Photos envoyées</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                <div className="relative aspect-square">
                  <Image
                    src={photo.url}
                    alt={photo.caption ?? "Photo de Charlie"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>
                {photo.caption && (
                  <p className="text-xs text-gray-600 px-2 py-1.5 truncate">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
