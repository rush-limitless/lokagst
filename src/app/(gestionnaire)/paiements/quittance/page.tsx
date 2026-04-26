"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { genererQuittanceData } from "@/actions/quittances";
import { Button } from "@/components/ui/button";

export default function QuittancePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (id) genererQuittanceData(id).then(setData);
  }, [id]);

  if (!data) return <p className="p-6 text-muted-foreground">Chargement... (La quittance n&apos;est disponible que pour les paiements complets)</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={() => window.print()}>🖨️ Imprimer / PDF</Button>
      </div>
      <div className="bg-card border rounded-lg p-8 print:border-none">
        <div className="text-center border-b-2 border-blue-950 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-foreground">IMMOSTAR SCI</h1>
          <p className="text-muted-foreground">Yaoundé — Nkolfoulou</p>
          <h2 className="text-xl font-bold mt-4">QUITTANCE DE LOYER</h2>
          <p className="text-sm text-muted-foreground">N° {data.numero}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Je soussigné, propriétaire du logement désigné ci-dessous, déclare avoir reçu de :</p>
          <p className="font-bold text-lg mt-2">{data.locataire}</p>
          <p className="text-foreground">{data.adresse}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">La somme correspondant au loyer et aux charges du mois de :</p>
          <p className="font-bold text-lg text-foreground">{data.periode}</p>
        </div>

        <table className="w-full mb-6 text-sm">
          <tbody>
            <tr className="border-b"><td className="py-2 text-muted-foreground">Loyer</td><td className="py-2 text-right font-medium">{data.loyer.toLocaleString("fr-FR")} FCFA</td></tr>
            {data.charges.map((c: any, i: number) => (
              <tr key={i} className="border-b"><td className="py-2 text-muted-foreground">Charge : {c.type}</td><td className="py-2 text-right">{c.montant.toLocaleString("fr-FR")} FCFA</td></tr>
            ))}
            {data.totalCharges > 0 && (
              <tr className="border-b"><td className="py-2 text-muted-foreground font-medium">Total charges</td><td className="py-2 text-right font-medium">{data.totalCharges.toLocaleString("fr-FR")} FCFA</td></tr>
            )}
            <tr className="bg-green-50"><td className="py-3 font-bold text-lg">TOTAL PAYÉ</td><td className="py-3 text-right font-bold text-lg text-green-700">{data.totalPaye.toLocaleString("fr-FR")} FCFA</td></tr>
          </tbody>
        </table>

        <div className="text-sm text-muted-foreground mb-6">
          <p>Date de paiement : {data.datePaiement}</p>
          <p>Date d&apos;émission : {data.dateEmission}</p>
        </div>

        <p className="text-xs text-muted-foreground italic mb-8">Cette quittance annule tous les reçus qui auraient pu être établis précédemment pour la même période. Elle ne libère le locataire que pour la période mentionnée.</p>

        <div className="flex justify-between mt-8 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Le bailleur</p>
            <p className="font-medium mt-1">IMMOSTAR SCI</p>
            <div className="mt-8 border-b border-gray-300 w-40"></div>
            <p className="text-xs text-muted-foreground mt-1">Signature</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Fait à Yaoundé</p>
            <p className="text-sm">Le {data.dateEmission}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
