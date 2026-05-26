import { genererMiseEnDemeureData } from "@/actions/mise-en-demeure";
import { notFound } from "next/navigation";

export default async function MiseEnDemeurePage({ searchParams }: { searchParams: Promise<{ locataire?: string }> }) {
  const { locataire } = await searchParams;
  if (!locataire) notFound();
  const data = await genererMiseEnDemeureData(locataire);
  if (!data) notFound();

  return (
    <div className="max-w-3xl mx-auto bg-white text-black p-12 print:p-8 min-h-screen">
      {/* En-tête */}
      <div className="flex justify-between items-start border-b-2 border-[#1B6B9E] pb-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-[#1B6B9E]">IMMOSTAR SCI</h1>
          <p className="text-sm text-gray-600">Gestion immobilière</p>
          <p className="text-sm text-gray-600">{data.adresse}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Yaoundé, le {data.date}</p>
        </div>
      </div>

      {/* Destinataire */}
      <div className="mb-8 ml-[50%]">
        <p className="font-medium">À l&apos;attention de :</p>
        <p className="font-bold text-lg">{data.locataire}</p>
        <p className="text-sm text-gray-600">Appartement {data.appartement}</p>
        <p className="text-sm text-gray-600">{data.immeuble}</p>
      </div>

      {/* Objet */}
      <div className="mb-6">
        <p className="font-bold text-red-700 text-lg border-b border-red-200 pb-2">
          OBJET : MISE EN DEMEURE DE PAYER — {data.moisImpayes} mois d&apos;impayés
        </p>
      </div>

      {/* Corps */}
      <div className="space-y-4 text-sm leading-relaxed">
        <p>Madame, Monsieur <strong>{data.locataire}</strong>,</p>

        <p>
          Par la présente, nous vous mettons en demeure de régulariser votre situation locative
          concernant l&apos;appartement <strong>{data.appartement}</strong> situé dans l&apos;immeuble
          <strong> {data.immeuble}</strong>, que vous occupez depuis le {data.dateDebut}.
        </p>

        <p>
          En effet, nous constatons que vous êtes redevable de <strong>{data.moisImpayes} mois</strong> de
          loyer et charges impayés, soit un montant total de :
        </p>

        {/* Tableau récapitulatif */}
        <table className="w-full border-collapse my-4">
          <tbody>
            <tr className="border-b"><td className="py-2 text-gray-600">Loyer mensuel</td><td className="py-2 text-right font-medium">{data.loyer}</td></tr>
            <tr className="border-b"><td className="py-2 text-gray-600">Charges mensuelles</td><td className="py-2 text-right font-medium">{data.charges}</td></tr>
            <tr className="border-b"><td className="py-2 text-gray-600">Total mensuel</td><td className="py-2 text-right font-medium">{data.totalMensuel}</td></tr>
            <tr className="border-b"><td className="py-2 text-gray-600">Nombre de mois impayés</td><td className="py-2 text-right font-bold text-red-700">{data.moisImpayes}</td></tr>
            <tr className="border-b"><td className="py-2 text-gray-600">Pénalités de retard</td><td className="py-2 text-right font-medium">{data.penalites}</td></tr>
            <tr className="bg-red-50"><td className="py-3 font-bold">TOTAL DÛ</td><td className="py-3 text-right font-bold text-red-700 text-lg">{data.totalDu}</td></tr>
          </tbody>
        </table>

        <p>
          Nous vous prions de bien vouloir procéder au règlement intégral de cette somme dans un
          délai de <strong>quinze (15) jours</strong> à compter de la réception de la présente.
        </p>

        <p>
          À défaut de régularisation dans le délai imparti, nous nous verrons dans l&apos;obligation
          de procéder à la <strong>suspension de votre bail</strong> et d&apos;engager toute procédure
          légale nécessaire au recouvrement des sommes dues.
        </p>

        <p>
          Nous restons à votre disposition pour convenir d&apos;un échéancier de paiement si votre
          situation le nécessite.
        </p>

        <p className="mt-8">Veuillez agréer, Madame, Monsieur, l&apos;expression de nos salutations distinguées.</p>

        <div className="mt-12">
          <p className="font-bold">La Direction</p>
          <p className="text-gray-600">IMMOSTAR SCI</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-4 border-t text-xs text-gray-400 text-center">
        IMMOSTAR SCI — Gestion locative — Nkolfoulou, Yaoundé — Document généré le {data.date}
      </div>

      {/* Bouton imprimer (masqué à l'impression) */}
      <div className="mt-8 text-center print:hidden">
        <button onClick={() => window.print()} className="bg-[#1B6B9E] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90">
          Imprimer / Télécharger PDF
        </button>
      </div>
    </div>
  );
}
