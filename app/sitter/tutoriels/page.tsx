import { createClient } from "@/lib/supabase/server";

export default async function TutorielsPage() {
  const supabase = await createClient();
  const { data: tutorials } = await supabase
    .from("tutorials")
    .select("*")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charlie-800">Tutoriels</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tout ce que tu dois savoir sur Charlie
        </p>
      </div>

      <div className="space-y-4">
        {(tutorials ?? []).map((tuto) => (
          <div key={tuto.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Placeholder vidéo ou player */}
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
              <div className="aspect-video bg-charlie-100 flex flex-col items-center justify-center gap-2">
                <span className="text-5xl">🎬</span>
                <span className="text-charlie-600 text-sm font-medium">
                  Vidéo à venir
                </span>
              </div>
            )}
            <div className="p-4 space-y-1">
              <h2 className="font-semibold text-charlie-800 text-base">
                {tuto.title}
              </h2>
              {tuto.description && (
                <p className="text-gray-600 text-sm">{tuto.description}</p>
              )}
            </div>
          </div>
        ))}

        {(!tutorials || tutorials.length === 0) && (
          <p className="text-center text-gray-400 py-12">
            Aucun tutoriel pour le moment
          </p>
        )}
      </div>
    </div>
  );
}
