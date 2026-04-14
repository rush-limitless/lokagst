import { prisma } from "@/lib/prisma";
import { formatFCFA, formatDate, MODE_PAIEMENT_LABELS } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ModifierPaiementButton } from "./modifier-paiement";

export default async function PaiementDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.paiement.findUnique({
    where: { id },
    include: { bail: { include: { locataire: true, appartement: { include: { immeuble: true } } } } },
  });
  if (!p) notFound();

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/locataires/${p.bail.locataireId}`} className="text-muted-foreground hover:text-foreground text-sm">← Retour au locataire</Link>
        <Link href="/paiements" className="text-muted-foreground hover:text-foreground text-sm">| Tous les paiements</Link>
      </div>

      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-foreground">Détail du paiement</h1>
        <Badge variant={p.statut === "PAYE" ? "outline" : "destructive"} className={p.statut === "PAYE" ? "text-emerald-600" : ""}>
          {p.statut === "PAYE" ? "Payé" : "Partiellement payé"}
        </Badge>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Locataire & Logement</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Locataire</span><p className="font-medium">{p.bail.locataire.prenom} {p.bail.locataire.nom}</p></div>
          <div><span className="text-muted-foreground">Téléphone</span><p>{p.bail.locataire.telephone}</p></div>
          <div><span className="text-muted-foreground">Appartement</span><p className="font-medium">{p.bail.appartement.numero}</p></div>
          <div><span className="text-muted-foreground">Immeuble</span><p>{p.bail.appartement.immeuble?.nom || "—"}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Détail financier</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Mois concerné</span><p className="font-medium">{formatDate(p.moisConcerne)}</p></div>
            <div><span className="text-muted-foreground">Date de paiement</span><p>{formatDate(p.datePaiement)}</p></div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b"><td className="p-3 text-muted-foreground">Loyer</td><td className="p-3 text-right font-medium">{formatFCFA(p.montantLoyer || p.bail.montantLoyer)}</td></tr>
                {(p.montantCharges > 0 || (p.montantCharges === 0 && p.montantLoyer === 0 && p.bail.totalCharges > 0)) && <tr className="border-b"><td className="p-3 text-muted-foreground">Charges</td><td className="p-3 text-right font-medium">{formatFCFA(p.montantCharges)}</td></tr>}
                {p.montantCaution > 0 && <tr className="border-b"><td className="p-3 text-muted-foreground">Caution</td><td className="p-3 text-right font-medium">{formatFCFA(p.montantCaution)}</td></tr>}
                {p.montantAutres > 0 && <tr className="border-b"><td className="p-3 text-muted-foreground">Autres {p.notesAutres ? `(${p.notesAutres})` : ""}</td><td className="p-3 text-right font-medium">{formatFCFA(p.montantAutres)}</td></tr>}
                {p.penalites > 0 && <tr className="border-b"><td className="p-3 text-red-600">Pénalités</td><td className="p-3 text-right font-medium text-red-600">{formatFCFA(p.penalites)}</td></tr>}
                <tr className="bg-muted/30"><td className="p-3 font-bold">Total payé</td><td className="p-3 text-right font-bold text-lg">{formatFCFA(p.montant)}</td></tr>
                {p.resteDu > 0 && <tr><td className="p-3 text-red-600">Reste dû</td><td className="p-3 text-right font-medium text-red-600">{formatFCFA(p.resteDu)}</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Informations complémentaires</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Mode de paiement</span><p className="font-medium">{MODE_PAIEMENT_LABELS[p.modePaiement]}</p></div>
          <div><span className="text-muted-foreground">Validé</span><p>{p.valide ? "✅ Oui" : "⏳ En attente"}</p></div>
          {p.preuvePaiement && <div><span className="text-muted-foreground">Preuve</span><p><a href={p.preuvePaiement} target="_blank" className="text-primary hover:underline">📎 Voir la preuve</a></p></div>}
          {p.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes</span><p>{p.notes}</p></div>}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <ModifierPaiementButton paiement={JSON.parse(JSON.stringify(p))} />
        <Link href={`/paiements/recu?id=${p.id}`}><Button variant="outline" size="sm">🧾 Reçu</Button></Link>
        {p.statut === "PAYE" && <Link href={`/paiements/quittance?id=${p.id}`}><Button variant="outline" size="sm">📄 Quittance</Button></Link>}
        <Link href={`/baux/${p.bailId}`}><Button variant="outline" size="sm">📄 Voir le bail</Button></Link>
      </div>
    </div>
  );
}
