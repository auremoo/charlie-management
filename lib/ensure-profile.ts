import { createClient } from "@/lib/supabase/client";

export async function ensureProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existing) return user;

  await supabase.from("profiles").insert({
    id: user.id,
    name: user.email?.split("@")[0] ?? null,
  });

  return user;
}
