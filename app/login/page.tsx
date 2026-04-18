"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/ensure-profile";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      const user = await ensureProfile();
      if (!user) {
        setError("Impossible de créer le profil. Réessaie.");
        setLoading(false);
        return;
      }
      router.replace("/onboarding");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      await ensureProfile();
      router.replace("/");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-10">
        {/* Logo */}
        <div className="text-center space-y-5">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden ring-1 ring-charlie-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/charlie-management/charlie.jpg"
              alt="Charlie"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-charlie-900">
              Charlie
            </h1>
            <p className="text-charlie-400 text-sm font-light mt-1 tracking-wide">
              Cat sitting
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-charlie-500 uppercase tracking-widest"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-charlie-200 focus:border-charlie-500 focus:outline-none focus:ring-0 text-charlie-900 placeholder-charlie-300 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-charlie-500 uppercase tracking-widest"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-charlie-200 focus:border-charlie-500 focus:outline-none focus:ring-0 text-charlie-900 placeholder-charlie-300 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-500/80 text-sm font-light">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-charlie-900 hover:bg-charlie-800 disabled:bg-charlie-200 text-white text-sm font-medium tracking-wide rounded-full transition-colors"
          >
            {loading
              ? "Chargement…"
              : isSignUp
                ? "Créer un compte"
                : "Se connecter"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="w-full text-center text-charlie-500 text-sm font-light underline underline-offset-4 decoration-charlie-200 hover:decoration-charlie-400 transition-colors"
          >
            {isSignUp
              ? "Déjà un compte ? Se connecter"
              : "Pas encore de compte ? Créer un compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
