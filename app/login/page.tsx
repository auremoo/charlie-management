"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/charlie-management/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-10">
        {/* Logo */}
        <div className="text-center space-y-5">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden ring-1 ring-charlie-200">
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

        {/* Card */}
        <div className="space-y-6">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <p className="text-sm text-charlie-600 font-light leading-relaxed">
                Un lien de connexion a été envoyé à
              </p>
              <p className="font-medium text-charlie-900">{email}</p>
              <p className="text-sm text-charlie-400 font-light">
                Vérifie ta boîte mail
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-charlie-500 text-sm font-light underline underline-offset-4 decoration-charlie-200 hover:decoration-charlie-400 transition-colors mt-4"
              >
                Utiliser un autre email
              </button>
            </div>
          ) : (
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

              {error && (
                <p className="text-red-500/80 text-sm font-light">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-charlie-900 hover:bg-charlie-800 disabled:bg-charlie-200 text-white text-sm font-medium tracking-wide rounded-full transition-colors"
              >
                {loading ? "Envoi…" : "Continuer"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
