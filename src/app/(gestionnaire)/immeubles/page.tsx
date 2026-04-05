import { getImmeubles } from "@/actions/immeubles";
import { Card, CardContent } from "@/components/ui/card";
import { CreerImmeubleForm } from "./creer-form";

export default async function ImmeublesPage() {
  const immeubles = await getImmeubles();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Immeubles</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {immeubles.map((i) => (
          <Card key={i.id}>
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg">{i.nom}</h3>
              <p className="text-sm text-gray-500">{i.adresse}</p>
              <p className="text-sm text-gray-500">{i.quartier ? `${i.quartier}, ` : ""}{i.ville}</p>
              <p className="text-sm mt-2 font-medium">{i._count.appartements} appartement(s)</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <CreerImmeubleForm />
    </div>
  );
}
