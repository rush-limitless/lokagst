import { NextRequest, NextResponse } from "next/server";
import { isMoisEcheance } from "@/lib/utils";
import { getBauxActifs, envoyerRapportMensuel, getInfosPeriode, traiterRappels, traiterPenalites, traiterSuspensions, traiterRenouvellements } from "@/lib/cron";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();
  const jour = now.getDate();
  const moisCourant = new Date(now.getFullYear(), now.getMonth(), 1);
  const results = { factures: 0, rappels: 0, impayes: 0, penalites: 0, misesDemeure: 0, suspensions: 0, renouvellements: 0, expirations: 0 };

  if (jour === 1) {
    results.factures = await envoyerRapportMensuel(now);
  }

  const bauxActifs = await getBauxActifs();

  for (const bail of bauxActifs) {
    if (!isMoisEcheance(moisCourant, bail.dateDebut, bail.periodicite)) {
      // Même hors-échéance, vérifier renouvellements
      const r = await traiterRenouvellements(bail, now);
      results.renouvellements += r.renouvellements;
      results.expirations += r.expirations;
      continue;
    }

    const { attenduPeriode, estPaye } = getInfosPeriode(bail, moisCourant);
    const { rappels, impayes } = await traiterRappels(bail, jour, moisCourant, attenduPeriode, estPaye);
    results.rappels += rappels;
    results.impayes += impayes;
    results.penalites += await traiterPenalites(bail, jour, moisCourant, estPaye);

    const s = await traiterSuspensions(bail, now);
    results.misesDemeure += s.misesDemeure;
    results.suspensions += s.suspensions;

    const r = await traiterRenouvellements(bail, now);
    results.renouvellements += r.renouvellements;
    results.expirations += r.expirations;
  }

  return NextResponse.json({ ok: true, date: now.toISOString(), ...results });
}
