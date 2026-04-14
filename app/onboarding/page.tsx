"use client";

import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-charlie-900">
            Bienvenue sur Charlie
          </h1>
          <p className="text-charlie-400 text-sm font-light">
            Que souhaitez-vous faire ?
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/pet/new")}
            className="w-full py-5 px-6 bg-white rounded-2xl shadow-sm shadow-charlie-100 text-left space-y-1 transition-all active:scale-[0.98] hover:shadow-md"
          >
            <p className="text-sm font-medium text-charlie-900">
              Je suis propriétaire
            </p>
            <p className="text-xs text-charlie-400 font-light">
              Créer une fiche pour mon animal
            </p>
          </button>

          <button
            onClick={() => router.push("/join")}
            className="w-full py-5 px-6 bg-white rounded-2xl shadow-sm shadow-charlie-100 text-left space-y-1 transition-all active:scale-[0.98] hover:shadow-md"
          >
            <p className="text-sm font-medium text-charlie-900">
              Je suis cat sitter
            </p>
            <p className="text-xs text-charlie-400 font-light">
              Rejoindre avec un code d&apos;invitation
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
