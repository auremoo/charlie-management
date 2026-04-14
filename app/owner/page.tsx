import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

export default async function OwnerDashboard() {
  const supabase = await createClient();
  const [{ data: photos }, { data: news }] = await Promise.all([
    supabase.from("photos").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("news").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  const allItems = [
    ...(photos ?? []).map((p) => ({ type: "photo" as const, ...p })),
    ...(news ?? []).map((n) => ({ type: "news" as const, ...n, url: undefined })),
  ].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charlie-800">Nouvelles de Charlie</h1>
        <p className="text-gray-500 text-sm mt-1">
          Photos et messages du cat sitter
        </p>
      </div>

      {allItems.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="text-5xl">🕐</div>
          <p className="text-gray-400">En attente des premières nouvelles…</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {item.type === "photo" && item.url && (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.url}
                    alt={item.caption ?? "Photo de Charlie"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 512px"
                  />
                </div>
              )}
              <div className="p-4 space-y-1">
                {item.type === "news" && (
                  <div className="flex items-start gap-2">
                    <span className="text-xl">💬</span>
                    <p className="text-gray-800">{item.content}</p>
                  </div>
                )}
                {item.type === "photo" && item.caption && (
                  <p className="text-gray-700 text-sm">{item.caption}</p>
                )}
                <p className="text-gray-400 text-xs">
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
