"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Pet } from "@/lib/types";

export default function HubPage() {
  const router = useRouter();
  const [ownedPets, setOwnedPets] = useState<Pet[]>([]);
  const [sittingPets, setSittingPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const [{ data: owned }, { data: sits }] = await Promise.all([
        supabase
          .from("pets")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at"),
        supabase
          .from("pet_sitters")
          .select("pet_id, pets(*)")
          .eq("sitter_id", user.id),
      ]);

      setOwnedPets(owned ?? []);
      setSittingPets(
        (sits ?? [])
          .map((s) => (s as unknown as { pets: Pet | null }).pets)
          .filter((p): p is Pet => p !== null)
      );
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-charlie-300 border-t-charlie-600 animate-spin" />
      </div>
    );
  }

  const empty = ownedPets.length === 0 && sittingPets.length === 0;

  if (empty) {
    router.replace("/onboarding");
    return null;
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto px-5 py-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-charlie-900">
          Charlie
        </h1>
        <Link
          href="/onboarding"
          className="text-xs text-charlie-400 font-light underline underline-offset-4 decoration-charlie-200"
        >
          + Ajouter
        </Link>
      </div>

      {/* My pets (owner) */}
      {ownedPets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs text-charlie-400 font-medium uppercase tracking-widest">
            Mes animaux
          </h2>
          {ownedPets.map((pet) => (
            <Link
              key={pet.id}
              href={`/pet/${pet.id}/owner`}
              className="block bg-white rounded-2xl shadow-sm shadow-charlie-100 p-5 transition-all active:scale-[0.98] hover:shadow-md"
            >
              <p className="text-sm font-medium text-charlie-900">
                {pet.name}
              </p>
              <p className="text-xs text-charlie-400 font-light mt-1">
                Propriétaire
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* My sits (sitter) */}
      {sittingPets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs text-charlie-400 font-medium uppercase tracking-widest">
            Mes gardes
          </h2>
          {sittingPets.map((pet) => (
            <Link
              key={pet.id}
              href={`/pet/${pet.id}/sitter`}
              className="block bg-white rounded-2xl shadow-sm shadow-charlie-100 p-5 transition-all active:scale-[0.98] hover:shadow-md"
            >
              <p className="text-sm font-medium text-charlie-900">
                {pet.name}
              </p>
              <p className="text-xs text-charlie-400 font-light mt-1">
                Cat sitter
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
