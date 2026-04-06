import { getImmeubles } from "@/actions/immeubles";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { CreerImmeubleForm } from "./creer-form";

export default async function ImmeublesPage() {
  const immeubles = await getImmeubles();

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Immeubles</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {immeubles.map((i) => (
          <Card key={i.id} className="hover:shadow-md transition-all hover:-translate-y-0.5">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg text-foreground">{i.nom}</h3>
              <p className="text-sm text-muted-foreground">{i.adresse}</p>
              <p className="text-sm text-muted-foreground">{i.quartier ? `${i.quartier}, ` : ""}{i.ville}</p>
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm font-medium text-foreground">{i._count.appartements} appartement(s)</p>
                <Link href={`/appartements?immeuble=${i.id}`} className="text-primary text-xs hover:underline">Voir →</Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <CreerImmeubleForm />
    </div>
  );
}
