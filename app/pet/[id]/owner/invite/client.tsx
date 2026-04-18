"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { InviteCode, PetSitter } from "@/lib/types";

type InviteRole = "sitter" | "owner";

export default function InvitePage() {
  const { id: petId } = useParams<{ id: string }>();
  const [code, setCode] = useState<InviteCode | null>(null);
  const [members, setMembers] = useState<PetSitter[]>([]);
  const [generating, setGenerating] = useState(false);
  const [inviteRole, setInviteRole] = useState<InviteRole>("sitter");

  useEffect(() => {
    load();
  }, [petId]);

  async function load() {
    const supabase = createClient();
    const [{ data: codes }, { data: s }] = await Promise.all([
      supabase
        .from("invite_codes")
        .select("*")
        .eq("pet_id", petId)
        .is("used_by", null)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("pet_sitters")
        .select("*, profiles(*)")
        .eq("pet_id", petId),
    ]);
    setCode(codes?.[0] ?? null);
    setMembers(s ?? []);
  }

  async function generateCode() {
    setGenerating(true);
    const supabase = createClient();
    await supabase
      .from("invite_codes")
      .insert({ pet_id: petId, role: inviteRole });
    await load();
    setGenerating(false);
  }

  async function copyCode() {
    if (!code) return;
    const url = `${window.location.origin}/charlie-management/join/${code.code}`;
    await navigator.clipboard.writeText(url);
  }

  const owners = members.filter((m) => m.role === "owner");
  const sitters = members.filter((m) => m.role === "sitter");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-charlie-900">
          Inviter
        </h1>
        <p className="text-charlie-400 text-sm font-light mt-1">
          Partager un lien d&apos;invitation
        </p>
      </div>

      {/* Invite role selector + code */}
      <div className="space-y-4">
        <h2 className="text-xs text-charlie-400 font-medium uppercase tracking-widest">
          Nouvelle invitation
        </h2>

        <div className="flex gap-2">
          {(["sitter", "owner"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setInviteRole(r);
                setCode(null);
              }}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors ${
                inviteRole === r
                  ? "bg-charlie-900 text-white"
                  : "bg-charlie-100 text-charlie-500"
              }`}
            >
              {r === "sitter" ? "Cat sitter" : "Co-propriétaire"}
            </button>
          ))}
        </div>

        {code && code.role === inviteRole ? (
          <div className="bg-white rounded-2xl shadow-sm shadow-charlie-100 p-5 space-y-4">
            <p className="text-center font-mono text-lg tracking-[0.3em] text-charlie-900">
              {code.code}
            </p>
            <p className="text-center text-xs text-charlie-400 font-light">
              Invitation{" "}
              {code.role === "owner" ? "co-propriétaire" : "cat sitter"}
            </p>
            <button
              onClick={copyCode}
              className="w-full py-3 bg-charlie-100 hover:bg-charlie-200 text-charlie-700 text-sm font-medium rounded-full transition-colors active:scale-[0.98]"
            >
              Copier le lien
            </button>
          </div>
        ) : (
          <button
            onClick={generateCode}
            disabled={generating}
            className="w-full py-3.5 bg-charlie-900 hover:bg-charlie-800 disabled:bg-charlie-200 text-white text-sm font-medium tracking-wide rounded-full transition-colors active:scale-[0.98]"
          >
            {generating
              ? "Génération…"
              : `Générer un code ${inviteRole === "owner" ? "co-propriétaire" : "sitter"}`}
          </button>
        )}
      </div>

      {/* Co-owners list */}
      {owners.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs text-charlie-400 font-medium uppercase tracking-widest">
            Co-propriétaires
          </h2>
          {owners.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl shadow-sm shadow-charlie-100 p-4"
            >
              <p className="text-sm font-medium text-charlie-900">
                {m.profiles?.name ?? "Propriétaire"}
              </p>
              <p className="text-xs text-charlie-400 font-light mt-0.5">
                Depuis le{" "}
                {new Date(m.invited_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Sitters list */}
      {sitters.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs text-charlie-400 font-medium uppercase tracking-widest">
            Cat sitters
          </h2>
          {sitters.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl shadow-sm shadow-charlie-100 p-4"
            >
              <p className="text-sm font-medium text-charlie-900">
                {s.profiles?.name ?? "Sitter"}
              </p>
              <p className="text-xs text-charlie-400 font-light mt-0.5">
                Depuis le{" "}
                {new Date(s.invited_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
