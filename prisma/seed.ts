import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Nettoyer
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

  // Immeuble
  const immeuble = await prisma.immeuble.create({ data: { nom: "Résidence La'ag Tchang", adresse: "Nkolfoulou", ville: "Yaoundé", quartier: "Nkolfoulou" } });

  // Admin
  const adminPwd = await hash("admin123", 12);
  await prisma.utilisateur.create({ data: { email: "admin@immostar.cm", motDePasse: adminPwd, role: "GESTIONNAIRE" } });

  // Appartements
  const apparts = [
    { numero: "APPART A11", etage: "PREMIER" as const, type: "T3" as const, loyerBase: 150000 },
    { numero: "APPART A12", etage: "PREMIER" as const, type: "T3" as const, loyerBase: 150000 },
    { numero: "APPART B13", etage: "PREMIER" as const, type: "T3" as const, loyerBase: 150000 },
    { numero: "APPART B14", etage: "PREMIER" as const, type: "T3" as const, loyerBase: 150000 },
    { numero: "APPART A21", etage: "DEUXIEME" as const, type: "T3" as const, loyerBase: 150000 },
    { numero: "APPART A22", etage: "DEUXIEME" as const, type: "T3" as const, loyerBase: 150000 },
    { numero: "APPART B23", etage: "DEUXIEME" as const, type: "T3" as const, loyerBase: 150000 },
    { numero: "APPART B24", etage: "DEUXIEME" as const, type: "T3" as const, loyerBase: 150000 },
    { numero: "STUDIO A31", etage: "TROISIEME" as const, type: "STUDIO" as const, loyerBase: 90000 },
    { numero: "STUDIO A32", etage: "TROISIEME" as const, type: "STUDIO" as const, loyerBase: 90000 },
    { numero: "CHAMBRE A33", etage: "TROISIEME" as const, type: "STUDIO" as const, loyerBase: 40000 },
    { numero: "CHAMBRE A34", etage: "TROISIEME" as const, type: "STUDIO" as const, loyerBase: 45000 },
    { numero: "CHAMBRE B35", etage: "TROISIEME" as const, type: "STUDIO" as const, loyerBase: 40000 },
    { numero: "CHAMBRE B36", etage: "TROISIEME" as const, type: "STUDIO" as const, loyerBase: 40000 },
    { numero: "STUDIO B37", etage: "TROISIEME" as const, type: "STUDIO" as const, loyerBase: 90000 },
    { numero: "STUDIO B38", etage: "TROISIEME" as const, type: "STUDIO" as const, loyerBase: 90000 },
    { numero: "STUDIO A41", etage: "QUATRIEME" as const, type: "STUDIO" as const, loyerBase: 80000 },
    { numero: "STUDIO A42", etage: "QUATRIEME" as const, type: "STUDIO" as const, loyerBase: 80000 },
    { numero: "CHAMBRE B44", etage: "QUATRIEME" as const, type: "STUDIO" as const, loyerBase: 45000 },
    { numero: "CHAMBRE B45", etage: "QUATRIEME" as const, type: "STUDIO" as const, loyerBase: 40000 },
    { numero: "CHAMBRE B46", etage: "QUATRIEME" as const, type: "STUDIO" as const, loyerBase: 45000 },
    { numero: "CHAMBRE B43", etage: "QUATRIEME" as const, type: "STUDIO" as const, loyerBase: 45000 },
    { numero: "STUDIO B48", etage: "QUATRIEME" as const, type: "STUDIO" as const, loyerBase: 80000 },
    { numero: "STUDIO B47", etage: "QUATRIEME" as const, type: "STUDIO" as const, loyerBase: 80000 },
    { numero: "STUDIO B01", etage: "RDC" as const, type: "STUDIO" as const, loyerBase: 100000 },
    { numero: "RDC GAB", etage: "RDC" as const, type: "T2" as const, loyerBase: 50000 },
    { numero: "RDC IT", etage: "RDC" as const, type: "T4" as const, loyerBase: 300000 },
    { numero: "RDC SB", etage: "RDC" as const, type: "T3" as const, loyerBase: 150000 },
    { numero: "ETAGE SB", etage: "PREMIER" as const, type: "T3" as const, loyerBase: 170000 },
  ];

  for (const a of apparts) {
    await prisma.appartement.create({ data: { ...a, immeubleId: immeuble.id } });
  }
  console.log(`${apparts.length} appartements créés`);

  // Locataires + Baux
  const locataires = [
    { nom: "TJOMB", prenom: "Suzanne Véronèse Gradiella", tel: "600000001", appart: "APPART A11", loyer: 150000, charges: 7500, caution: 300000, debut: "2025-02-01", duree: 12 },
    { nom: "ESSOUKA ENGBOM", prenom: "Line", tel: "600000002", appart: "APPART A12", loyer: 150000, charges: 7500, caution: 300000, debut: "2024-06-01", duree: 12 },
    { nom: "ATG 1", prenom: "", tel: "600000003", appart: "APPART B13", loyer: 150000, charges: 7500, caution: 300000, debut: "2023-07-01", duree: 24 },
    { nom: "ATG 2", prenom: "", tel: "600000004", appart: "APPART B14", loyer: 150000, charges: 7500, caution: 300000, debut: "2023-07-01", duree: 24 },
    { nom: "TMCO", prenom: "", tel: "600000005", appart: "APPART A21", loyer: 150000, charges: 7500, caution: 450000, debut: "2023-05-01", duree: 36 },
    { nom: "NGA NDZANA", prenom: "Marie Thérèse Letissa", tel: "600000006", appart: "APPART A22", loyer: 150000, charges: 7500, caution: 300000, debut: "2024-11-01", duree: 12 },
    { nom: "ESSOUKA ENGBOM", prenom: "Line (B23)", tel: "600000027", appart: "APPART B23", loyer: 150000, charges: 7500, caution: 300000, debut: "2025-04-01", duree: 12 },
    { nom: "TCHETGNIA", prenom: "Alex-Ariel", tel: "600000008", appart: "APPART B24", loyer: 150000, charges: 7500, caution: 450000, debut: "2024-03-01", duree: 12 },
    { nom: "MFOME", prenom: "Soulemanou", tel: "600000028", appart: "STUDIO A31", loyer: 90000, charges: 4500, caution: 180000, debut: "2025-05-01", duree: 12 },
    { nom: "SAKME EUBRINE", prenom: "Ekuka", tel: "600000029", appart: "STUDIO A32", loyer: 90000, charges: 4500, caution: 180000, debut: "2025-07-01", duree: 12 },
    { nom: "DJIETCHEU", prenom: "Yvan Cabrel", tel: "600000011", appart: "CHAMBRE A33", loyer: 40000, charges: 2000, caution: 80000, debut: "2023-12-01", duree: 24 },
    { nom: "ATCHANG", prenom: "Thérèse Nathalie", tel: "600000030", appart: "CHAMBRE A34", loyer: 45000, charges: 2500, caution: 90000, debut: "2025-04-01", duree: 12 },
    { nom: "DJIMPONG KOM", prenom: "Antoine", tel: "600000013", appart: "CHAMBRE B35", loyer: 40000, charges: 2000, caution: 80000, debut: "2024-01-01", duree: 24 },
    { nom: "ADA BILE", prenom: "Christine", tel: "600000014", appart: "CHAMBRE B36", loyer: 40000, charges: 2000, caution: 80000, debut: "2024-01-01", duree: 24 },
    { nom: "BITIMBHE", prenom: "Fred Aurélien", tel: "600000015", appart: "STUDIO B37", loyer: 90000, charges: 4500, caution: 180000, debut: "2023-08-01", duree: 24 },
    { nom: "MBAKOP WATMOU", prenom: "Kevin Victoire", tel: "600000016", appart: "STUDIO B38", loyer: 90000, charges: 4500, caution: 180000, debut: "2024-07-01", duree: 12 },
    { nom: "TOUA MEKA", prenom: "Michèle Sixtine", tel: "600000017", appart: "STUDIO A41", loyer: 80000, charges: 4000, caution: 160000, debut: "2023-06-01", duree: 24 },
    { nom: "SOP", prenom: "Gaël Brice", tel: "600000018", appart: "STUDIO A42", loyer: 80000, charges: 4000, caution: 160000, debut: "2023-05-01", duree: 24 },
    { nom: "ANANFACK", prenom: "Aris Vinceslas", tel: "600000019", appart: "CHAMBRE B44", loyer: 45000, charges: 2500, caution: 90000, debut: "2023-12-01", duree: 24 },
    { nom: "MOUMOITE", prenom: "Denise", tel: "600000020", appart: "CHAMBRE B45", loyer: 40000, charges: 2000, caution: 80000, debut: "2023-10-01", duree: 24 },
    { nom: "DZALI DIKAPA", prenom: "Aimyll Prosperre", tel: "600000021", appart: "CHAMBRE B46", loyer: 45000, charges: 2500, caution: 90000, debut: "2024-10-01", duree: 12 },
    { nom: "KAMNING", prenom: "Falone-Valera", tel: "600000022", appart: "CHAMBRE B43", loyer: 45000, charges: 2500, caution: 90000, debut: "2024-01-01", duree: 24 },
    { nom: "KOUNCHOU KOUNCHOU", prenom: "Lévi Boris", tel: "600000023", appart: "STUDIO B48", loyer: 80000, charges: 4000, caution: 160000, debut: "2023-05-01", duree: 24 },
    { nom: "FOWE WETCHOUGA", prenom: "Bernard", tel: "600000024", appart: "STUDIO B47", loyer: 80000, charges: 4000, caution: 160000, debut: "2023-05-01", duree: 24 },
    { nom: "BELLA BILAI", prenom: "Ghislain", tel: "600000025", appart: "STUDIO B01", loyer: 100000, charges: 5000, caution: 200000, debut: "2023-12-01", duree: 24 },
    { nom: "GAB", prenom: "", tel: "600000026", appart: "RDC GAB", loyer: 50000, charges: 2500, caution: 100000, debut: "2023-11-01", duree: 24 },
    { nom: "IT", prenom: "", tel: "600000009", appart: "RDC IT", loyer: 300000, charges: 15000, caution: 900000, debut: "2023-05-01", duree: 36 },
    { nom: "MAMOUDOU", prenom: "Moussa", tel: "600000031", appart: "RDC SB", loyer: 155000, charges: 5000, caution: 310000, debut: "2025-07-01", duree: 12 },
    { nom: "ONANA", prenom: "Lydie Sylvie", tel: "600000010", appart: "ETAGE SB", loyer: 170000, charges: 8500, caution: 340000, debut: "2024-05-01", duree: 12 },
  ];

  for (const l of locataires) {
    const appart = await prisma.appartement.findUnique({ where: { numero: l.appart } });
    if (!appart) { console.log("Appart non trouvé:", l.appart); continue; }

    const locataire = await prisma.locataire.create({
      data: { nom: l.nom, prenom: l.prenom || l.nom, telephone: l.tel, dateEntree: new Date(l.debut) },
    });

    const dateDebut = new Date(l.debut);
    const dateFin = new Date(dateDebut);
    dateFin.setMonth(dateFin.getMonth() + l.duree);
    const totalCharges = l.charges;
    const totalMensuel = l.loyer + l.charges;

    await prisma.bail.create({
      data: {
        locataireId: locataire.id, appartementId: appart.id,
        dateDebut, dureeMois: l.duree, dateFin,
        montantLoyer: l.loyer, montantCaution: l.caution, cautionPayee: true,
        totalCharges, totalMensuel,
        chargesLocatives: [{ type: "Charges", montant: l.charges }],
        jourLimitePaiement: 5, periodicite: "MENSUEL",
      },
    });

    await prisma.appartement.update({ where: { id: appart.id }, data: { statut: "OCCUPE" } });
    console.log("OK:", l.prenom || l.nom, l.nom, "-", l.appart);
  }

  console.log("Seed terminé !");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
