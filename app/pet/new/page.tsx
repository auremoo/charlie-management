"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewPetPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expirée — reconnecte-toi.");
      setSaving(false);
      return;
    }

    const { data: pet, error: insertError } = await supabase
      .from("pets")
      .insert({ name: name.trim(), owner_id: user.id })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    if (pet) {
      router.replace(`/pet/${pet.id}/owner`);
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-charlie-900">
            Nouvel animal
          </h1>
          <p className="text-charlie-400 text-sm font-light">
            Créer une fiche pour votre compagnon
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-xs text-charlie-400 font-medium uppercase tracking-widest">
              Nom
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Charlie"
              required
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-charlie-200 focus:border-charlie-500 focus:outline-none focus:ring-0 text-charlie-900 placeholder-charlie-300 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-500/80 text-sm font-light">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-charlie-900 hover:bg-charlie-800 disabled:bg-charlie-200 text-white text-sm font-medium tracking-wide rounded-full transition-colors"
          >
            {saving ? "Création…" : "Créer la fiche"}
          </button>
        </form>
      </div>
    </div>
  );
}
