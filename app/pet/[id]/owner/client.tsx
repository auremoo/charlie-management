"use client";

import { useEffect, useState } from "react";
import { usePetId } from "@/lib/hooks/use-pet-id";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import type { NewsItem, Photo } from "@/lib/types";

export default function OwnerDashboard() {
  const petId = usePetId();
  const [items, setItems] = useState<
    ((Photo & { type: "photo" }) | (NewsItem & { type: "news"; url?: undefined }))[]
  >([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: photos }, { data: news }] = await Promise.all([
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
          .limit(20),
      ]);

      const all = [
        ...(photos ?? []).map((p) => ({ type: "photo" as const, ...p })),
        ...(news ?? []).map((n) => ({ type: "news" as const, ...n, url: undefined })),
      ].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setItems(all);
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
