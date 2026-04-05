"use client";

import { getComparaisonPeriodes } from "@/actions/rapports";
import { formatFCFA } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function ComparaisonPage() {
  const [d1, setD1] = useState("");
  const [f1, setF1] = useState("");
  const [d2, setD2] = useState("");
  const [f2, setF2] = useState("");
  const [data, setData] = useState<any>(null);

  async function handleComparer() {
    if (!d1 || !f1 || !d2 || !f2) { toast.error("Remplissez les 4 dates"); return; }
    const result = await getComparaisonPeriodes(d1, f1, d2, f2);
    setData(result);
  }

  function setPreset(type: string) {
    const now = new Date();
    if (type === "trimestre") {
      const d = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const m = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      setD1(d.toISOString().slice(0, 10));
      setF1(new Date(now.getFullYear(), now.getMonth() - 3, 0).toISOString().slice(0, 10));
      setD2(m.toISOString().slice(0, 10));
      setF2(now.toISOString().slice(0, 10));
    } else if (type === "semestre") {
      setD1(`${now.getFullYear() - 1}-07-01`);
      setF1(`${now.getFullYear() - 1}-12-31`);
      setD2(`${now.getFullYear()}-01-01`);
      setF2(now.toISOString().slice(0, 10));
    }
  }

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl font-bold text-foreground">Comparaison de périodes</h1>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => setPreset("trimestre")}>Trimestre vs précédent</Button>
            <Button variant="outline" size="sm" onClick={() => setPreset("semestre")}>Semestre vs précédent</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-3 border rounded-lg">
              <p className="text-xs font-medium text-muted-foreground">Période 1</p>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={d1} onChange={(e) => setD1(e.target.value)} className="border rounded p-1.5 text-sm bg-card text-foreground" />
                <input type="date" value={f1} onChange={(e) => setF1(e.target.value)} className="border rounded p-1.5 text-sm bg-card text-foreground" />
              </div>
            </div>
            <div className="space-y-2 p-3 border rounded-lg">
              <p className="text-xs font-medium text-muted-foreground">Période 2</p>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={d2} onChange={(e) => setD2(e.target.value)} className="border rounded p-1.5 text-sm bg-card text-foreground" />
                <input type="date" value={f2} onChange={(e) => setF2(e.target.value)} className="border rounded p-1.5 text-sm bg-card text-foreground" />
              </div>
            </div>
          </div>
          <Button onClick={handleComparer} className="w-full">📊 Comparer</Button>
        </CardContent>
      </Card>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Période 1</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">{data.periode1.label}</p>
              <div className="text-2xl font-bold text-foreground">{formatFCFA(data.periode1.totalRegle)}</div>
              <p className="text-xs text-muted-foreground">{data.periode1.nbPaiements} paiements</p>
              {data.periode1.totalPenalites > 0 && <p className="text-xs text-red-600">{formatFCFA(data.periode1.totalPenalites)} pénalités</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Période 2</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">{data.periode2.label}</p>
              <div className="text-2xl font-bold text-foreground">{formatFCFA(data.periode2.totalRegle)}</div>
              <p className="text-xs text-muted-foreground">{data.periode2.nbPaiements} paiements</p>
              {data.periode2.totalPenalites > 0 && <p className="text-xs text-red-600">{formatFCFA(data.periode2.totalPenalites)} pénalités</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Variation</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${data.variation.regle >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {data.variation.regle >= 0 ? "↑" : "↓"} {Math.abs(data.variation.regle)}%
              </div>
              <p className="text-xs text-muted-foreground">Revenus</p>
              <div className={`text-lg font-bold mt-2 ${data.variation.paiements >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {data.variation.paiements >= 0 ? "↑" : "↓"} {Math.abs(data.variation.paiements)}%
              </div>
              <p className="text-xs text-muted-foreground">Nb paiements</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
