import { getImmeubles } from "@/actions/immeubles";
import { prisma } from "@/lib/prisma";
import { formatFCFA, ETAGE_LABELS, TYPE_LABELS } from "@/lib/utils";
import Link from "next/link";
import { CreerImmeubleForm } from "./creer-form";
import { ModifierImmeubleForm } from "./modifier-form";
import { Building2, MapPin, Home, Users, DoorOpen } from "lucide-react";

const COLORS = ["from-sky-500 to-blue-600", "from-emerald-500 to-teal-600", "from-violet-500 to-purple-600", "from-amber-500 to-orange-600"];
const ETAGE_ORDER = ["CINQUIEME", "QUATRIEME", "TROISIEME", "DEUXIEME", "PREMIER", "RDC", "AUTRE"];

async function getAppartsParImmeuble() {
  return prisma.appartement.findMany({
    include: { immeuble: true, baux: { where: { statut: "ACTIF" }, include: { locataire: { select: { nom: true, prenom: true } } } } },
    orderBy: { numero: "asc" },
  });
}

export default async function ImmeublesPage() {
  const [immeubles, apparts] = await Promise.all([getImmeubles(), getAppartsParImmeuble()]);

  const totalApparts = apparts.length;
  const totalOccupes = apparts.filter((a) => a.statut === "OCCUPE").length;
  const totalLibres = apparts.filter((a) => a.statut === "LIBRE").length;
  const totalRevenu = apparts.reduce((s, a) => s + (a.baux[0] ? a.loyerBase : 0), 0);
  const pctGlobal = totalApparts > 0 ? Math.round((totalOccupes / totalApparts) * 100) : 0;

  return (
    <div className="space-y-8 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2"><Building2 className="w-6 h-6 text-primary" /> Immeubles</h1>
          <p className="text-sm text-muted-foreground mt-1">{immeubles.length} immeuble(s) — Vue physique du patrimoine par étage</p>
        </div>
      </div>

      {/* Cumulatif global tous immeubles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-card border rounded-xl p-4 text-center"><div className="text-2xl font-bold text-foreground">{totalApparts}</div><p className="text-xs text-muted-foreground">Total logements</p></div>
        <div className="bg-card border rounded-xl p-4 text-center"><div className="text-2xl font-bold text-sky-600">{totalOccupes}</div><p className="text-xs text-muted-foreground">Occupés</p></div>
        <div className="bg-card border rounded-xl p-4 text-center"><div className="text-2xl font-bold text-emerald-600">{totalLibres}</div><p className="text-xs text-muted-foreground">Libres</p></div>
        <div className="bg-card border rounded-xl p-4 text-center"><div className="text-2xl font-bold text-foreground">{pctGlobal}%</div><p className="text-xs text-muted-foreground">Occupation</p></div>
        <div className="bg-card border rounded-xl p-4 text-center"><div className="text-lg font-bold text-foreground">{formatFCFA(totalRevenu)}</div><p className="text-xs text-muted-foreground">Revenu mensuel</p></div>
      </div>

      {immeubles.map((imm, idx) => {
        const color = COLORS[idx % COLORS.length];
        const appartsImm = apparts.filter((a) => a.immeubleId === imm.id);
        const occupes = appartsImm.filter((a) => a.statut === "OCCUPE").length;
        const libres = appartsImm.filter((a) => a.statut === "LIBRE").length;
        const pct = appartsImm.length > 0 ? Math.round((occupes / appartsImm.length) * 100) : 0;
        const revenuMensuel = appartsImm.reduce((s, a) => s + (a.baux[0] ? a.loyerBase : 0), 0);

        const etages: { label: string; key: string; apps: typeof appartsImm }[] = [];
        for (const e of ETAGE_ORDER) {
          const apps = appartsImm.filter((a) => a.etage === e);
          if (apps.length > 0) etages.push({ label: ETAGE_LABELS[e] || e, key: e, apps });
        }

        return (
          <div key={imm.id} className="space-y-0">
            {/* Header immeuble */}
            <div className={`bg-gradient-to-r ${color} rounded-t-2xl p-5 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-card/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{imm.nom}</h2>
                    <p className="text-white/70 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {imm.quartier ? `${imm.quartier}, ` : ""}{imm.ville}</p>
                    <ModifierImmeubleForm immeuble={JSON.parse(JSON.stringify(imm))} />
                  </div>
                  <div className="flex gap-5 text-center">
                    <div className="flex flex-col items-center">
                      <Home className="w-4 h-4 text-white/60 mb-1" />
                      <div className="text-2xl font-bold">{appartsImm.length}</div>
                      <p className="text-white/50 text-[10px]">Logements</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <Users className="w-4 h-4 text-white/60 mb-1" />
                      <div className="text-2xl font-bold">{occupes}</div>
                      <p className="text-white/50 text-[10px]">Occupés</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <DoorOpen className="w-4 h-4 text-white/60 mb-1" />
                      <div className="text-2xl font-bold">{libres}</div>
                      <p className="text-white/50 text-[10px]">Libres</p>
                    </div>
                  </div>
                </div>
                {/* Occupation bar + revenue */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>Occupation</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="bg-card/20 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-card/80 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-[10px]">Revenu mensuel</p>
                    <p className="text-sm font-bold">{formatFCFA(revenuMensuel)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Représentation en coupe — étages empilés du haut vers le bas */}
            <div className="border-x border-b rounded-b-2xl overflow-hidden bg-card">
              {etages.map(({ label, key, apps }, eIdx) => (
                <div key={key} className={`${eIdx > 0 ? "border-t border-dashed" : ""}`}>
                  <div className="flex">
                    {/* Label étage */}
                    <div className="w-24 flex-shrink-0 bg-muted/30 flex items-center justify-center border-r p-2">
                      <span className="text-[11px] font-semibold text-muted-foreground writing-vertical">{label}</span>
                    </div>
                    {/* Appartements de cet étage */}
                    <div className="flex-1 p-2 flex flex-wrap gap-2">
                      {apps.map((a) => {
                        const loc = a.baux[0]?.locataire;
                        const isLibre = a.statut === "LIBRE";
                        return (
                          <Link key={a.id} href={`/appartements/${a.id}`} className={`flex-1 min-w-[140px] max-w-[200px] rounded-lg p-2.5 border transition-all hover:shadow-md hover:-translate-y-0.5 ${isLibre ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800" : "bg-background border-border"}`}>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-xs text-foreground">{a.numero}</span>
                              <span className={`w-2 h-2 rounded-full ${isLibre ? "bg-emerald-500" : "bg-sky-500"}`} />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{TYPE_LABELS[a.type] || a.type}</p>
                            <p className="text-[10px] font-medium text-foreground">{formatFCFA(a.loyerBase)}</p>
                            {loc ? (
                              <p className="text-[10px] text-primary mt-0.5 truncate">{loc.prenom} {loc.nom}</p>
                            ) : isLibre ? (
                              <p className="text-[10px] text-emerald-600 mt-0.5">Disponible</p>
                            ) : null}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <CreerImmeubleForm />
    </div>
  );
}
