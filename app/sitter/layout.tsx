"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";

const navItems = [
  { href: "/sitter/checklist", label: "Tâches", icon: "T" },
  { href: "/sitter/vigilance", label: "Vigilance", icon: "V" },
  { href: "/sitter/tutoriels", label: "Guides", icon: "G" },
  { href: "/sitter/photos", label: "Photos", icon: "P" },
];

export default function SitterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-charlie-300 border-t-charlie-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="glass border-b border-charlie-100/60 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <span className="text-base font-semibold tracking-tight text-charlie-900">
          Charlie
        </span>
        <span className="text-sm text-charlie-400 font-light">
          {profile?.name ?? ""}
        </span>
      </header>

      {/* Content */}
      <main className="flex-1 px-5 py-6">{children}</main>

      {/* Bottom nav */}
      <nav className="glass border-t border-charlie-100/60 px-4 pt-2 pb-safe sticky bottom-0 z-10">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 min-w-[3rem] py-2 transition-colors ${
                  active ? "text-charlie-900" : "text-charlie-300"
                }`}
              >
                <span className="text-xs font-semibold tracking-wide">
                  {item.icon}
                </span>
                <span className="text-[10px] font-light">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
