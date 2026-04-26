import { getLocataires } from "@/actions/locataires";
import { prisma } from "@/lib/prisma";
import { formatFCFA, ETAGE_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/search-bar";
import { UserAvatar } from "@/components/user-avatar";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";
import { Users, Plus, ClipboardList, UserCheck, UserX, ArrowRight, Phone, Building2 } from "lucide-react";

async function getCounts() {
  const [actifs, archives] = await Promise.all([
    prisma.locataire.count({ where: { statut: "ACTIF" } }),
    prisma.locataire.count({ where: { statut: "ARCHIVE" } }),
  ]);
  return { actifs, archives };
}

export default async function LocatairesPage({ searchParams }: { searchParams: Promise<{ q?: string; statut?: string }> }) {
  const { q, statut } = await searchParams;
  const [locataires, counts] = await Promise.all([
    getLocataires({ statut: statut || "ACTIF", recherche: q }),
    getCounts(),
  ]);

  const ETAGE_ORDER = ["CINQUIEME", "QUATRIEME", "TROISIEME", "DEUXIEME", "PREMIER", "RDC", "AUTRE"];
  const grouped: { imm: string; etage: string; etageKey: string; locs: typeof locataires }[] = [];
  const byImm = new Map<string, typeof locataires>();
  for (const l of locataires) {
    const immNom = l.baux[0]?.appartement?.immeuble?.nom || "Sans immeuble";
    if (!byImm.has(immNom)) byImm.set(immNom, []);
    byImm.get(immNom)!.push(l);
  }
  for (const [immNom, locs] of Array.from(byImm)) {
    const byEtage = new Map<string, typeof locataires>();
    for (const l of locs) {
      const etage = l.baux[0]?.appartement?.etage || "AUTRE";
      if (!byEtage.has(etage)) byEtage.set(etage, []);
      byEtage.get(etage)!.push(l);
    }
    for (const ek of ETAGE_ORDER) {
      const els = byEtage.get(ek);
      if (els) grouped.push({ imm: immNom, etage: ETAGE_LABELS[ek] || ek, etageKey: ek, locs: els });
    }
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2"><Users className="size-6 text-primary" /> Locataires</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{locataires.length} locataire(s) affichés</p>
        </div>
        <div className="flex gap-2">
          <Link href="/situation"><Button variant="outline" size="sm" className="gap-1.5"><ClipboardList className="size-3.5" /> Situation</Button></Link>
          <Link href="/locataires/nouveau"><Button size="sm" className="gap-1.5"><Plus className="size-3.5" /> Ajouter</Button></Link>
        </div>
      </div>

      {/* KPI + Filters */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"><UserCheck className="size-4 text-emerald-600" /></div>
              <div>
                <p className="text-lg font-bold text-foreground">{counts.actifs}</p>
                <p className="text-[11px] text-muted-foreground">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center"><UserX className="size-4 text-orange-600" /></div>
              <div>
                <p className="text-lg font-bold text-foreground">{counts.archives}</p>
                <p className="text-[11px] text-muted-foreground">Anciens</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        <SearchBar placeholder="Rechercher un locataire..." />
        <Link href="/locataires" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!statut || statut === "ACTIF" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Actifs ({counts.actifs})</Link>
        <Link href="/locataires?statut=ARCHIVE" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statut === "ARCHIVE" ? "bg-orange-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>Anciens ({counts.archives})</Link>
      </div>

      {locataires.length === 0 ? (
        <EmptyState icon="👤" title={q ? "Aucun résultat" : "Aucun locataire"} description={q ? "Essayez avec un autre terme" : "Ajoutez votre premier locataire"} />
      ) : (
        <div className="space-y-6">
          {grouped.map(({ imm, etage, etageKey, locs }) => (
            <div key={`${imm}-${etageKey}`}>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="size-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">{imm}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{etage}</span>
                <Badge variant="secondary" className="text-[10px]">{locs.length}</Badge>
              </div>
              {/* Mobile */}
              <div className="md:hidden space-y-2">
                {locs.map((l) => (
                  <Link key={l.id} href={`/locataires/${l.id}`} className="block">
                    <Card className="hover:shadow-md transition-all hover:-translate-y-0.5">
                      <CardContent className="pt-3 pb-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar nom={l.nom} prenom={l.prenom} photo={l.photo} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm">{l.prenom} {l.nom}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="size-3" /> {l.telephone}</p>
                          </div>
                          <div className="text-right">
                            {l.baux[0]?.appartement && <Badge variant="outline" className="text-[10px]">{l.baux[0].appartement.numero}</Badge>}
                            <div className="mt-1"><StatusBadge status={l.statut === "ACTIF" ? "actif" : "archive"} label={l.statut === "ACTIF" ? "Actif" : "Archivé"} /></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              {/* Desktop */}
              <Card className="overflow-hidden hidden md:block">
                <table className="w-full">
                  <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="p-3 font-medium">Locataire</th>
                      <th className="p-3 font-medium">Téléphone</th>
                      <th className="p-3 font-medium">Immeuble</th>
                      <th className="p-3 font-medium">Appartement</th>
                      <th className="p-3 font-medium">Loyer</th>
                      <th className="p-3 font-medium">Statut</th>
                      <th className="p-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {locs.map((l) => (
                      <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar nom={l.nom} prenom={l.prenom} photo={l.photo} size="sm" />
                            <div>
                              <span className="font-medium text-foreground text-sm">{l.prenom} {l.nom}</span>
                              {l.email && <p className="text-[10px] text-muted-foreground">{l.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{l.telephone}</td>
                        <td className="p-3 text-sm text-primary">{l.baux[0]?.appartement?.immeuble?.nom || "—"}</td>
                        <td className="p-3">
                          {l.baux[0]?.appartement ? (
                            <Badge variant="outline" className="text-[10px] font-normal">{l.baux[0].appartement.numero}</Badge>
                          ) : "—"}
                        </td>
                        <td className="p-3 text-sm font-medium text-foreground">{l.baux[0] ? formatFCFA(l.baux[0].totalMensuel) : "—"}</td>
                        <td className="p-3"><StatusBadge status={l.statut === "ACTIF" ? "actif" : "archive"} label={l.statut === "ACTIF" ? "Actif" : "Archivé"} /></td>
                        <td className="p-3 text-right">
                          <Link href={`/locataires/${l.id}`}>
                            <Button variant="ghost" size="sm" className="gap-1 text-xs">Voir <ArrowRight className="size-3" /></Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
