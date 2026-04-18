"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/use-auth";
import type { Pet } from "@/lib/types";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const getNavItems = (petId: string) => [
  { href: `/pet/${petId}/owner`, label: "Nouvelles", icon: "N" },
  { href: `/pet/${petId}/owner/checklist`, label: "Tâches", icon: "T" },
  { href: `/pet/${petId}/owner/vigilance`, label: "Vigilance", icon: "V" },
  { href: `/pet/${petId}/owner/tutoriels`, label: "Guides", icon: "G" },
  { href: `/pet/${petId}/owner/invite`, label: "Inviter", icon: "+" },
];

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id: petId } = useParams<{ id: string }>();
  const pathname = usePathname();
  const { loading: authLoading } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("pets")
        .select("*")
        .eq("id", petId)
        .single();
      setPet(data);
    }
    if (!authLoading) load();
  }, [petId, authLoading]);

  if (authLoading || !pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-charlie-300 border-t-charlie-600 animate-spin" />
      </div>
    );
  }

  const navItems = getNavItems(petId);

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <header className="glass border-b border-charlie-100/60 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <a href={`${basePath}/`} className="text-charlie-300 text-sm">
            ←
          </a>
          <span className="text-base font-semibold tracking-tight text-charlie-900">
            {pet.name}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.15em] text-charlie-400 font-medium">
          Propriétaire
        </span>
      </header>

      <main className="flex-1 px-5 py-6">{children}</main>

      <nav className="glass border-t border-charlie-100/60 px-4 pt-2 pb-safe sticky bottom-0 z-10">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const active =
              item.href === `/pet/${petId}/owner`
                ? pathname === `/pet/${petId}/owner`
                : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={`${basePath}${item.href}`}
                className={`flex flex-col items-center gap-1 min-w-[2.5rem] min-h-[2.75rem] justify-center py-2 transition-colors ${
                  active ? "text-charlie-900" : "text-charlie-300"
                }`}
              >
                <span className="text-xs font-semibold tracking-wide">
                  {item.icon}
                </span>
                <span className="text-[10px] font-light">{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
