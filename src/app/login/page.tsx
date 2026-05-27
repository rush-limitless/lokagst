"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { Mail, Lock, Eye, EyeOff, Globe } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t, lang, setLang } = useI18n();

  // Charger l'email sauvegardé
  useEffect(() => {
    const saved = localStorage.getItem("immogest-email");
    if (saved) { setEmail(saved); setRemember(true); }
  }, []);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (remember) localStorage.setItem("immogest-email", email);
    else localStorage.removeItem("immogest-email");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError(t.erreurLogin);
    else { router.push("/"); router.refresh(); }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d3b5e] via-[#1B6B9E] to-[#29ABE2]" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-white/5" />
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-white/5" />

        <div className="relative z-10 text-white text-center px-12">
          <Image src="/logo.jpg" alt="IMMOSTAR SCI" width={96} height={96} className="w-24 h-24 mx-auto rounded-2xl shadow-2xl mb-8 animate-float" />
          <h1 className="text-3xl font-bold">ImmoGest</h1>
          <p className="text-sky-200 text-sm mt-2">IMMOSTAR SCI</p>
          <p className="text-sky-100/60 text-sm mt-6 leading-relaxed max-w-xs mx-auto">
            {lang === "fr" ? "Gérez vos immeubles, locataires et paiements en toute simplicité." : "Manage your buildings, tenants and payments with ease."}
          </p>
        </div>
      </div>

      {/* Right — Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Lang toggle */}
        <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} className="absolute top-4 right-4 w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title={lang === "fr" ? "English" : "Français"}>
          <Globe className="size-4" />
        </button>

        <div className="w-full max-w-sm animate-slide-up">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <Image src="/logo.jpg" alt="IMMOSTAR SCI" width={64} height={64} className="w-16 h-16 mx-auto rounded-xl shadow-lg mb-3" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">ImmoGest</h2>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.connexion}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{lang === "fr" ? "Accédez à votre espace de gestion" : "Access your management space"}</p>
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.placeholderPassword}
                  required
                  className="w-full h-11 pl-10 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#29ABE2]/30 focus:border-[#29ABE2] transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#29ABE2] focus:ring-[#29ABE2]/30" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{lang === "fr" ? "Se souvenir de moi" : "Remember me"}</span>
              </label>
              <Link href="/login/reset" className="text-xs text-[#29ABE2] hover:underline">
                {lang === "fr" ? "Mot de passe oublié ?" : "Forgot password?"}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-[#1B6B9E] to-[#29ABE2] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? t.connexionEnCours : t.seConnecter}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">IMMOSTAR SCI — {lang === "fr" ? "Gestion locative" : "Property management"}</p>
        </div>
      </div>
    </div>
  );
}
