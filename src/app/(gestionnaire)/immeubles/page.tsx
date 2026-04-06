import { getImmeubles } from "@/actions/immeubles";
import { prisma } from "@/lib/prisma";
import { formatFCFA, ETAGE_LABELS } from "@/lib/utils";
import Link from "next/link";
import { CreerImmeubleForm } from "./creer-form";

const COLORS = ["from-sky-500 to-blue-600", "from-emerald-500 to-teal-600", "from-violet-500 to-purple-600", "from-amber-500 to-orange-600"];

async function getAppartsParImmeuble() {
  return prisma.appartement.findMany({
    include: { immeuble: true, baux: { where: { statut: "ACTIF" }, include: { locataire: { select: { nom: true, prenom: true } } } } },
    orderBy: { numero: "asc" },
  });
}

export default async function ImmeublesPage() {
  const [immeubles, apparts] = await Promise.all([getImmeubles(), getAppartsParImmeuble()]);

  return (
    <div className="space-y-8 animate-in">
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Immeubles</h1>

      {immeubles.map((imm, idx) => {
        const color = COLORS[idx % COLORS.length];
        const appartsImm = apparts.filter((a) => a.immeubleId === imm.id);
        const occupes = appartsImm.filter((a) => a.statut === "OCCUPE").length;
        const libres = appartsImm.filter((a) => a.statut === "LIBRE").length;

        // Grouper par étage
        const etages: Record<string, typeof appartsImm> = {};
        appartsImm.forEach((a) => {
          const e = ETAGE_LABELS[a.etage] || a.etage;
          if (!etages[e]) etages[e] = [];
          etages[e].push(a);
        });

        return (
          <div key={imm.id} className="space-y-4">
            {/* Header immeuble */}
            <div className={`bg-gradient-to-r ${color} rounded-2xl p-5 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{imm.nom}</h2>
                  <p className="text-white/70 text-sm">{imm.quartier ? `${imm.quartier}, ` : ""}{imm.ville}</p>
                </div>
                <div className="flex gap-4 text-center">
                  <div><div className="text-2xl font-bold">{appartsImm.length}</div><p className="text-white/60 text-[10px]">Apparts</p></div>
                  <div><div className="text-2xl font-bold">{occupes}</div><p className="text-white/60 text-[10px]">Occupés</p></div>
                  <div><div className="text-2xl font-bold">{libres}</div><p className="text-white/60 text-[10px]">Libres</p></div>
                </div>
              </div>
            </div>

            {/* Appartements par étage */}
            {Object.entries(etages).map(([etage, apps]) => (
              <div key={etage}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ml-1">{etage}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {apps.map((a) => {
                    const locataire = a.baux[0]?.locataire;
                    return (
                      <Link key={a.id} href={`/appartements/${a.id}`} className={`rounded-xl p-3 border transition-all hover:shadow-md hover:-translate-y-0.5 ${a.statut === "LIBRE" ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900" : "bg-card border-border"}`}>
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-foreground">{a.numero}</span>
                          <span className={`w-2 h-2 rounded-full mt-1 ${a.statut === "LIBRE" ? "bg-emerald-500" : "bg-sky-500"} animate-pulse`} />
                        </div>
                        <p className="text-[10px] text-muted-foreground">{a.type} — {formatFCFA(a.loyerBase)}</p>
                        {locataire && <p className="text-[10px] text-foreground mt-1 truncate">{locataire.prenom} {locataire.nom}</p>}
                        {!locataire && a.statut === "LIBRE" && <p className="text-[10px] text-emerald-600 mt-1">Disponible</p>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <CreerImmeubleForm />
    </div>
  );
}
