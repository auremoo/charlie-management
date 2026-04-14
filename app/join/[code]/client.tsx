"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function JoinClient() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    async function join() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: invite } = await supabase
        .from("invite_codes")
        .select("id, pet_id")
        .eq("code", code)
        .is("used_by", null)
        .single();

      if (!invite) {
        setError(true);
        return;
      }

      await supabase.from("pet_sitters").insert({
        pet_id: invite.pet_id,
        sitter_id: user.id,
      });

      await supabase
        .from("invite_codes")
        .update({ used_by: user.id })
        .eq("id", invite.id);

      router.replace(`/pet/${invite.pet_id}/sitter`);
    }
    join();
  }, [code, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-charlie-900 text-sm font-medium">
            Code invalide ou déjà utilisé
          </p>
          <a
            href="/charlie-management/"
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
