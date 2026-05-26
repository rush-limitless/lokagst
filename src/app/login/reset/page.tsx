"use client";

import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/logo.jpg" alt="" className="w-14 h-14 mx-auto rounded-xl shadow mb-3" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mot de passe oublié</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        {sent ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 text-center">
            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Email envoyé</p>
            <p className="text-xs text-emerald-600/70 mt-1">Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                required
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#29ABE2]/30 focus:border-[#29ABE2] transition-all"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full h-11 rounded-lg bg-[#29ABE2] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Envoi..." : "Envoyer le lien"}
            </button>
          </form>
        )}

        <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-6 transition-colors">
          <ArrowLeft className="size-3.5" /> Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
