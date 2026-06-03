import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMoisEcheance, PERIODICITE_MOIS } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role === "LOCATAIRE") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { question } = await req.json();
  if (!question) return NextResponse.json({ reponse: "Posez-moi une question." });

  const q = question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const reponse = await traiterQuestion(q);
  return NextResponse.json({ reponse });
}

async function traiterQuestion(q: string): Promise<string> {
  // --- Impayés / dettes ---
  if (match(q, ["qui doit", "impayes", "impaye", "en retard", "dettes", "doivent"])) {
    return await getImpayes();
  }

  // --- Encaissé ce mois ---
  if (match(q, ["encaisse", "recu", "revenus"]) && match(q, ["mois", "ce mois", "mensuel"])) {
    return await getRevenusMois();
  }

  // --- Total encaissé ---
  if (match(q, ["total encaisse", "total recu", "total paye"])) {
    return await getTotalEncaisse();
  }

  // --- Combien de locataires ---
  if (match(q, ["combien"]) && match(q, ["locataire"])) {
    const count = await prisma.bail.count({ where: { statut: { in: ["ACTIF", "SUSPENDU"] } } });
    return `Il y a **${count} locataires actifs** dans vos immeubles.`;
  }

  // --- Appartements libres ---
  if (match(q, ["libre", "disponible", "vacant"])) {
    const libres = await prisma.appartement.findMany({ where: { statut: "LIBRE" } });
    if (libres.length === 0) return "Aucun logement libre actuellement. Tout est occupé ! 🎉";
    return `**${libres.length} logement(s) libre(s) :**\n${libres.map(a => `• ${a.numero}`).join("\n")}`;
  }

  // --- Infos sur un locataire ---
  const locMatch = q.match(/(?:situation|info|doit|solde|dette).*?(?:de |du |pour )([a-z\s]+)/);
  if (locMatch) {
    return await getInfoLocataire(locMatch[1].trim());
  }
  // Ou "TMCO", "ATG 1" etc. en direct
  if (match(q, ["tmco", "atg", "transfer", "bass", "essouka", "onana", "mamoudou"])) {
    return await getInfoLocataire(q.replace(/[^a-z\s]/g, "").trim());
  }

  // --- Baux expirent bientôt ---
  if (match(q, ["expire", "expiration", "fin de bail", "renouvellement"])) {
    return await getBauxExpirent();
  }

  // --- Taux d'occupation ---
  if (match(q, ["taux", "occupation"])) {
    const total = await prisma.appartement.count();
    const occupes = await prisma.appartement.count({ where: { statut: "OCCUPE" } });
    const taux = Math.round(occupes / total * 100);
    return `**Taux d'occupation : ${taux}%** (${occupes}/${total} logements occupés)`;
  }

  // --- Aide ---
  if (match(q, ["aide", "help", "quoi", "comment", "peux"])) {
    return getAide();
  }

  return "Je n'ai pas compris votre question. Essayez :\n• \"Qui doit combien ?\"\n• \"Combien j'ai encaissé ce mois ?\"\n• \"Appartements libres\"\n• \"Situation de TMCO\"\n• \"Baux qui expirent\"";
}

function match(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k));
}

function fmt(n: number): string {
  return n.toLocaleString("fr-FR") + " FCFA";
}

