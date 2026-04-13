import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Vérifier si un profil existe déjà
      const { data: existing } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (!existing) {
        // Premier login → assigner le rôle selon l'email
        const isOwner = data.user.email === process.env.OWNER_EMAIL;
        await supabase.from("profiles").insert({
          id: data.user.id,
          role: isOwner ? "owner" : "cat_sitter",
          name: data.user.email?.split("@")[0] ?? null,
        });
      }

      // Récupérer le rôle pour rediriger
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "owner") {
        return NextResponse.redirect(`${origin}/owner`);
      }
      return NextResponse.redirect(`${origin}/sitter/checklist`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
