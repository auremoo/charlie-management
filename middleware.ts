import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Routes publiques
  if (pathname.startsWith("/login") || pathname.startsWith("/auth")) {
    return supabaseResponse;
  }

  // Non connecté → login
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Récupérer le rôle
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  // Protection des routes /owner → owner uniquement
  if (pathname.startsWith("/owner") && role !== "owner") {
    return NextResponse.redirect(new URL("/sitter/checklist", request.url));
  }

  // Protection des routes /sitter → cat_sitter + owner
  if (pathname.startsWith("/sitter") && !role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect "/" selon le rôle
  if (pathname === "/") {
    if (role === "owner") {
      return NextResponse.redirect(new URL("/owner", request.url));
    }
    return NextResponse.redirect(new URL("/sitter/checklist", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
