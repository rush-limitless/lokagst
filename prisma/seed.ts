import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.paiement.deleteMany();
  await prisma.penalite.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.etatDesLieux.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.bail.deleteMany();
  await prisma.utilisateur.deleteMany();
  await prisma.locataire.deleteMany();
  await prisma.appartement.deleteMany();
  await prisma.immeuble.deleteMany();
  console.log("Base nettoyée");

  // Immeubles
  const imm1 = await prisma.immeuble.create({ data: { nom: "Résidence La'ag Tchang", adresse: "Nkolfoulou", ville: "Yaoundé", quartier: "Nkolfoulou" } });
  const imm2 = await prisma.immeuble.create({ data: { nom: "Santa Barbara", adresse: "Nkolfoulou", ville: "Yaoundé", quartier: "Nkolfoulou" } });

  // Admin
  const adminPwd = await hash("admin123", 12);
  await prisma.utilisateur.create({ data: { email: "admin@immostar.cm", motDePasse: adminPwd, role: "GESTIONNAIRE" } });

  // === IMMEUBLE 1 : Résidence La'ag Tchang ===
  const apparts1 = [
    // Etage 1
    { numero: "APPART A11", etage: "PREMIER" as const, type: "APPARTEMENT" as const, loyerBase: 150000, imm: imm1.id },
    { numero: "APPART A12", etage: "PREMIER" as const, type: "APPARTEMENT" as const, loyerBase: 150000, imm: imm1.id },
    { numero: "APPART B13", etage: "PREMIER" as const, type: "APPARTEMENT" as const, loyerBase: 150000, imm: imm1.id },
    { numero: "APPART B14", etage: "PREMIER" as const, type: "APPARTEMENT" as const, loyerBase: 150000, imm: imm1.id },
    // Etage 2
    { numero: "APPART A21", etage: "DEUXIEME" as const, type: "APPARTEMENT" as const, loyerBase: 150000, imm: imm1.id },
    { numero: "APPART A22", etage: "DEUXIEME" as const, type: "APPARTEMENT" as const, loyerBase: 150000, imm: imm1.id },
    { numero: "APPART B23", etage: "DEUXIEME" as const, type: "APPARTEMENT" as const, loyerBase: 150000, imm: imm1.id },
    { numero: "APPART B24", etage: "DEUXIEME" as const, type: "APPARTEMENT" as const, loyerBase: 150000, imm: imm1.id },
    // Etage 3
    { numero: "STUDIO A31", etage: "TROISIEME" as const, type: "STUDIO" as const, loyerBase: 90000, imm: imm1.id },
    { numero: "STUDIO A32", etage: "TROISIEME" as const, type: "STUDIO" as const, loyerBase: 90000, imm: imm1.id },
    { numero: "CHAMBRE A33", etage: "TROISIEME" as const, type: "CHAMBRE" as const, loyerBase: 40000, imm: imm1.id },
    { numero: "CHAMBRE A34", etage: "TROISIEME" as const, type: "CHAMBRE" as const, loyerBase: 45000, imm: imm1.id },
    { numero: "CHAMBRE B35", etage: "TROISIEME" as const, type: "CHAMBRE" as const, loyerBase: 40000, imm: imm1.id },
    { numero: "CHAMBRE B36", etage: "TROISIEME" as const, type: "CHAMBRE" as const, loyerBase: 40000, imm: imm1.id },
    { numero: "STUDIO B37", etage: "TROISIEME" as const, type: "STUDIO" as const, loyerBase: 90000, imm: imm1.id },
    { numero: "STUDIO B38", etage: "TROISIEME" as const, type: "STUDIO" as const, loyerBase: 90000, imm: imm1.id },
    // Etage 4
    { numero: "STUDIO A41", etage: "QUATRIEME" as const, type: "STUDIO" as const, loyerBase: 80000, imm: imm1.id },
    { numero: "STUDIO A42", etage: "QUATRIEME" as const, type: "STUDIO" as const, loyerBase: 80000, imm: imm1.id },
    { numero: "CHAMBRE B44", etage: "QUATRIEME" as const, type: "CHAMBRE" as const, loyerBase: 45000, imm: imm1.id },
    { numero: "CHAMBRE B45", etage: "QUATRIEME" as const, type: "CHAMBRE" as const, loyerBase: 40000, imm: imm1.id },
    { numero: "CHAMBRE B46", etage: "QUATRIEME" as const, type: "CHAMBRE" as const, loyerBase: 45000, imm: imm1.id },
    { numero: "CHAMBRE B43", etage: "QUATRIEME" as const, type: "CHAMBRE" as const, loyerBase: 45000, imm: imm1.id },
    { numero: "STUDIO B48", etage: "QUATRIEME" as const, type: "STUDIO" as const, loyerBase: 80000, imm: imm1.id },
    { numero: "STUDIO B47", etage: "QUATRIEME" as const, type: "STUDIO" as const, loyerBase: 80000, imm: imm1.id },
    // Etage 5
    { numero: "APPART MEUBLE", etage: "CINQUIEME" as const, type: "APPARTEMENT_MEUBLE" as const, loyerBase: 0, imm: imm1.id },
    // RDC
    { numero: "STUDIO B01", etage: "RDC" as const, type: "STUDIO" as const, loyerBase: 100000, imm: imm1.id },
    { numero: "RDC GAB", etage: "RDC" as const, type: "CHAMBRE" as const, loyerBase: 50000, imm: imm1.id },
    { numero: "RDC IT", etage: "RDC" as const, type: "APPARTEMENT_MEUBLE" as const, loyerBase: 300000, imm: imm1.id },
  ];

  // === IMMEUBLE 2 : Santa Barbara ===
  const apparts2 = [
    { numero: "RDC SB", etage: "RDC" as const, type: "APPARTEMENT" as const, loyerBase: 155000, imm: imm2.id },
    { numero: "ETAGE SB", etage: "PREMIER" as const, type: "APPARTEMENT" as const, loyerBase: 170000, imm: imm2.id },
  ];

  for (const a of [...apparts1, ...apparts2]) {
    await prisma.appartement.create({ data: { numero: a.numero, etage: a.etage, type: a.type, loyerBase: a.loyerBase, immeubleId: a.imm } });
  }
  console.log(`${apparts1.length + apparts2.length} appartements créés`);

  // Locataires actifs avec données exactes des images
  // Format: nom, prenom, tel, appart, loyer, charges, caution, debut (YYYY-MM-DD), duree, totalPaiements2025, totalPaiements2026, notes
  const locataires = [
    // ETAGE 1 - A11 est LIBRE (Suzanne partie)
    { nom: "ESSOUKA ENGBOM", prenom: "Line", tel: "600000002", appart: "APPART A12", loyer: 150000, charges: 7500, caution: 300000, debut: "2024-06-01", duree: 24, paiTotal: 3607500 },
    { nom: "ATG 1", prenom: "", tel: "600000003", appart: "APPART B13", loyer: 150000, charges: 15000, caution: 450000, debut: "2023-07-01", duree: 36, paiTotal: 6525000 },
    { nom: "ATG 2", prenom: "", tel: "600000004", appart: "APPART B14", loyer: 150000, charges: 15000, caution: 450000, debut: "2023-07-01", duree: 36, paiTotal: 6525000 },
    // ETAGE 2
    { nom: "TMCO", prenom: "", tel: "600000005", appart: "APPART A21", loyer: 150000, charges: 7500, caution: 450000, debut: "2023-05-01", duree: 36, paiTotal: 5490000 },
    { nom: "NGA NDZANA", prenom: "Marie Thérèse Letissa", tel: "600000006", appart: "APPART A22", loyer: 150000, charges: 7500, caution: 300000, debut: "2024-11-01", duree: 24, paiTotal: 3290000 },
    { nom: "ESSOUKA ENGBOM", prenom: "Line (B23)", tel: "600000027", appart: "APPART B23", loyer: 150000, charges: 7500, caution: 300000, debut: "2025-04-01", duree: 12, paiTotal: 2032500 },
    { nom: "TCHETGNIA", prenom: "Alex-Ariel (N-SOFT)", tel: "600000008", appart: "APPART B24", loyer: 150000, charges: 7500, caution: 450000, debut: "2024-04-01", duree: 24, paiTotal: 6120000 },
    // ETAGE 3
    { nom: "MFOME", prenom: "Soulemanou", tel: "600000028", appart: "STUDIO A31", loyer: 90000, charges: 4500, caution: 180000, debut: "2025-05-05", duree: 12, paiTotal: 1314000 },
    { nom: "SAKME EUBRINE", prenom: "Ekuka", tel: "600000029", appart: "STUDIO A32", loyer: 90000, charges: 4500, caution: 180000, debut: "2025-07-06", duree: 12, paiTotal: 1125000 },
    { nom: "DJIETCHEU", prenom: "Yvan Cabrel", tel: "600000011", appart: "CHAMBRE A33", loyer: 40000, charges: 2000, caution: 80000, debut: "2023-12-01", duree: 36, paiTotal: 1170000 },
    { nom: "ATCHANG", prenom: "Thérèse Nathalie", tel: "600000030", appart: "CHAMBRE A34", loyer: 45000, charges: 2500, caution: 90000, debut: "2025-04-01", duree: 12, paiTotal: 645000 },
    { nom: "DJIMPONG KOM", prenom: "Antoine", tel: "600000013", appart: "CHAMBRE B35", loyer: 40000, charges: 2000, caution: 80000, debut: "2024-02-05", duree: 24, paiTotal: 1130000 },
    { nom: "ADA BILE", prenom: "Christine", tel: "600000014", appart: "CHAMBRE B36", loyer: 40000, charges: 2000, caution: 80000, debut: "2024-02-10", duree: 24, paiTotal: 1172000 },
    { nom: "BITIMBHE", prenom: "Fred Aurélien", tel: "600000015", appart: "STUDIO B37", loyer: 90000, charges: 4500, caution: 180000, debut: "2023-07-24", duree: 36, paiTotal: 3155000 },
    { nom: "MBAKOP WATMOU", prenom: "Kevin Victoire", tel: "600000016", appart: "STUDIO B38", loyer: 90000, charges: 4500, caution: 180000, debut: "2024-07-22", duree: 12, paiTotal: 2164500 },
    // ETAGE 4
    { nom: "TOUA MEKA", prenom: "Michèle Sixtine", tel: "600000017", appart: "STUDIO A41", loyer: 80000, charges: 4000, caution: 160000, debut: "2023-06-20", duree: 36, paiTotal: 2823000 },
    { nom: "SOP", prenom: "Gaël Brice", tel: "600000018", appart: "STUDIO A42", loyer: 80000, charges: 4000, caution: 160000, debut: "2023-06-01", duree: 36, paiTotal: 2847000 },
    { nom: "ANANFACK", prenom: "Aris Vinceslas", tel: "600000019", appart: "CHAMBRE B44", loyer: 45000, charges: 2500, caution: 90000, debut: "2023-12-01", duree: 24, paiTotal: 1372500 },
    { nom: "MOUMOITE", prenom: "Denise", tel: "600000020", appart: "CHAMBRE B45", loyer: 40000, charges: 2000, caution: 80000, debut: "2023-09-25", duree: 36, paiTotal: 1338000 },
    { nom: "DZALI DIKAPA", prenom: "Aimyll Prosperre", tel: "600000021", appart: "CHAMBRE B46", loyer: 45000, charges: 2500, caution: 90000, debut: "2024-10-05", duree: 12, paiTotal: 945000 },
    { nom: "KAMNING", prenom: "Falone-Valera", tel: "600000022", appart: "CHAMBRE B43", loyer: 45000, charges: 2500, caution: 90000, debut: "2024-02-09", duree: 24, paiTotal: 1277500 },
    { nom: "KOUNCHOU KOUNCHOU", prenom: "Lévi Boris", tel: "600000023", appart: "STUDIO B48", loyer: 80000, charges: 4000, caution: 160000, debut: "2023-06-01", duree: 36, paiTotal: 3328000 },
    { nom: "FOWE WETCHOUGA", prenom: "Bernard", tel: "600000024", appart: "STUDIO B47", loyer: 80000, charges: 4000, caution: 160000, debut: "2023-06-01", duree: 36, paiTotal: 3186000 },
    // RDC
    { nom: "BELLA BILAI", prenom: "Ghislain", tel: "600000025", appart: "STUDIO B01", loyer: 100000, charges: 5000, caution: 200000, debut: "2023-12-07", duree: 24, paiTotal: 2895000 },
    { nom: "GAB", prenom: "", tel: "600000026", appart: "RDC GAB", loyer: 50000, charges: 2500, caution: 100000, debut: "2023-11-01", duree: 36, paiTotal: 1976800 },
    { nom: "IT", prenom: "", tel: "600000009", appart: "RDC IT", loyer: 300000, charges: 30000, caution: 900000, debut: "2023-05-01", duree: 36, paiTotal: 14940000 },
    // SANTA BARBARA
    { nom: "MAMOUDOU", prenom: "Moussa", tel: "600000031", appart: "RDC SB", loyer: 155000, charges: 5000, caution: 310000, debut: "2025-07-14", duree: 12, paiTotal: 2297300 },
    { nom: "ONANA", prenom: "Lydie Sylvie", tel: "600000010", appart: "ETAGE SB", loyer: 170000, charges: 5000, caution: 340000, debut: "2024-05-20", duree: 24, paiTotal: 4190000 },
  ];

  for (const l of locataires) {
    const appart = await prisma.appartement.findUnique({ where: { numero: l.appart } });
    if (!appart) { console.log("ERREUR appart:", l.appart); continue; }

    const locataire = await prisma.locataire.create({
      data: { nom: l.nom, prenom: l.prenom || l.nom, telephone: l.tel, dateEntree: new Date(l.debut) },
    });

    const dateDebut = new Date(l.debut);
    const dateFin = new Date(dateDebut);
    dateFin.setMonth(dateFin.getMonth() + l.duree);
    const totalMensuel = l.loyer + l.charges;

    await prisma.bail.create({
      data: {
        locataireId: locataire.id, appartementId: appart.id,
        dateDebut, dureeMois: l.duree, dateFin,
        montantLoyer: l.loyer, montantCaution: l.caution, cautionPayee: true,
        totalCharges: l.charges, totalMensuel,
        chargesLocatives: [{ type: "Charges", montant: l.charges }],
        jourLimitePaiement: 5, periodicite: "MENSUEL",
      },
    });

    await prisma.appartement.update({ where: { id: appart.id }, data: { statut: "OCCUPE" } });

    // Créer les paiements historiques basés sur le total réel
    const moisDepuisDebut = Math.ceil((Date.now() - dateDebut.getTime()) / (30.5 * 86400000));
    const moisPayes = Math.min(moisDepuisDebut, Math.floor(l.paiTotal / totalMensuel));
    
    for (let m = 0; m < moisPayes; m++) {
      const moisConcerne = new Date(dateDebut.getFullYear(), dateDebut.getMonth() + m, 1);
      if (moisConcerne > new Date()) break;
      try {
        await prisma.paiement.create({
          data: {
            bailId: (await prisma.bail.findFirst({ where: { locataireId: locataire.id } }))!.id,
            montant: totalMensuel,
            moisConcerne,
            datePaiement: new Date(moisConcerne.getFullYear(), moisConcerne.getMonth(), 5),
            modePaiement: Math.random() > 0.5 ? "VIREMENT_BANCAIRE" : "ORANGE_MONEY",
            totalDu: totalMensuel,
          },
        });
      } catch {}
    }

    console.log("OK:", l.prenom || l.nom, l.nom, "-", l.appart, `(${moisPayes} paiements)`);
  }

  // Anciens locataires (archivés)
  const anciens = [
    { nom: "SUZANNE VERONESE GRADIELLA", prenom: "Tjomb", appart: "APPART A11", debut: "2025-02-01", fin: "2026-03-01" },
    { nom: "AGUINI", prenom: "Marcelle", appart: "APPART A12", debut: "2024-03-01", fin: "2024-05-01" },
    { nom: "NOUBISSEU TOUKAM", prenom: "Nana Larissa", appart: "APPART A22", debut: "2023-11-01", fin: "2024-10-01" },
    { nom: "KAMCHE", prenom: "Armel", appart: "APPART B23", debut: "2023-09-01", fin: "2024-08-01" },
    { nom: "YOMGUI", prenom: "Armelle", appart: "APPART B24", debut: "2023-05-01", fin: "2024-01-01" },
    { nom: "KAMGAING", prenom: "Célestin", appart: "STUDIO A31", debut: "2023-06-01", fin: "2024-06-01" },
    { nom: "BEKOLO OBE", prenom: "Marie Renée", appart: "STUDIO B38", debut: "2023-05-01", fin: "2024-07-01" },
    { nom: "YAKOUBOU", prenom: "Ahoudou", appart: "CHAMBRE B46", debut: "2024-01-01", fin: "2024-09-01" },
    { nom: "MAKANG", prenom: "Jean Jacques", appart: "RDC SB", debut: "2024-05-01", fin: "2024-09-01" },
    { nom: "ATG 3 GUISSA SERY", prenom: "Jonas", appart: "APPART A11", debut: "2024-01-01", fin: "2025-01-01" },
    { nom: "CELIK", prenom: "Ahmet", appart: "APPART B23", debut: "2024-10-01", fin: "2025-01-01" },
    { nom: "SILAPEU", prenom: "Hugues Roméo", appart: "STUDIO A31", debut: "2024-07-01", fin: "2025-04-01" },
    { nom: "NGONO ROSALIE", prenom: "Marie", appart: "CHAMBRE A34", debut: "2024-01-01", fin: "2025-03-01" },
  ];

  for (const a of anciens) {
    const appart = await prisma.appartement.findUnique({ where: { numero: a.appart } });
    if (!appart) { console.log("ERREUR ancien appart:", a.appart); continue; }

    const locataire = await prisma.locataire.create({
      data: { nom: a.nom, prenom: a.prenom, telephone: "600000000", dateEntree: new Date(a.debut), dateSortie: new Date(a.fin), statut: "ARCHIVE" },
    });

    // Créer un bail historique TERMINE pour l'ancien locataire
    const dateDebut = new Date(a.debut);
    const dateFin = new Date(a.fin);
    const dureeMois = Math.max(1, Math.round((dateFin.getTime() - dateDebut.getTime()) / (30.5 * 86400000)));

    await prisma.bail.create({
      data: {
        locataireId: locataire.id, appartementId: appart.id,
        dateDebut, dureeMois, dateFin,
        montantLoyer: appart.loyerBase, montantCaution: appart.loyerBase * 2, cautionPayee: true,
        totalCharges: 0, totalMensuel: appart.loyerBase,
        chargesLocatives: [], jourLimitePaiement: 5, periodicite: "MENSUEL",
        statut: "TERMINE",
      },
    });

    console.log("Ancien:", a.prenom, a.nom, "-", a.appart, `(bail ${dureeMois} mois)`);
  }
  console.log(`${anciens.length} anciens locataires archivés avec baux historiques`);

  console.log("Seed terminé !");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
