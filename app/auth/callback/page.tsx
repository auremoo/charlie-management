"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      if (!code) {
        setError(true);
        return;
      }

      const supabase = createClient();
      const { data, error: authError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (authError || !data.user) {
        setError(true);
        return;
      }

      // Créer profil si premier login (pas de rôle — le rôle est contextuel par pet)
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existing) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          name: data.user.email?.split("@")[0] ?? null,
        });
      }

      // Vérifier si l'utilisateur a déjà des pets ou des gardes
      const [{ data: ownedPets }, { data: sits }] = await Promise.all([
        supabase.from("pets").select("id").eq("owner_id", data.user.id).limit(1),
        supabase.from("pet_sitters").select("id").eq("sitter_id", data.user.id).limit(1),
      ]);

      const hasPets = (ownedPets?.length ?? 0) > 0;
      const hasSits = (sits?.length ?? 0) > 0;

      if (hasPets || hasSits) {
        router.replace("/");
      } else {
        router.replace("/onboarding");
      }
    }

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-charlie-900 text-sm font-medium">
            Erreur de connexion
          </p>
          <a
            href="/charlie-management/login"
            className="text-charlie-500 text-sm font-light underline underline-offset-4 decoration-charlie-200"
          >
            Réessayer
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

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-charlie-300 border-t-charlie-600 animate-spin" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
