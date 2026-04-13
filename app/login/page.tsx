"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-charlie-300 shadow-lg">
            <Image
              src="/charlie.jpg"
              alt="Charlie"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-charlie-800">Charlie</h1>
            <p className="text-charlie-600 text-sm mt-1">Cat sitting app</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          {sent ? (
            <div className="text-center space-y-3">
              <div className="text-4xl">📬</div>
              <h2 className="font-semibold text-charlie-800 text-lg">
                Vérifie tes emails !
              </h2>
              <p className="text-gray-500 text-sm">
                Un lien de connexion a été envoyé à{" "}
                <span className="font-medium text-charlie-700">{email}</span>
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-charlie-500 text-sm underline"
              >
                Utiliser un autre email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="font-semibold text-charlie-800 text-lg mb-1">
                  Connexion
                </h2>
                <p className="text-gray-500 text-sm">
                  Entre ton email — tu recevras un lien magique ✨
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-charlie-300 focus:border-transparent text-gray-800 placeholder-gray-400"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-charlie-500 hover:bg-charlie-600 disabled:bg-charlie-300 text-white font-semibold rounded-xl transition-colors"
              >
                {loading ? "Envoi en cours…" : "Envoyer le lien ✉️"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
