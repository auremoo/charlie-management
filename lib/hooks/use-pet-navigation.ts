"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function usePetNavigation() {
  const router = useRouter();

  const navigateToPet = useCallback(
    (petId: string, role: "owner" | "sitter", subpage?: string) => {
      const path = subpage
        ? `/pet/${petId}/${role}/${subpage}`
        : `/pet/${petId}/${role}`;
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
      window.location.href = `${basePath}${path}`;
    },
    []
  );

  return { navigateToPet, router };
}
