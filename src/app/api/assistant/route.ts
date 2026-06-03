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
  // --- Salutations ---
  if (match(q, ["bonjour", "salut", "hello", "bonsoir", "hey", "coucou"])) {
    return "👋 Bonjour ! Comment puis-je vous aider aujourd'hui ?\n\nTapez **aide** pour voir tout ce que je peux faire.";
  }

  // --- Merci ---
  if (match(q, ["merci", "thanks", "parfait", "super", "genial"])) {
    return "🙏 Avec plaisir ! N'hésitez pas si vous avez d'autres questions.";
  }

  // --- Résumé global / dashboard ---
  if (match(q, ["resume", "synthese", "dashboard", "bilan", "situation generale", "comment ca va", "etat"])) {
    return await getResume();
  }

  // --- Impayés / dettes ---
  if (match(q, ["qui doit", "impayes", "impaye", "en retard", "dettes", "doivent", "pas paye", "retard"])) {
    return await getImpayes();
  }

  // --- Locataires à jour ---
  if (match(q, ["a jour", "bons payeurs", "qui a paye", "regulier"])) {
    return await getAJour();
  }

  // --- Encaissé ce mois ---
  if (match(q, ["encaisse", "recu", "revenus", "gagne"]) && match(q, ["mois", "ce mois", "mensuel", "juin", "mai"])) {
    return await getRevenusMois();
  }

  // --- Comparaison mois ---
  if (match(q, ["compare", "comparaison", "evolution", "progres", "mois dernier"])) {
    return await getComparaisonMois();
  }

  // --- Total encaissé ---
  if (match(q, ["total encaisse", "total recu", "total paye", "depuis le debut"])) {
    return await getTotalEncaisse();
  }

  // --- Revenus par immeuble ---
  if (match(q, ["par immeuble", "par batiment", "chaque immeuble", "repartition"])) {
    return await getRevenusParImmeuble();
  }

  // --- Combien de locataires ---
  if (match(q, ["combien"]) && match(q, ["locataire"])) {
    const actifs = await prisma.bail.count({ where: { statut: "ACTIF" } });
    const suspendus = await prisma.bail.count({ where: { statut: "SUSPENDU" } });
    return `👥 **${actifs + suspendus} locataires** au total :\n• ${actifs} actifs\n• ${suspendus} suspendus`;
  }

  // --- Appartements libres ---
  if (match(q, ["libre", "disponible", "vacant", "vide"])) {
    const libres = await prisma.appartement.findMany({ where: { statut: "LIBRE" }, include: { immeuble: true } });
    if (libres.length === 0) return "🎉 Aucun logement libre ! Taux d'occupation : **100%**";
    return `🏠 **${libres.length} logement(s) libre(s) :**\n${libres.map(a => `• ${a.numero} (${a.immeuble?.nom || "—"}, ${a.etage})`).join("\n")}`;
  }

  // --- Cautions ---
  if (match(q, ["caution", "depot", "garantie"])) {
    return await getCautions();
  }

  // --- Dépenses ---
  if (match(q, ["depense", "depenses", "cout", "charge", "frais"])) {
    return await getDepenses();
  }

  // --- Derniers paiements ---
  if (match(q, ["dernier", "recent", "derniers paiements", "historique"])) {
    return await getDerniersPaiements();
  }

  // --- Meilleur / pire payeur ---
  if (match(q, ["meilleur", "pire", "classement", "top", "flop"])) {
    return await getClassement();
  }

  // --- Infos sur un locataire (recherche par nom) ---
  const locMatch = q.match(/(?:situation|info|doit|solde|dette|fiche|profil|details?).*?(?:de |du |pour |sur )([a-z\s]+)/);
  if (locMatch) return await getInfoLocataire(locMatch[1].trim());

  // Noms directs connus
  const nomsConnus = ["tmco", "atg", "transfer", "bass", "essouka", "onana", "mamoudou", "bella", "fowe", "kounchou", "sop", "toua", "djietcheu", "djimpong", "ananfack", "moumoite", "dzali", "mbakop", "mfome", "sakme", "atchang", "tchetgnia", "gab", "ada", "nga"];
  for (const nom of nomsConnus) {
    if (q.includes(nom)) return await getInfoLocataire(nom);
  }

  // --- Baux expirent bientôt ---
  if (match(q, ["expire", "expiration", "fin de bail", "renouvellement", "termine bientot"])) {
    return await getBauxExpirent();
  }

  // --- Taux d'occupation ---
  if (match(q, ["taux", "occupation", "rempli"])) {
    return await getTauxOccupation();
  }

  // --- Maintenance ---
  if (match(q, ["maintenance", "reparation", "panne", "ticket", "travaux"])) {
    return await getMaintenance();
  }

  // --- Pénalités ---
  if (match(q, ["penalite", "penalites", "amende"])) {
    return await getPenalites();
  }

  // --- Rentabilité ---
  if (match(q, ["rentabilite", "rendement", "rapport", "benefice", "profit"])) {
    return await getRentabilite();
  }

  // --- Aide ---
  if (match(q, ["aide", "help", "quoi", "comment", "peux", "capable", "fonctions"])) {
    return getAide();
  }

  // --- Fallback intelligent ---
  return getFallback();
}

