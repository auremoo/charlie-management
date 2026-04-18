"use client";

import { useSearchParams, useParams } from "next/navigation";

export function usePetId(): string {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  return params?.id || searchParams.get("id") || "";
}
