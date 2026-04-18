"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/ensure-profile";

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

      const supabase = createClient();

      const { data: invite } = await supabase
        .from("invite_codes")
        .select("id, pet_id, role")
        .eq("code", code)
        .is("used_by", null)
        .single();

      if (!invite) {
        setError(true);
        return;
      }

      const role = invite.role || "sitter";

      await supabase.from("pet_sitters").insert({
        pet_id: invite.pet_id,
        sitter_id: user.id,
        role,
      });

      await supabase
        .from("invite_codes")
        .update({ used_by: user.id })
        .eq("id", invite.id);

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
