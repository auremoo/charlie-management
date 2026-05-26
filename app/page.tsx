"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDocs, getDoc, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Pet } from "@/lib/types";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function HubPage() {
  const router = useRouter();
  const [ownedPets, setOwnedPets] = useState<Pet[]>([]);
  const [sittingPets, setSittingPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      unsub();
      if (!firebaseUser) {
        router.replace("/login");
        return;
      }
      const uid = firebaseUser.uid;

      const [ownedSnap, memberSnap, profileSnap] = await Promise.all([
        getDocs(query(collection(db, "pets"), where("owner_id", "==", uid))),
        getDocs(query(collection(db, "pet_sitters"), where("sitter_id", "==", uid))),
        getDoc(doc(db, "users", uid)),
      ]);

      const owned = ownedSnap.docs.map(d => ({ id: d.id, ...d.data() } as Pet));
      owned.sort((a, b) => a.created_at.localeCompare(b.created_at));

      const memberships = memberSnap.docs.map(d => d.data() as { pet_id: string; role: string });
      const profileData = profileSnap.data() as { name?: string } | undefined;
      setUserName(profileData?.name ?? firebaseUser.email?.split("@")[0] ?? null);

      const seenPetIds = new Set<string>();
      const uniquePetIds = memberships.map(m => m.pet_id).filter(id => {
        if (seenPetIds.has(id)) return false;
        seenPetIds.add(id);
        return true;
      });
      const memberPetSnaps = await Promise.all(
        uniquePetIds.map(pid => getDoc(doc(db, "pets", pid)))
      );
      const memberPetMap: Record<string, Pet> = {};
      memberPetSnaps.forEach(snap => {
        if (snap.exists()) memberPetMap[snap.id] = { id: snap.id, ...snap.data() } as Pet;
      });

      const ownedIds = new Set(owned.map(p => p.id));
      const coOwned = memberships
        .filter(m => m.role === "owner" && !ownedIds.has(m.pet_id))
        .map(m => memberPetMap[m.pet_id])
        .filter((p): p is Pet => !!p);

      setOwnedPets([...owned, ...coOwned]);
      setSittingPets(
        memberships
          .filter(m => m.role !== "owner")
          .map(m => memberPetMap[m.pet_id])
          .filter((p): p is Pet => !!p)
      );
      setLoading(false);
    });
  }, [router]);

  async function handleLogout() {
    await signOut(auth);
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
              onClick={() => window.location.href = `${basePath}/pet?id=${pet.id}&view=owner`}
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
              onClick={() => window.location.href = `${basePath}/pet?id=${pet.id}&view=sitter`}
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
