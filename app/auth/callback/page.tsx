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

      const { data: existing } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!existing) {
        const isOwner =
          data.user.email === process.env.NEXT_PUBLIC_OWNER_EMAIL;
        await supabase.from("profiles").insert({
          id: data.user.id,
          role: isOwner ? "owner" : "cat_sitter",
          name: data.user.email?.split("@")[0] ?? null,
        });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "owner") {
        router.replace("/owner");
      } else {
        router.replace("/sitter/checklist");
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
            href="/login"
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
