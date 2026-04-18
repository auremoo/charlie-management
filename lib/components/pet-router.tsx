"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const OwnerLayout = dynamic(() => import("@/app/pet/[id]/owner/layout"));
const SitterLayout = dynamic(() => import("@/app/pet/[id]/sitter/layout"));

const OwnerDashboard = dynamic(() => import("@/app/pet/[id]/owner/client"));
const OwnerChecklist = dynamic(
  () => import("@/app/pet/[id]/owner/checklist/client")
);
const OwnerVigilance = dynamic(
  () => import("@/app/pet/[id]/owner/vigilance/client")
);
const OwnerTutoriels = dynamic(
  () => import("@/app/pet/[id]/owner/tutoriels/client")
);
const OwnerInvite = dynamic(
  () => import("@/app/pet/[id]/owner/invite/client")
);

const SitterChecklist = dynamic(() => import("@/app/pet/[id]/sitter/client"));
const SitterVigilance = dynamic(
  () => import("@/app/pet/[id]/sitter/vigilance/client")
);
const SitterTutoriels = dynamic(
  () => import("@/app/pet/[id]/sitter/tutoriels/client")
);
const SitterPhotos = dynamic(
  () => import("@/app/pet/[id]/sitter/photos/client")
);

type PetRoute = {
  petId: string;
  role: "owner" | "sitter";
  tab: string;
};

function parsePetRoute(pathname: string): PetRoute | null {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const path = basePath ? pathname.replace(basePath, "") : pathname;
  const match = path.match(/^\/pet\/([^/]+)\/(owner|sitter)(\/(.+))?$/);
  if (!match) return null;
  return {
    petId: match[1],
    role: match[2] as "owner" | "sitter",
    tab: match[4] || "",
  };
}

function PetView({ route }: { route: PetRoute }) {
  if (route.role === "owner") {
    let content;
    switch (route.tab) {
      case "checklist":
        content = <OwnerChecklist />;
        break;
      case "vigilance":
        content = <OwnerVigilance />;
        break;
      case "tutoriels":
        content = <OwnerTutoriels />;
        break;
      case "invite":
        content = <OwnerInvite />;
        break;
      default:
        content = <OwnerDashboard />;
    }
    return <OwnerLayout>{content}</OwnerLayout>;
  }

  let content;
  switch (route.tab) {
    case "vigilance":
      content = <SitterVigilance />;
      break;
    case "tutoriels":
      content = <SitterTutoriels />;
      break;
    case "photos":
      content = <SitterPhotos />;
      break;
    default:
      content = <SitterChecklist />;
  }
  return <SitterLayout>{content}</SitterLayout>;
}

export default function PetRouter({
  children,
}: {
  children: React.ReactNode;
}) {
  const [route, setRoute] = useState<PetRoute | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const parsed = parsePetRoute(window.location.pathname);
    setRoute(parsed);
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-charlie-300 border-t-charlie-600 animate-spin" />
      </div>
    );
  }

  if (route) {
    return <PetView route={route} />;
  }

  return <>{children}</>;
}
