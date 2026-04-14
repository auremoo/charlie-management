import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const navItems = [
  { href: "/owner", label: "Nouvelles", emoji: "📬", exact: true },
  { href: "/owner/checklist", label: "Tâches", emoji: "✅" },
  { href: "/owner/vigilance", label: "Vigilance", emoji: "⚠️" },
  { href: "/owner/tutoriels", label: "Tutoriels", emoji: "🎬" },
];

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-charlie-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-charlie-500 text-xl">🐱</span>
          <span className="font-bold text-charlie-800">Charlie — Admin</span>
        </div>
        <span className="text-xs bg-charlie-100 text-charlie-700 px-2 py-1 rounded-full font-medium">
          Propriétaire
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 sm:px-6">{children}</main>

      {/* Bottom nav — touch-friendly with safe area */}
      <nav className="bg-white border-t border-charlie-100 px-2 pt-1 pb-safe sticky bottom-0 z-10">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 min-w-[3rem] min-h-[3rem] justify-center px-3 py-1.5 rounded-xl active:bg-charlie-100 hover:bg-charlie-50 transition-colors"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-[11px] text-gray-600">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
