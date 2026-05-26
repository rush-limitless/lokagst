"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

function NouveauMdpContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setErrorMsg("Le mot de passe doit faire au moins 6 caractères"); return; }
    if (password !== confirm) { setErrorMsg("Les mots de passe ne correspondent pas"); return; }
    setStatus("loading");
    const res = await fetch("/api/reset-password/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    const data = await res.json();
    if (data.error) { setStatus("error"); setErrorMsg(data.error); }
    else setStatus("success");
  }

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-red-600 font-medium">Lien invalide</p>
        <Link href="/login" className="text-sm text-[#29ABE2] mt-2 block">Retour à la connexion</Link>
      </div>
    </div>
  );

  if (status === "success") return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4"><Lock className="size-6 text-emerald-600" /></div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Mot de passe modifié</h2>
        <p className="text-sm text-gray-500 mt-1">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        <Link href="/login" className="inline-block mt-4 px-4 py-2 bg-[#29ABE2] text-white rounded-lg text-sm font-medium hover:opacity-90">Se connecter</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/logo.jpg" alt="" className="w-14 h-14 mx-auto rounded-xl shadow mb-3" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nouveau mot de passe</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choisissez un nouveau mot de passe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900">{errorMsg}</div>}

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
              placeholder="Nouveau mot de passe"
              required
              className="w-full h-11 pl-10 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#29ABE2]/30 focus:border-[#29ABE2] transition-all"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrorMsg(""); }}
              placeholder="Confirmer le mot de passe"
              required
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#29ABE2]/30 focus:border-[#29ABE2] transition-all"
            />
          </div>

          {/* Force indicator */}
          {password.length > 0 && (
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${password.length >= i * 3 ? (password.length >= 10 ? "bg-emerald-500" : password.length >= 6 ? "bg-amber-500" : "bg-red-500") : "bg-gray-200 dark:bg-gray-700"}`} />
              ))}
            </div>
          )}

          <button type="submit" disabled={status === "loading"} className="w-full h-11 rounded-lg bg-[#29ABE2] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {status === "loading" ? "Modification..." : "Modifier le mot de passe"}
          </button>
        </form>

        <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mt-6 transition-colors">
          <ArrowLeft className="size-3.5" /> Retour à la connexion
        </Link>
      </div>
    </div>
  );
}

export default function NouveauMdpPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>}><NouveauMdpContent /></Suspense>;
}
