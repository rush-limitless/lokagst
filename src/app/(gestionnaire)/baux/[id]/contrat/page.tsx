"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { genererContratData } from "@/actions/contrat";
import { Button } from "@/components/ui/button";

export default function ContratPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (params.id) genererContratData(params.id as string).then(setData);
  }, [params.id]);

  if (!data) return <p className="p-6">Chargement...</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={() => window.print()}>🖨️ Imprimer / PDF</Button>
      </div>
      <div className="bg-white border rounded-lg p-10 print:border-none print:p-0 text-sm leading-relaxed">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold">CONTRAT DE BAIL D&apos;HABITATION</h1>
          <p className="text-gray-500 mt-1">N° {data.numero}</p>
        </div>

        <p className="text-right mb-6">Fait à Yaoundé, le {data.date}</p>

        <h2 className="font-bold text-lg mb-3 border-b pb-1">ARTICLE 1 — LES PARTIES</h2>
        <p className="mb-2"><strong>LE BAILLEUR :</strong> {data.bailleur}, sis à {data.adresseBailleur}</p>
        <p className="mb-4"><strong>LE LOCATAIRE :</strong> {data.locataire}, Tél : {data.telephone}, Email : {data.email}, CNI : {data.cni}</p>

        <h2 className="font-bold text-lg mb-3 border-b pb-1">ARTICLE 2 — OBJET DU BAIL</h2>
        <p className="mb-4">Le bailleur donne en location au locataire le logement suivant : Appartement <strong>{data.appartement}</strong>, situé au <strong>{data.etage}</strong>, de type <strong>{data.type}</strong>.</p>

        <h2 className="font-bold text-lg mb-3 border-b pb-1">ARTICLE 3 — DURÉE</h2>
        <p className="mb-4">Le présent bail est conclu pour une durée de <strong>{data.dureeMois} mois</strong>, du <strong>{data.dateDebut}</strong> au <strong>{data.dateFin}</strong>.</p>
        {data.renouvellementAuto && <p className="mb-4">Le bail sera renouvelé automatiquement pour une durée de {data.dureeRenouvellement || data.dureeMois} mois si le locataire est à jour de ses obligations.{data.augmentationLoyer ? ` Le loyer sera majoré de ${data.augmentationLoyer}% au renouvellement.` : ""}</p>}

        <h2 className="font-bold text-lg mb-3 border-b pb-1">ARTICLE 4 — CONDITIONS FINANCIÈRES</h2>

        <h3 className="font-bold mt-3 mb-2">4.1 — Caution</h3>
        <p className="mb-3">Le locataire verse une caution de <strong>{data.caution.toLocaleString("fr-FR")} FCFA</strong>, payable une seule fois à la signature du bail.</p>

        <h3 className="font-bold mt-3 mb-2">4.2 — Loyer</h3>
        <p className="mb-3">Le loyer est fixé à <strong>{data.loyer.toLocaleString("fr-FR")} FCFA</strong> par mois, payable selon la périodicité suivante : <strong>{data.periodicite}</strong>.</p>

        <h3 className="font-bold mt-3 mb-2">4.3 — Charges locatives</h3>
        {data.charges.length > 0 ? (
          <div className="mb-3">
            <p>Les charges locatives mensuelles sont les suivantes :</p>
            <table className="w-full mt-2 mb-2 border">
              <tbody>
                {data.charges.map((c: any, i: number) => (
                  <tr key={i} className="border-b"><td className="p-2">{c.type}</td><td className="p-2 text-right">{c.montant.toLocaleString("fr-FR")} FCFA</td></tr>
                ))}
                <tr className="font-bold"><td className="p-2">Total charges</td><td className="p-2 text-right">{data.totalCharges.toLocaleString("fr-FR")} FCFA</td></tr>
              </tbody>
            </table>
            <p><strong>Total mensuel dû (loyer + charges) : {data.totalMensuel.toLocaleString("fr-FR")} FCFA</strong></p>
          </div>
        ) : <p className="mb-3">Aucune charge locative.</p>}

        <h2 className="font-bold text-lg mb-3 border-b pb-1">ARTICLE 5 — MODALITÉS DE PAIEMENT</h2>
        <p className="mb-2">Le paiement est dû au plus tard le <strong>{data.jourLimite} du mois</strong>.</p>
        <p className="mb-2">Modes de paiement acceptés : <strong>Virement bancaire</strong> ou <strong>Orange Money</strong> uniquement.</p>
        <p className="mb-2">En cas de retard, un délai de grâce de <strong>{data.delaiGrace} jours</strong> est accordé. Passé ce délai, une pénalité de <strong>{data.penaliteMontant}{data.penaliteType === "POURCENTAGE" ? "% du loyer" : " FCFA"}</strong> sera appliquée{data.penaliteRecurrente ? " chaque semaine de retard supplémentaire" : ""}.</p>

        <h2 className="font-bold text-lg mb-3 border-b pb-1">ARTICLE 6 — RÉSILIATION</h2>
        <p className="mb-4">Chaque partie peut résilier le bail avec un préavis de <strong>{data.preavisResiliation} jours</strong>.</p>

        {data.clauses && (
          <>
            <h2 className="font-bold text-lg mb-3 border-b pb-1">ARTICLE 7 — CLAUSES PARTICULIÈRES</h2>
            <p className="mb-4 whitespace-pre-wrap">{data.clauses}</p>
          </>
        )}

        <div className="mt-12 grid grid-cols-2 gap-8">
          <div>
            <p className="font-bold mb-1">LE BAILLEUR</p>
            <p>{data.bailleur}</p>
            <div className="mt-12 border-b border-gray-400 w-48"></div>
            <p className="text-xs text-gray-400 mt-1">Signature et cachet</p>
          </div>
          <div>
            <p className="font-bold mb-1">LE LOCATAIRE</p>
            <p>{data.locataire}</p>
            {data.signatureLocataire ? (
              <div className="mt-4">
                <img src={data.signatureLocataire} alt="Signature" className="h-16" />
                <p className="text-xs text-gray-400">Signé le {data.dateSignature}</p>
              </div>
            ) : (
              <>
                <div className="mt-12 border-b border-gray-400 w-48"></div>
                <p className="text-xs text-gray-400 mt-1">Signature</p>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">Fait en deux exemplaires originaux, un pour chaque partie.</p>
      </div>
    </div>
  );
}
