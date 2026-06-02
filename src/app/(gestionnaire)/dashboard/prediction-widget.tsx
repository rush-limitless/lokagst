import { getPredictionsImpayes } from "@/actions/predictions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BrainCircuit } from "lucide-react";

const NIVEAU_STYLES = {
  critique: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  eleve: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  moyen: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
  faible: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
};

const NIVEAU_LABELS = { critique: "Critique", eleve: "Élevé", moyen: "Moyen", faible: "Faible" };

export async function PredictionWidget() {
  const predictions = await getPredictionsImpayes();
  const aRisque = predictions.filter((p) => p.niveau === "critique" || p.niveau === "eleve");

  if (aRisque.length === 0) return null;

  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BrainCircuit className="size-4 text-orange-500" /> Prédiction d&apos;impayés
          </CardTitle>
          <Badge variant="outline" className="text-orange-600 border-orange-300">{aRisque.length} à risque</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {aRisque.slice(0, 5).map((p) => (
            <Link key={p.locataireId} href={`/locataires/${p.locataireId}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{p.nom}</p>
                <p className="text-xs text-muted-foreground">{p.appartement} — {p.facteurs[0]}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-lg font-bold">{p.score}</p>
                  <p className="text-[10px] text-muted-foreground">/ 100</p>
                </div>
                <Badge className={NIVEAU_STYLES[p.niveau]}>{NIVEAU_LABELS[p.niveau]}</Badge>
              </div>
            </Link>
          ))}
        </div>
        {aRisque.length > 5 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">+ {aRisque.length - 5} autres locataires à risque</p>
        )}
      </CardContent>
    </Card>
  );
}
