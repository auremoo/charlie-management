"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { VigilancePoint } from "@/lib/types";

const severityConfig = {
  danger: { bg: "bg-red-50/60", border: "border-red-200/60", text: "text-red-900" },
  warning: { bg: "bg-amber-50/60", border: "border-amber-200/60", text: "text-amber-900" },
  info: { bg: "bg-sky-50/60", border: "border-sky-200/60", text: "text-sky-900" },
};

export default function SitterVigilancePage() {
  const { id: petId } = useParams<{ id: string }>();
  const [points, setPoints] = useState<VigilancePoint[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("vigilance_points")
        .select("*")
        .eq("pet_id", petId)
        .order("sort_order");
      setPoints(data ?? []);
    }
    load();
  }, [petId]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-charlie-900">
          Points de vigilance
        </h1>
        <p className="text-charlie-400 text-sm font-light mt-1">
          Consignes importantes
        </p>
      </div>

      <div className="space-y-3">
        {points.map((point) => {
          const cfg = severityConfig[point.severity as keyof typeof severityConfig];
          return (
            <div
              key={point.id}
              className={`rounded-2xl border p-5 space-y-2 ${cfg.bg} ${cfg.border}`}
            >
              <p className={`font-medium text-sm ${cfg.text}`}>
                {point.title}
              </p>
              {point.description && (
                <p className="text-charlie-500 text-sm font-light leading-relaxed">
                  {point.description}
                </p>
              )}
            </div>
          );
        })}

        {points.length === 0 && (
          <p className="text-center text-charlie-300 py-16 text-sm font-light">
            Aucun point de vigilance
          </p>
        )}
      </div>
    </div>
  );
}
