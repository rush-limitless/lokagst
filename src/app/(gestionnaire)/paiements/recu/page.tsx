"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { genererRecuData } from "@/actions/recus";
import { Button } from "@/components/ui/button";

export default function RecuPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (id) genererRecuData(id).then(setData);
  }, [id]);

  if (!data) return <p className="p-6">Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-end mb-4">
        <Button onClick={() => window.print()}>🖨️ Imprimer / PDF</Button>
      </div>
      <div id="recu" className="bg-card border rounded-lg p-8 print:border-none print:shadow-none">
        <div className="text-center border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-foreground">IMMOSTAR SCI</h1>
          <p className="text-muted-foreground">Yaoundé — Nkolfoulou</p>
          <h2 className="text-xl font-bold mt-4">REÇU DE PAIEMENT</h2>
          <p className="text-sm text-muted-foreground">N° {data.id.slice(-8).toUpperCase()}</p>
        </div>

        <table className="w-full mb-6">
          <tbody>
            <tr className="border-b"><td className="py-2 text-muted-foreground w-1/3">Locataire</td><td className="py-2 font-medium">{data.locataire}</td></tr>
            <tr className="border-b"><td className="py-2 text-muted-foreground">Téléphone</td><td className="py-2">{data.telephone}</td></tr>
            <tr className="border-b"><td className="py-2 text-muted-foreground">Appartement</td><td className="py-2">{data.appartement}</td></tr>
            <tr className="border-b"><td className="py-2 text-muted-foreground">Mois concerné</td><td className="py-2 font-medium">{data.moisConcerne}</td></tr>
            <tr className="border-b"><td className="py-2 text-muted-foreground">Loyer mensuel</td><td className="py-2">{data.loyerMensuel.toLocaleString("fr-FR")} FCFA</td></tr>
            <tr className="border-b bg-green-50"><td className="py-2 text-muted-foreground font-medium">Montant payé</td><td className="py-2 font-bold text-lg text-green-700">{data.montant.toLocaleString("fr-FR")} FCFA</td></tr>
            {data.resteDu > 0 && <tr className="border-b bg-red-50"><td className="py-2 text-muted-foreground">Reste dû</td><td className="py-2 font-bold text-red-600">{data.resteDu.toLocaleString("fr-FR")} FCFA</td></tr>}
            <tr className="border-b"><td className="py-2 text-muted-foreground">Mode de paiement</td><td className="py-2">{data.modePaiement}</td></tr>
            <tr className="border-b"><td className="py-2 text-muted-foreground">Date de paiement</td><td className="py-2">{data.datePaiement}</td></tr>
            <tr><td className="py-2 text-muted-foreground">Statut</td><td className="py-2 font-medium">{data.statut}</td></tr>
          </tbody>
        </table>

        <div className="flex justify-between mt-8 pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Le gestionnaire</p>
            <div className="mt-8 border-b border-gray-300 w-40"></div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Date : {data.datePaiement}</p>
            <p className="text-xs text-muted-foreground mt-2">ImmoGest — IMMOSTAR SCI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