function match(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k));
}

function fmt(n: number): string {
  return n.toLocaleString("fr-FR") + " FCFA";
}

// ============================
// HANDLERS
// ============================

async function getResume() {
  const now = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
  const [totalLoc, libres, paiementsMois, totalImpayes] = await Promise.all([
    prisma.bail.count({ where: { statut: { in: ["ACTIF", "SUSPENDU"] } } }),
    prisma.appartement.count({ where: { statut: "LIBRE" } }),
    prisma.paiement.aggregate({ where: { datePaiement: { gte: debutMois } }, _sum: { montant: true }, _count: true }),
    getImpayes(),
  ]);
  const encaisseMois = paiementsMois._sum.montant || 0;
  const total = await prisma.appartement.count();
  const taux = Math.round((total - libres) / total * 100);

  return `📊 **Résumé IMMOSTAR — ${now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}**\n\n` +
    `👥 Locataires : **${totalLoc}**\n` +
    `🏠 Occupation : **${taux}%** (${libres} libre${libres > 1 ? "s" : ""})\n` +
    `💰 Encaissé ce mois : **${fmt(encaisseMois)}** (${paiementsMois._count} paie.)\n\n` +
    totalImpayes;
}

async function getImpayes() {
  const now = new Date();
  const baux = await prisma.bail.findMany({
    where: { statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { locataire: true, appartement: true, paiements: true },
  });

  const impayes: { nom: string; appart: string; du: number; mois: number }[] = [];
  for (const b of baux) {
    const freq = PERIODICITE_MOIS[b.periodicite] || 1;
    const debut = new Date(b.dateDebut);
    let totalDu = 0;
    let moisRetard = 0;
    const d = new Date(Math.max(debut.getTime(), new Date(now.getFullYear(), now.getMonth() - 23, 1).getTime()));
    const dm = new Date(d.getFullYear(), d.getMonth(), 1);
    while (dm <= now) {
      if (isMoisEcheance(dm, debut, b.periodicite)) {
        const periodeDebut = new Date(dm);
        const periodeFin = new Date(dm.getFullYear(), dm.getMonth() + freq, 1);
        const paye = b.paiements.filter(p => { const mc = new Date(p.moisConcerne); const mp = new Date(mc.getFullYear(), mc.getMonth(), 1); return mp >= periodeDebut && mp < periodeFin; }).reduce((s, p) => s + p.montant, 0);
        const moisEcoules = Math.min(freq, (now.getFullYear() - dm.getFullYear()) * 12 + (now.getMonth() - dm.getMonth()) + 1);
        const attendu = b.totalMensuel * moisEcoules;
        if (paye < attendu) { totalDu += attendu - paye; moisRetard += moisEcoules; }
      }
      dm.setMonth(dm.getMonth() + 1);
    }
    if (totalDu > 0) impayes.push({ nom: `${b.locataire.prenom} ${b.locataire.nom}`, appart: b.appartement.numero, du: totalDu, mois: moisRetard });
  }

  if (impayes.length === 0) return "🎉 **Tous les locataires sont à jour !**";
  impayes.sort((a, b) => b.du - a.du);
  const total = impayes.reduce((s, i) => s + i.du, 0);
  const lines = impayes.map(i => `• **${i.nom}** (${i.appart}) — ${fmt(i.du)} (${i.mois} mois)`);
  return `⚠️ **${impayes.length} locataire(s) en retard** — Total impayés : **${fmt(total)}**\n\n${lines.join("\n")}`;
}

async function getAJour() {
  const now = new Date();
  const baux = await prisma.bail.findMany({
    where: { statut: "ACTIF" },
    include: { locataire: true, appartement: true, paiements: true },
  });

  const aJour: string[] = [];
  for (const b of baux) {
    const freq = PERIODICITE_MOIS[b.periodicite] || 1;
    const debut = new Date(b.dateDebut);
    let estAJour = true;
    const dm = new Date(debut.getFullYear(), debut.getMonth(), 1);
    while (dm <= now) {
      if (isMoisEcheance(dm, debut, b.periodicite)) {
        const periodeDebut = new Date(dm);
        const periodeFin = new Date(dm.getFullYear(), dm.getMonth() + freq, 1);
        const paye = b.paiements.filter(p => { const mc = new Date(p.moisConcerne); const mp = new Date(mc.getFullYear(), mc.getMonth(), 1); return mp >= periodeDebut && mp < periodeFin; }).reduce((s, p) => s + p.montant, 0);
        if (paye < b.totalMensuel * freq) { estAJour = false; break; }
      }
      dm.setMonth(dm.getMonth() + 1);
    }
    if (estAJour) aJour.push(`${b.locataire.prenom} ${b.locataire.nom} (${b.appartement.numero})`);
  }

  return `✅ **${aJour.length} locataire(s) à jour :**\n${aJour.map(n => `• ${n}`).join("\n")}`;
}

async function getRevenusMois() {
  const now = new Date();
  const debut = new Date(now.getFullYear(), now.getMonth(), 1);
  const fin = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const paiements = await prisma.paiement.aggregate({ where: { datePaiement: { gte: debut, lt: fin } }, _sum: { montant: true }, _count: true });
  const moisLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return `💰 **Revenus ${moisLabel} : ${fmt(paiements._sum.montant || 0)}**\n📝 ${paiements._count} paiement(s) enregistré(s)`;
}

async function getComparaisonMois() {
  const now = new Date();
  const debutCeMois = new Date(now.getFullYear(), now.getMonth(), 1);
  const debutMoisPrec = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const [ceMois, moisPrec] = await Promise.all([
    prisma.paiement.aggregate({ where: { datePaiement: { gte: debutCeMois } }, _sum: { montant: true } }),
    prisma.paiement.aggregate({ where: { datePaiement: { gte: debutMoisPrec, lt: debutCeMois } }, _sum: { montant: true } }),
  ]);
  const ce = ceMois._sum.montant || 0;
  const prec = moisPrec._sum.montant || 0;
  const diff = ce - prec;
  const pct = prec > 0 ? Math.round(diff / prec * 100) : 0;
  const emoji = diff >= 0 ? "📈" : "📉";
  const moisPrecLabel = debutMoisPrec.toLocaleDateString("fr-FR", { month: "long" });
  return `${emoji} **Comparaison mensuelle :**\n• Ce mois : ${fmt(ce)}\n• ${moisPrecLabel} : ${fmt(prec)}\n• Évolution : **${diff >= 0 ? "+" : ""}${fmt(diff)}** (${pct >= 0 ? "+" : ""}${pct}%)`;
}

async function getTotalEncaisse() {
  const paiements = await prisma.paiement.aggregate({ _sum: { montant: true }, _count: true });
  const cautions = await prisma.bail.aggregate({ where: { cautionPayee: true }, _sum: { montantCaution: true } });
  const totalPaie = paiements._sum.montant || 0;
  const totalCautions = cautions._sum.montantCaution || 0;
  return `💰 **Total encaissé :**\n• Loyers + charges : ${fmt(totalPaie)}\n• Cautions : ${fmt(totalCautions)}\n• **Grand total : ${fmt(totalPaie + totalCautions)}**\n\n(${paiements._count} paiements enregistrés)`;
}

async function getRevenusParImmeuble() {
  const immeubles = await prisma.immeuble.findMany({ include: { appartements: { include: { baux: { where: { statut: { in: ["ACTIF", "SUSPENDU"] } }, include: { paiements: true } } } } } });
  const lines = immeubles.map(i => {
    const total = i.appartements.reduce((s, a) => s + a.baux.reduce((sb, b) => sb + b.paiements.reduce((sp, p) => sp + p.montant, 0), 0), 0);
    const nbLoc = i.appartements.reduce((s, a) => s + a.baux.length, 0);
    return `• **${i.nom}** — ${fmt(total)} (${nbLoc} locataires)`;
  });
  return `🏗️ **Revenus par immeuble :**\n\n${lines.join("\n")}`;
}

async function getCautions() {
  const [payees, nonPayees] = await Promise.all([
    prisma.bail.aggregate({ where: { statut: { in: ["ACTIF", "SUSPENDU"] }, cautionPayee: true }, _sum: { montantCaution: true }, _count: true }),
    prisma.bail.findMany({ where: { statut: { in: ["ACTIF", "SUSPENDU"] }, cautionPayee: false }, include: { locataire: true, appartement: true } }),
  ]);
  let rep = `🔐 **Cautions :**\n• Payées : ${fmt(payees._sum.montantCaution || 0)} (${payees._count} baux)\n`;
  if (nonPayees.length > 0) {
    rep += `• ❌ **Non payées (${nonPayees.length}) :**\n`;
    rep += nonPayees.map(b => `  — ${b.locataire.prenom} ${b.locataire.nom} (${b.appartement.numero}) : ${fmt(b.montantCaution)}`).join("\n");
  } else {
    rep += "• ✅ Toutes les cautions sont payées !";
  }
  return rep;
}

async function getDepenses() {
  const now = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
  const [ceMois, total] = await Promise.all([
    prisma.depense.aggregate({ where: { date: { gte: debutMois } }, _sum: { montant: true }, _count: true }),
    prisma.depense.aggregate({ _sum: { montant: true }, _count: true }),
  ]);
  return `💸 **Dépenses :**\n• Ce mois : ${fmt(ceMois._sum.montant || 0)} (${ceMois._count})\n• Total historique : ${fmt(total._sum.montant || 0)} (${total._count} dépenses)`;
}

async function getDerniersPaiements() {
  const derniers = await prisma.paiement.findMany({ take: 8, orderBy: { datePaiement: "desc" }, include: { bail: { include: { locataire: true, appartement: true } } } });
  if (derniers.length === 0) return "Aucun paiement récent.";
  const lines = derniers.map(p => {
    const date = new Date(p.datePaiement).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    return `• ${date} — **${p.bail.locataire.prenom} ${p.bail.locataire.nom}** (${p.bail.appartement.numero}) : ${fmt(p.montant)}`;
  });
  return `🕐 **Derniers paiements :**\n\n${lines.join("\n")}`;
}

async function getClassement() {
  const baux = await prisma.bail.findMany({ where: { statut: "ACTIF" }, include: { locataire: true, appartement: true, paiements: true } });
  const scores = baux.map(b => ({ nom: `${b.locataire.prenom} ${b.locataire.nom}`, appart: b.appartement.numero, total: b.paiements.reduce((s, p) => s + p.montant, 0) })).sort((a, b) => b.total - a.total);
  const top3 = scores.slice(0, 3).map((s, i) => `${["🥇", "🥈", "🥉"][i]} **${s.nom}** (${s.appart}) — ${fmt(s.total)}`);
  const flop3 = scores.slice(-3).reverse().map((s, i) => `${i + 1}. ${s.nom} (${s.appart}) — ${fmt(s.total)}`);
  return `🏆 **Top 3 payeurs :**\n${top3.join("\n")}\n\n📉 **3 plus faibles :**\n${flop3.join("\n")}`;
}

async function getInfoLocataire(search: string) {
  const mots = search.split(/\s+/).filter(m => m.length > 2);
  if (mots.length === 0) return "Précisez le nom du locataire.";
  const locataire = await prisma.locataire.findFirst({
    where: { OR: mots.map(m => ({ OR: [{ nom: { contains: m, mode: "insensitive" as const } }, { prenom: { contains: m, mode: "insensitive" as const } }] })) },
    include: { baux: { include: { appartement: true, paiements: { orderBy: { datePaiement: "desc" } } } } },
  });
  if (!locataire) return `❌ Locataire introuvable pour "${search}".`;
  const bail = locataire.baux.find(b => b.statut === "ACTIF" || b.statut === "SUSPENDU");
  const totalTousBaux = locataire.baux.reduce((s, b) => s + b.paiements.reduce((sp, p) => sp + p.montant, 0), 0);
  const dernierPaie = locataire.baux.flatMap(b => b.paiements).sort((a, b) => new Date(b.datePaiement).getTime() - new Date(a.datePaiement).getTime())[0];

  let rep = `👤 **${locataire.prenom} ${locataire.nom}**\n📞 ${locataire.telephone || "—"}\n\n`;
  if (bail) {
    rep += `🏠 Logement : **${bail.appartement.numero}**\n`;
    rep += `💵 Loyer : ${fmt(bail.montantLoyer)} + charges ${fmt(bail.totalCharges)} = **${fmt(bail.totalMensuel)}/mois**\n`;
    rep += `📅 Bail : ${new Date(bail.dateDebut).toLocaleDateString("fr-FR")} → ${new Date(bail.dateFin).toLocaleDateString("fr-FR")}\n`;
    rep += `🔄 Périodicité : ${bail.periodicite}\n`;
    rep += `🔐 Caution : ${bail.cautionPayee ? "✅ " + fmt(bail.montantCaution) : "❌ Non payée (" + fmt(bail.montantCaution) + ")"}\n`;
    rep += `💰 Total payé (tous baux) : **${fmt(totalTousBaux)}**\n`;
  } else {
    rep += "⚠️ Pas de bail actif.\n";
    rep += `💰 Total payé historique : ${fmt(totalTousBaux)}\n`;
  }
  if (dernierPaie) {
    rep += `\n🕐 Dernier paiement : ${new Date(dernierPaie.datePaiement).toLocaleDateString("fr-FR")} — ${fmt(dernierPaie.montant)}`;
  }
  return rep;
}

async function getBauxExpirent() {
  const dans60j = new Date();
  dans60j.setDate(dans60j.getDate() + 60);
  const baux = await prisma.bail.findMany({
    where: { statut: "ACTIF", dateFin: { lte: dans60j } },
    include: { locataire: true, appartement: true },
    orderBy: { dateFin: "asc" },
  });
  if (baux.length === 0) return "✅ Aucun bail n'expire dans les 60 prochains jours.";
  const lines = baux.map(b => {
    const jours = Math.ceil((b.dateFin.getTime() - Date.now()) / 86400000);
    const statut = jours <= 0 ? "🔴 EXPIRÉ" : jours <= 15 ? `🟠 ${jours}j` : `🟡 ${jours}j`;
    return `• **${b.locataire.prenom} ${b.locataire.nom}** (${b.appartement.numero}) — ${statut} ${b.renouvellementAuto ? "🔄" : "⚠️ manuel"}`;
  });
  return `📋 **${baux.length} bail(s) à surveiller :**\n\n${lines.join("\n")}`;
}

async function getTauxOccupation() {
  const immeubles = await prisma.immeuble.findMany({ include: { appartements: true } });
  const lines = immeubles.map(i => {
    const total = i.appartements.length;
    const occ = i.appartements.filter(a => a.statut === "OCCUPE").length;
    const taux = Math.round(occ / total * 100);
    const bar = "█".repeat(Math.round(taux / 10)) + "░".repeat(10 - Math.round(taux / 10));
    return `• **${i.nom}** : ${bar} ${taux}% (${occ}/${total})`;
  });
  const totalA = immeubles.reduce((s, i) => s + i.appartements.length, 0);
  const totalO = immeubles.reduce((s, i) => s + i.appartements.filter(a => a.statut === "OCCUPE").length, 0);
  return `🏠 **Taux d'occupation : ${Math.round(totalO / totalA * 100)}%**\n\n${lines.join("\n")}`;
}

async function getMaintenance() {
  const [ouverts, enCours, termines] = await Promise.all([
    prisma.maintenance.count({ where: { statut: "SIGNALE" } }),
    prisma.maintenance.count({ where: { statut: "EN_COURS" } }),
    prisma.maintenance.count({ where: { statut: "RESOLU" } }),
  ]);
  const recents = await prisma.maintenance.findMany({ take: 5, orderBy: { creeLe: "desc" }, include: { appartement: true } });
  let rep = `🔧 **Maintenance :**\n• 🔴 Signalés : ${ouverts}\n• 🟠 En cours : ${enCours}\n• ✅ Terminés : ${termines}`;
  if (recents.length > 0) {
    rep += "\n\n**Récents :**\n";
    rep += recents.map(m => `• ${m.appartement.numero} — ${m.description?.slice(0, 40) || "—"} (${m.statut})`).join("\n");
  }
  return rep;
}

async function getPenalites() {
  const [impayees, total] = await Promise.all([
    prisma.penalite.aggregate({ where: { payee: false }, _sum: { montant: true }, _count: true }),
    prisma.penalite.aggregate({ _sum: { montant: true }, _count: true }),
  ]);
  return `⚡ **Pénalités :**\n• Impayées : **${fmt(impayees._sum.montant || 0)}** (${impayees._count})\n• Total historique : ${fmt(total._sum.montant || 0)} (${total._count})`;
}

async function getRentabilite() {
  const revenus = await prisma.paiement.aggregate({ _sum: { montant: true } });
  const depenses = await prisma.depense.aggregate({ _sum: { montant: true } });
  const rev = revenus._sum.montant || 0;
  const dep = depenses._sum.montant || 0;
  const net = rev - dep;
  const marge = rev > 0 ? Math.round(net / rev * 100) : 0;
  return `📊 **Rentabilité globale :**\n• Revenus : ${fmt(rev)}\n• Dépenses : ${fmt(dep)}\n• **Bénéfice net : ${fmt(net)}**\n• Marge : ${marge}%`;
}

function getAide() {
  return `🤖 **Assistant IMMOSTAR** — Voici ce que je sais faire :\n\n` +
    `📊 **Synthèse**\n• "Résumé" — tableau de bord complet\n• "Comparaison" — ce mois vs mois dernier\n\n` +
    `💰 **Finances**\n• "Qui doit combien ?" — impayés\n• "Qui est à jour ?" — bons payeurs\n• "Encaissé ce mois" — revenus\n• "Total encaissé" — historique\n• "Par immeuble" — répartition\n• "Rentabilité" — bilan net\n• "Dépenses" — coûts\n\n` +
    `👤 **Locataires**\n• "Situation de [nom]" — fiche complète\n• "Classement" — top et flop payeurs\n• "Cautions" — état des dépôts\n\n` +
    `🏠 **Logements**\n• "Appartements libres"\n• "Taux d'occupation"\n• "Baux qui expirent"\n\n` +
    `🔧 **Autres**\n• "Maintenance" — tickets\n• "Pénalités" — amendes\n• "Derniers paiements"`;
}

function getFallback() {
  return "🤔 Je n'ai pas bien compris. Voici quelques suggestions :\n\n" +
    `• **"Résumé"** — vue globale\n` +
    `• **"Qui doit ?"** — impayés\n` +
    `• **"TMCO"** ou **"ATG 1"** — fiche locataire\n` +
    `• **"Aide"** — toutes mes capacités`;
}
