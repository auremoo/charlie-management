"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import OwnerLayout from "@/app/pet/[id]/owner/layout";
import SitterLayout from "@/app/pet/[id]/sitter/layout";

import OwnerDashboard from "@/app/pet/[id]/owner/client";
import OwnerChecklist from "@/app/pet/[id]/owner/checklist/client";
import OwnerVigilance from "@/app/pet/[id]/owner/vigilance/client";
import OwnerTutoriels from "@/app/pet/[id]/owner/tutoriels/client";
import OwnerInvite from "@/app/pet/[id]/owner/invite/client";

import SitterChecklist from "@/app/pet/[id]/sitter/client";
import SitterVigilance from "@/app/pet/[id]/sitter/vigilance/client";
import SitterTutoriels from "@/app/pet/[id]/sitter/tutoriels/client";
import SitterPhotos from "@/app/pet/[id]/sitter/photos/client";

function PetPageInner() {
  const params = useSearchParams();
  const petId = params.get("id");
  const view = params.get("view") || "owner";
  const tab = params.get("tab") || "";

  if (!petId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-charlie-400 text-sm">Animal introuvable</p>
      </div>
    );
  }

  if (view === "sitter") {
    let content;
    switch (tab) {
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

  let content;
  switch (tab) {
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

export default function PetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-charlie-300 border-t-charlie-600 animate-spin" />
        </div>
      }
    >
      <PetPageInner />
    </Suspense>
  );
}
