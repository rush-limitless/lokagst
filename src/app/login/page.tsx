"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { LangToggle } from "@/components/lang-toggle";

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
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0d3b5e] to-[#1B6B9E] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative text-white text-center max-w-md">
          <img src="/logo.jpg" alt="IMMOSTAR SCI" className="w-32 h-32 mx-auto mb-6 rounded-xl shadow-lg" />
          <h1 className="text-3xl font-bold mb-2">ImmoGest</h1>
          <p className="text-sky-200 text-lg">IMMOSTAR SCI</p>
          <p className="text-sky-300/70 text-sm leading-relaxed mt-6">Plateforme de gestion locative intelligente. Gérez vos baux, loyers, charges et locataires en toute simplicité.</p>
          <div className="flex justify-center gap-8 mt-10 text-sky-300/60 text-xs">
            <div><div className="text-2xl font-bold text-white">100%</div>Automatisé</div>
            <div><div className="text-2xl font-bold text-white">24/7</div>Accessible</div>
            <div><div className="text-2xl font-bold text-white">🔒</div>Sécurisé</div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md mx-4">
          <div className="flex justify-end mb-6"><LangToggle /></div>
          <div className="bg-card rounded-2xl shadow-lg p-8 border">
            <div className="text-center mb-8">
              <img src="/logo.jpg" alt="IMMOSTAR SCI" className="w-20 h-20 mx-auto mb-4 rounded-xl lg:hidden" />
              <h2 className="text-xl font-semibold text-foreground">{t.connexion}</h2>
              <p className="text-sm text-muted-foreground mt-1">IMMOSTAR SCI</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">{t.email}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@immostar.cm" required className="h-11 rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">{t.motDePasse}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-lg" />
              </div>
              <Button type="submit" className="w-full h-11 rounded-lg font-medium" disabled={loading}>
                {loading ? t.connexionEnCours : t.seConnecter}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
