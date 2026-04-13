import { createClient } from "@/lib/supabase/server";

const severityConfig = {
  danger: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "🚨",
    label: "text-red-800",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "⚠️",
    label: "text-amber-800",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "ℹ️",
    label: "text-blue-800",
  },
};

export default async function VigilancePage() {
  const supabase = await createClient();
  const { data: points } = await supabase
    .from("vigilance_points")
    .select("*")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charlie-800">Points de vigilance</h1>
        <p className="text-gray-500 text-sm mt-1">
          Choses importantes à ne pas oublier
        </p>
      </div>

      <div className="space-y-3">
        {(points ?? []).map((point) => {
          const cfg = severityConfig[point.severity as keyof typeof severityConfig];
          return (
            <div
              key={point.id}
              className={`rounded-2xl border-2 p-4 space-y-1 ${cfg.bg} ${cfg.border}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{cfg.icon}</span>
                <span className={`font-semibold text-base ${cfg.label}`}>
                  {point.title}
                </span>
              </div>
              {point.description && (
                <p className="text-gray-700 text-sm pl-8">{point.description}</p>
              )}
            </div>
          );
        })}

        {(!points || points.length === 0) && (
          <p className="text-center text-gray-400 py-12">
            Aucun point de vigilance pour le moment
          </p>
        )}
      </div>
    </div>
  );
}
