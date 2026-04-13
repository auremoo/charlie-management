import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const navItems = [
  { href: "/sitter/checklist", label: "Tâches", emoji: "✅" },
  { href: "/sitter/vigilance", label: "Vigilance", emoji: "⚠️" },
  { href: "/sitter/tutoriels", label: "Tutoriels", emoji: "🎬" },
  { href: "/sitter/photos", label: "Photos", emoji: "📸" },
];

export default async function SitterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-charlie-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-charlie-500 text-xl">🐱</span>
          <span className="font-bold text-charlie-800">Charlie</span>
        </div>
        <span className="text-sm text-gray-500">
          Bonjour {profile?.name ?? "!"} 👋
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">{children}</main>

      {/* Bottom nav */}
      <nav className="bg-white border-t border-charlie-100 px-2 py-2 sticky bottom-0 z-10">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl hover:bg-charlie-50 transition-colors"
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-xs text-gray-600">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
