"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useI18n();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError(t.erreurLogin);
    else { router.push("/"); router.refresh(); }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center">
        {/* Grande forme arrondie */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d3b5e] via-[#1B6B9E] to-[#29ABE2]" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-white/5" />
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-white/5" />

        {/* Contenu */}
        <div className="relative z-10 text-white text-center px-12">
          <img src="/logo.jpg" alt="IMMOSTAR SCI" className="w-24 h-24 mx-auto rounded-2xl shadow-2xl mb-8" />
          <h1 className="text-3xl font-bold">ImmoGest</h1>
          <p className="text-sky-200 text-sm mt-2">IMMOSTAR SCI</p>
          <p className="text-sky-100/60 text-sm mt-6 leading-relaxed max-w-xs mx-auto">
            Gérez vos immeubles, locataires et paiements en toute simplicité.
          </p>
        </div>
      </div>

      {/* Right — Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.jpg" alt="IMMOSTAR SCI" className="w-16 h-16 mx-auto rounded-xl shadow-lg mb-3" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">ImmoGest</h2>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connexion</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Accédez à votre espace de gestion</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholderEmail}
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#29ABE2]/30 focus:border-[#29ABE2] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">{t.motDePasse}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.placeholderPassword}
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#29ABE2]/30 focus:border-[#29ABE2] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-[#1B6B9E] to-[#29ABE2] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? t.connexionEnCours : t.seConnecter}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">IMMOSTAR SCI — Gestion locative</p>
        </div>
      </div>
    </div>
  );
}
