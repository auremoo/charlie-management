"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { usePetNavigation } from "@/lib/hooks/use-pet-navigation";
import type { Pet } from "@/lib/types";

export default function HubPage() {
  const router = useRouter();
  const { navigateToPet } = usePetNavigation();
  const [ownedPets, setOwnedPets] = useState<Pet[]>([]);
  const [sittingPets, setSittingPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

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

      const [{ data: owned }, { data: memberOf }, { data: profile }] =
        await Promise.all([
          supabase
            .from("pets")
            .select("*")
            .eq("owner_id", user.id)
            .order("created_at"),
          supabase
            .from("pet_sitters")
            .select("pet_id, role, pets(*)")
            .eq("sitter_id", user.id),
          supabase
            .from("profiles")
            .select("name")
            .eq("id", user.id)
            .single(),
        ]);

      setUserName(profile?.name ?? user.email?.split("@")[0] ?? null);

      const ownedIds = new Set((owned ?? []).map((p) => p.id));
      const coOwned = (memberOf ?? [])
        .filter(
          (m) =>
            (m as unknown as { role: string }).role === "owner" &&
            !ownedIds.has(m.pet_id)
        )
        .map((m) => (m as unknown as { pets: Pet | null }).pets)
        .filter((p): p is Pet => p !== null);

      setOwnedPets([...(owned ?? []), ...coOwned]);
      setSittingPets(
        (memberOf ?? [])
          .filter((m) => (m as unknown as { role: string }).role !== "owner")
          .map((s) => (s as unknown as { pets: Pet | null }).pets)
          .filter((p): p is Pet => p !== null)
      );
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

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
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-charlie-900">
            Charlie
          </h1>
          {userName && (
            <p className="text-xs text-charlie-400 font-light mt-0.5">
              {userName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/onboarding"
            className="text-xs text-charlie-400 font-light underline underline-offset-4 decoration-charlie-200"
          >
            + Ajouter
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs text-charlie-300 font-light underline underline-offset-4 decoration-charlie-100 hover:text-charlie-500 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* My pets (owner) */}
      {ownedPets.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs text-charlie-400 font-medium uppercase tracking-widest">
            Mes animaux
          </h2>
          {ownedPets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => navigateToPet(pet.id, "owner")}
              className="block w-full text-left bg-white rounded-2xl shadow-sm shadow-charlie-100 p-5 transition-all active:scale-[0.98] hover:shadow-md"
            >
              <p className="text-sm font-medium text-charlie-900">
                {pet.name}
              </p>
              <p className="text-xs text-charlie-400 font-light mt-1">
                Propriétaire
              </p>
            </button>
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
            <button
              key={pet.id}
              onClick={() => navigateToPet(pet.id, "sitter")}
              className="block w-full text-left bg-white rounded-2xl shadow-sm shadow-charlie-100 p-5 transition-all active:scale-[0.98] hover:shadow-md"
            >
              <p className="text-sm font-medium text-charlie-900">
                {pet.name}
              </p>
              <p className="text-xs text-charlie-400 font-light mt-1">
                Cat sitter
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