async function getImpayes() {
  const now = new Date();
  const baux = await prisma.bail.findMany({
    where: { statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { locataire: true, appartement: true, paiements: true },
  });

  const impayes: { nom: string; appart: string; du: number }[] = [];
  for (const b of baux) {
    const freq = PERIODICITE_MOIS[b.periodicite] || 1;
    const debut = new Date(b.dateDebut);
    let totalDu = 0;
    const d = new Date(Math.max(debut.getTime(), new Date(now.getFullYear(), now.getMonth() - 11, 1).getTime()));
    const dm = new Date(d.getFullYear(), d.getMonth(), 1);
    while (dm <= now) {
      if (isMoisEcheance(dm, debut, b.periodicite)) {
        const periodeDebut = new Date(dm);
        const periodeFin = new Date(dm.getFullYear(), dm.getMonth() + freq, 1);
        const paye = b.paiements.filter(p => { const mc = new Date(p.moisConcerne); const mp = new Date(mc.getFullYear(), mc.getMonth(), 1); return mp >= periodeDebut && mp < periodeFin; }).reduce((s, p) => s + p.montant, 0);
        const moisEcoules = Math.min(freq, (now.getFullYear() - dm.getFullYear()) * 12 + (now.getMonth() - dm.getMonth()) + 1);
        const attenduProratise = b.totalMensuel * moisEcoules;
        if (paye < attenduProratise) totalDu += attenduProratise - paye;
      }
      dm.setMonth(dm.getMonth() + 1);
    }
    if (totalDu > 0) impayes.push({ nom: `${b.locataire.prenom} ${b.locataire.nom}`, appart: b.appartement.numero, du: totalDu });
  }

  if (impayes.length === 0) return "🎉 **Tous les locataires sont à jour !** Aucun impayé.";
  impayes.sort((a, b) => b.du - a.du);
  const total = impayes.reduce((s, i) => s + i.du, 0);
  const lines = impayes.slice(0, 10).map(i => `• **${i.nom}** (${i.appart}) → ${fmt(i.du)}`);
  return `⚠️ **${impayes.length} locataire(s) en retard** — Total : ${fmt(total)}\n\n${lines.join("\n")}${impayes.length > 10 ? `\n\n... et ${impayes.length - 10} autres` : ""}`;
}

async function getRevenusMois() {
  const now = new Date();
  const debut = new Date(now.getFullYear(), now.getMonth(), 1);
  const fin = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const paiements = await prisma.paiement.aggregate({ where: { datePaiement: { gte: debut, lt: fin } }, _sum: { montant: true }, _count: true });
  const total = paiements._sum.montant || 0;
  const moisLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return `💰 **Encaissé en ${moisLabel} : ${fmt(total)}**\n(${paiements._count} paiements reçus)`;
}

async function getTotalEncaisse() {
  const paiements = await prisma.paiement.aggregate({ _sum: { montant: true }, _count: true });
  return `💰 **Total encaissé depuis le début : ${fmt(paiements._sum.montant || 0)}**\n(${paiements._count} paiements au total)`;
}

async function getInfoLocataire(search: string) {
  const mots = search.split(/\s+/).filter(m => m.length > 2);
  const locataire = await prisma.locataire.findFirst({
    where: { OR: mots.map(m => ({ OR: [{ nom: { contains: m, mode: "insensitive" as const } }, { prenom: { contains: m, mode: "insensitive" as const } }] })) },
    include: { baux: { where: { statut: { in: ["ACTIF", "SUSPENDU"] } }, include: { appartement: true, paiements: true } } },
  });

  if (!locataire) return `Locataire introuvable pour "${search}".`;
  const bail = locataire.baux[0];
  if (!bail) return `**${locataire.prenom} ${locataire.nom}** n'a pas de bail actif.`;

  const totalPaye = bail.paiements.reduce((s, p) => s + p.montant, 0);
  return `👤 **${locataire.prenom} ${locataire.nom}**\n• Logement : ${bail.appartement.numero}\n• Loyer : ${fmt(bail.montantLoyer)} + charges ${fmt(bail.totalCharges)}\n• Périodicité : ${bail.periodicite}\n• Total payé (bail actif) : ${fmt(totalPaye)}\n• Caution : ${bail.cautionPayee ? "✅ Payée" : "❌ Non payée"}`;
}

async function getBauxExpirent() {
  const dans30j = new Date();
  dans30j.setDate(dans30j.getDate() + 60);
  const baux = await prisma.bail.findMany({
    where: { statut: "ACTIF", dateFin: { lte: dans30j } },
    include: { locataire: true, appartement: true },
    orderBy: { dateFin: "asc" },
  });
  if (baux.length === 0) return "✅ Aucun bail n'expire dans les 60 prochains jours.";
  const lines = baux.map(b => {
    const jours = Math.ceil((b.dateFin.getTime() - Date.now()) / 86400000);
    const statut = jours <= 0 ? "⚠️ EXPIRÉ" : `dans ${jours}j`;
    return `• **${b.locataire.prenom} ${b.locataire.nom}** (${b.appartement.numero}) — ${statut} ${b.renouvellementAuto ? "🔄 auto" : ""}`;
  });
  return `📋 **${baux.length} bail(s) expirent bientôt :**\n\n${lines.join("\n")}`;
}

function getAide() {
  return `🤖 **Assistant IMMOSTAR** — Questions possibles :\n\n• \"Qui doit combien ?\" — liste des impayés\n• \"Combien j'ai encaissé ce mois ?\" — revenus du mois\n• \"Appartements libres\" — logements disponibles\n• \"Situation de TMCO\" — infos d'un locataire\n• \"Baux qui expirent\" — baux arrivant à terme\n• \"Taux d'occupation\" — stats\n• \"Combien de locataires ?\" — nombre total`;
}
