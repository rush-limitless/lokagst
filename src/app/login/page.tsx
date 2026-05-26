"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background gradient (simule une photo d'immeuble) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a2d47] via-[#0d3b5e] to-[#1B6B9E]" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='none'/%3E%3Crect x='10' y='20' width='20' height='30' rx='2' fill='%23ffffff' opacity='0.1'/%3E%3Crect x='40' y='10' width='20' height='40' rx='2' fill='%23ffffff' opacity='0.08'/%3E%3Crect x='70' y='25' width='20' height='25' rx='2' fill='%23ffffff' opacity='0.06'/%3E%3Crect x='10' y='60' width='20' height='30' rx='2' fill='%23ffffff' opacity='0.07'/%3E%3Crect x='40' y='60' width='20' height='30' rx='2' fill='%23ffffff' opacity='0.09'/%3E%3Crect x='70' y='60' width='20' height='30' rx='2' fill='%23ffffff' opacity='0.05'/%3E%3C/svg%3E\")" }} />
      <div className="absolute inset-0 bg-black/30" />

      {/* Card glassmorphism */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <img src="/logo.jpg" alt="IMMOSTAR SCI" className="w-20 h-20 mx-auto rounded-2xl shadow-2xl border-2 border-white/20" />
          <h1 className="text-2xl font-bold text-white mt-4">ImmoGest</h1>
          <p className="text-sky-200/70 text-sm">IMMOSTAR SCI</p>
        </div>

        {/* Form card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white text-center mb-6">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm border border-red-400/30">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-sky-100/80 mb-1.5 block">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-sky-200/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholderEmail}
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#29ABE2]/50 focus:border-[#29ABE2]/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-sky-100/80 mb-1.5 block">{t.motDePasse}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-sky-200/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.placeholderPassword}
                  required
                  className="w-full h-11 pl-10 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#29ABE2]/50 focus:border-[#29ABE2]/50 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-200/50 hover:text-sky-200/80 transition-colors">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[#29ABE2] text-white font-medium hover:bg-[#1B9BD1] transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? t.connexionEnCours : t.seConnecter}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-sky-200/40 mt-6">Plateforme de gestion locative</p>
      </div>
    </div>
  );
}
