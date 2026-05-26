"use client";

import { useEffect, useState } from "react";
import { usePetId } from "@/lib/hooks/use-pet-id";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import type { NewsItem, Photo } from "@/lib/types";

export default function OwnerDashboard() {
  const petId = usePetId();
  const [items, setItems] = useState<
    ((Photo & { type: "photo" }) | (NewsItem & { type: "news"; url?: undefined }))[]
  >([]);

  useEffect(() => {
    async function load() {
      const [photosSnap, newsSnap] = await Promise.all([
        getDocs(query(collection(db, "photos"), where("pet_id", "==", petId))),
        getDocs(query(collection(db, "news"), where("pet_id", "==", petId))),
      ]);

      const photos = photosSnap.docs.map(d => ({ id: d.id, ...d.data() } as Photo));
      const news = newsSnap.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem));

      const all = [
        ...photos.map(p => ({ type: "photo" as const, ...p })),
        ...news.map(n => ({ type: "news" as const, ...n, url: undefined })),
      ].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setItems(all.slice(0, 20));
    }
    load();
  }, [petId]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-charlie-900">
          Nouvelles
        </h1>
        <p className="text-charlie-400 text-sm font-light mt-1">
          Photos et messages du cat sitter
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-charlie-300 text-sm font-light">
            En attente des premières nouvelles
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm shadow-charlie-100 overflow-hidden"
            >
              {item.type === "photo" && item.url && (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.url}
                    alt={item.caption ?? "Photo"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 512px"
                  />
                </div>
              )}
              <div className="p-5 space-y-2">
                {item.type === "news" && (
                  <p className="text-charlie-900 text-sm font-light leading-relaxed">
                    {item.content}
                  </p>
                )}
                {item.type === "photo" && item.caption && (
                  <p className="text-charlie-700 text-sm font-light">
                    {item.caption}
                  </p>
                )}
                <p className="text-charlie-300 text-xs font-light">
                  {new Date(item.created_at).toLocaleString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
