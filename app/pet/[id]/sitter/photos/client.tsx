"use client";

import { useEffect, useRef, useState } from "react";
import { usePetId } from "@/lib/hooks/use-pet-id";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compress-image";
import Image from "next/image";
import type { NewsItem, Photo } from "@/lib/types";

export default function SitterPhotosPage() {
  const petId = usePetId();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [petId]);

  async function loadData() {
    const supabase = createClient();
    const [{ data: p }, { data: n }] = await Promise.all([
      supabase
        .from("photos")
        .select("*")
        .eq("pet_id", petId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("news")
        .select("*")
        .eq("pet_id", petId)
        .order("created_at", { ascending: false })
        .limit(10),
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
    const compressed = await compressImage(file);
    const filename = `${user!.id}/${Date.now()}-${compressed.name}`;

    const { data: uploadData, error } = await supabase.storage
      .from("charlie-photos")
      .upload(filename, compressed);

    if (!error && uploadData) {
      const { data: { publicUrl } } = supabase.storage
        .from("charlie-photos")
        .getPublicUrl(uploadData.path);

      await supabase.from("photos").insert({
        url: publicUrl,
        caption: caption || null,
        author_id: user!.id,
        pet_id: petId,
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
      pet_id: petId,
    });
    setMessage("");
    await loadData();
    setSending(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-charlie-900">
          Photos & nouvelles
        </h1>
        <p className="text-charlie-400 text-sm font-light mt-1">
          Partager des nouvelles de Charlie
        </p>
      </div>

      {/* Upload photo */}
      <div className="space-y-3">
        <h2 className="text-xs text-charlie-400 font-medium uppercase tracking-widest">
          Photo
        </h2>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Légende (optionnel)"
          className="w-full px-0 py-3 bg-transparent border-0 border-b border-charlie-200 focus:border-charlie-500 focus:outline-none focus:ring-0 text-sm text-charlie-900 placeholder-charlie-300 transition-colors"
        />
        <label
          className={`flex items-center justify-center w-full py-5 rounded-2xl border border-dashed cursor-pointer transition-all active:scale-[0.98] ${
            uploading
              ? "border-charlie-300 bg-charlie-100/50 text-charlie-400"
              : "border-charlie-200 hover:border-charlie-400 text-charlie-500"
          }`}
        >
          <span className="text-sm font-light">
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

      {/* Message */}
      <div className="space-y-3">
        <h2 className="text-xs text-charlie-400 font-medium uppercase tracking-widest">
          Message
        </h2>
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Donner des nouvelles…"
            className="flex-1 px-0 py-3 bg-transparent border-0 border-b border-charlie-200 focus:border-charlie-500 focus:outline-none focus:ring-0 text-sm text-charlie-900 placeholder-charlie-300 transition-colors"
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="px-5 py-2.5 bg-charlie-900 hover:bg-charlie-800 disabled:bg-charlie-200 text-white text-sm font-medium rounded-full transition-colors flex-shrink-0"
          >
            {sending ? "…" : "Envoyer"}
          </button>
        </form>
      </div>

      {/* News */}
      {news.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs text-charlie-400 font-medium uppercase tracking-widest">
            Messages envoyés
          </h2>
          {news.map((n) => (
            <div key={n.id} className="py-3 border-b border-charlie-100 last:border-0">
              <p className="text-sm text-charlie-900 font-light">{n.content}</p>
              <p className="text-charlie-300 text-xs font-light mt-1">
                {new Date(n.created_at).toLocaleString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Gallery */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs text-charlie-400 font-medium uppercase tracking-widest">
            Photos
          </h2>
          <div className="grid grid-cols-2 gap-1.5">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-xl overflow-hidden bg-charlie-100">
                <div className="relative aspect-square">
                  <Image
                    src={photo.url}
                    alt={photo.caption ?? "Charlie"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>
                {photo.caption && (
                  <p className="text-xs text-charlie-500 font-light px-2.5 py-2 truncate">
                    {photo.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
