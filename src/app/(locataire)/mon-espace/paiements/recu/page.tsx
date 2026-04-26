import { genererRecuData } from "@/actions/recus";
import { formatFCFA, ETAGE_LABELS } from "@/lib/utils";
import { notFound } from "next/navigation";
import { DocumentHeader } from "@/components/document-header";

export default async function MonRecuPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  if (!id) notFound();
  const data = await genererRecuData(id);
  if (!data) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-foreground">Mon reçu de paiement</h1>
        <button onClick={() => {}} className="text-xs text-primary hover:underline print:hidden" id="print-btn">🖨️ Imprimer</button>
      </div>
      <div className="bg-card text-black rounded-lg border p-8 print:border-0 print:p-0">
        <DocumentHeader titre="REÇU DE PAIEMENT" />
        <table className="w-full text-sm mb-6">
          <tbody>
            <tr className="border-b"><td className="py-2 text-muted-foreground">Locataire</td><td className="py-2 font-medium">{data.locataire}</td></tr>
            <tr className="border-b"><td className="py-2 text-muted-foreground">Appartement</td><td className="py-2">{data.appartement} — {ETAGE_LABELS[data.etage]}</td></tr>
            <tr className="border-b"><td className="py-2 text-muted-foreground">Période</td><td className="py-2">{data.moisConcerne}</td></tr>
            <tr className="border-b"><td className="py-2 text-muted-foreground">Montant</td><td className="py-2 font-bold text-lg">{formatFCFA(data.montant)}</td></tr>
            <tr className="border-b"><td className="py-2 text-muted-foreground">Mode</td><td className="py-2">{data.modePaiement}</td></tr>
            <tr className="border-b"><td className="py-2 text-muted-foreground">Date</td><td className="py-2">{data.datePaiement}</td></tr>
            <tr><td className="py-2 text-muted-foreground">Statut</td><td className="py-2">{data.statut}</td></tr>
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground text-center">IMMOSTAR SCI — Nkolfoulou, Yaoundé</p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `document.getElementById('print-btn')?.addEventListener('click',()=>window.print())` }} />
    </div>
  );
}
