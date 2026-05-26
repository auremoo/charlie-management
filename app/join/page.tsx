"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { InviteCode } from "@/lib/types";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setJoining(true);
    setError(null);

    const user = auth.currentUser;
    if (!user) {
      setError("Session expirée — reconnecte-toi.");
      setJoining(false);
      return;
    }

    const inviteSnap = await getDoc(doc(db, "invite_codes", code.trim()));
    if (!inviteSnap.exists() || inviteSnap.data().used_by) {
      setError("Code invalide ou déjà utilisé");
      setJoining(false);
      return;
    }

    const invite = inviteSnap.data() as InviteCode;
    const sittersRef = doc(db, "pet_sitters", `${invite.pet_id}_${user.uid}`);
    await setDoc(sittersRef, {
      id: `${invite.pet_id}_${user.uid}`,
      pet_id: invite.pet_id,
      sitter_id: user.uid,
      role: "sitter",
      invited_at: new Date().toISOString(),
    });

    await updateDoc(doc(db, "invite_codes", code.trim()), { used_by: user.uid });

    router.replace(`/pet/${invite.pet_id}/sitter`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-charlie-900">
            Rejoindre
          </h1>
          <p className="text-charlie-400 text-sm font-light">
            Entrer le code d&apos;invitation du propriétaire
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs text-charlie-400 font-medium uppercase tracking-widest">
              Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="abc12345"
              required
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-charlie-200 focus:border-charlie-500 focus:outline-none focus:ring-0 text-center font-mono text-lg tracking-[0.2em] text-charlie-900 placeholder-charlie-300 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-500/80 text-sm font-light text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={joining}
            className="w-full py-3.5 bg-charlie-900 hover:bg-charlie-800 disabled:bg-charlie-200 text-white text-sm font-medium tracking-wide rounded-full transition-colors"
          >
            {joining ? "Connexion…" : "Rejoindre"}
          </button>
        </form>
      </div>
    </div>
  );
}
