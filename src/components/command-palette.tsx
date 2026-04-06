"use client";

import { rechercheGlobale } from "@/actions/recherche";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>({ locataires: [], appartements: [], baux: [] });
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  useEffect(() => {
    if (query.length < 2) { setResults({ locataires: [], appartements: [], baux: [] }); return; }
    const t = setTimeout(() => rechercheGlobale(query).then(setResults), 200);
    return () => clearTimeout(t);
  }, [query]);

  function navigate(href: string) { setOpen(false); setQuery(""); router.push(href); }

  const hasResults = results.locataires.length + results.appartements.length + results.baux.length > 0;

  if (!open) return (
    <button onClick={() => setOpen(true)} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/50 hover:bg-muted text-muted-foreground text-sm transition-colors">
      <span>🔍</span>
      <span>Rechercher...</span>
      <kbd className="text-[10px] bg-background border rounded px-1.5 py-0.5 ml-2">⌘K</kbd>
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg">
        <div className="bg-card border rounded-2xl shadow-2xl overflow-hidden mx-4">
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <span className="text-muted-foreground">🔍</span>
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un locataire, appartement, bail..." className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
            <kbd className="text-[10px] text-muted-foreground bg-muted border rounded px-1.5 py-0.5 cursor-pointer" onClick={() => setOpen(false)}>ESC</kbd>
          </div>

          {query.length >= 2 && (
            <div className="max-h-80 overflow-y-auto">
              {!hasResults && <p className="p-6 text-center text-muted-foreground text-sm">Aucun résultat pour &quot;{query}&quot;</p>}

              {results.locataires.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold bg-muted/30">Locataires</p>
                  {results.locataires.map((l: any) => (
                    <button key={l.id} onClick={() => navigate(`/locataires/${l.id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left">
                      <span className="text-lg">👤</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{l.prenom} {l.nom}</p>
                        <p className="text-xs text-muted-foreground">{l.telephone}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${l.statut === "ACTIF" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>{l.statut}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.appartements.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold bg-muted/30">Appartements</p>
                  {results.appartements.map((a: any) => (
                    <button key={a.id} onClick={() => navigate(`/appartements/${a.id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left">
                      <span className="text-lg">🏠</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{a.numero}</p>
                        <p className="text-xs text-muted-foreground">{a.loyerBase?.toLocaleString()} FCFA</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.statut === "LIBRE" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>{a.statut}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.baux.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold bg-muted/30">Baux</p>
                  {results.baux.map((b: any) => (
                    <button key={b.id} onClick={() => navigate(`/baux/${b.id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left">
                      <span className="text-lg">📄</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{b.locataire.prenom} {b.locataire.nom}</p>
                        <p className="text-xs text-muted-foreground">{b.appartement.numero}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{b.statut}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {query.length < 2 && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              <p>Tapez au moins 2 caractères pour rechercher</p>
              <div className="flex justify-center gap-4 mt-3 text-xs">
                <span>👤 Locataires</span><span>🏠 Appartements</span><span>📄 Baux</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
