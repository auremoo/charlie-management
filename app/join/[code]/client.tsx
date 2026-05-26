"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ensureProfile } from "@/lib/ensure-profile";
import type { InviteCode } from "@/lib/types";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function JoinClient() {
  const { code } = useParams<{ code: string }>();
  const [error, setError] = useState(false);

  useEffect(() => {
    async function join() {
      const user = await ensureProfile();
      if (!user) {
        window.location.href = `${basePath}/login`;
        return;
      }

      const inviteSnap = await getDoc(doc(db, "invite_codes", code));
      if (!inviteSnap.exists() || inviteSnap.data().used_by) {
        setError(true);
        return;
      }

      const invite = inviteSnap.data() as InviteCode;
      const role = invite.role || "sitter";

      await setDoc(doc(db, "pet_sitters", `${invite.pet_id}_${user.uid}`), {
        id: `${invite.pet_id}_${user.uid}`,
        pet_id: invite.pet_id,
        sitter_id: user.uid,
        role,
        invited_at: new Date().toISOString(),
      });

      await updateDoc(doc(db, "invite_codes", code), { used_by: user.uid });

      const view = role === "owner" ? "owner" : "sitter";
      window.location.href = `${basePath}/pet?id=${invite.pet_id}&view=${view}`;
    }
    join();
  }, [code]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-charlie-900 text-sm font-medium">
            Code invalide ou déjà utilisé
          </p>
          <a
            href={`${basePath}/`}
            className="text-charlie-500 text-sm font-light underline underline-offset-4 decoration-charlie-200"
          >
            Retour
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-charlie-300 border-t-charlie-600 animate-spin" />
    </div>
  );
}
