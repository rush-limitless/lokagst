import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("admin123", 12);

  await prisma.utilisateur.upsert({
    where: { email: "admin@finstar.cm" },
    update: {},
    create: { email: "admin@finstar.cm", motDePasse: passwordHash, role: "GESTIONNAIRE" },
  });

  const apparts = [
    { numero: "A1", etage: "RDC" as const, type: "STUDIO" as const, loyerBase: 35000 },
    { numero: "A2", etage: "RDC" as const, type: "T2" as const, loyerBase: 50000 },
    { numero: "B1", etage: "PREMIER" as const, type: "T2" as const, loyerBase: 55000 },
    { numero: "B2", etage: "PREMIER" as const, type: "T3" as const, loyerBase: 70000 },
    { numero: "C1", etage: "DEUXIEME" as const, type: "STUDIO" as const, loyerBase: 40000 },
    { numero: "C2", etage: "DEUXIEME" as const, type: "T2" as const, loyerBase: 55000 },
    { numero: "D1", etage: "TROISIEME" as const, type: "T3" as const, loyerBase: 75000 },
    { numero: "D2", etage: "TROISIEME" as const, type: "T4" as const, loyerBase: 90000 },
    { numero: "E1", etage: "QUATRIEME" as const, type: "T2" as const, loyerBase: 60000 },
    { numero: "E2", etage: "QUATRIEME" as const, type: "T4" as const, loyerBase: 95000 },
  ];

  for (const a of apparts) {
    await prisma.appartement.upsert({ where: { numero: a.numero }, update: {}, create: a });
  }

  const locatairesData = [
    { nom: "Mbarga", prenom: "Paul", telephone: "677123456", email: "paul.mbarga@email.cm", appart: "A2", loyer: 50000 },
    { nom: "Ngo Bassa", prenom: "Marie", telephone: "699876543", email: "marie.ngobassa@email.cm", appart: "B1", loyer: 55000 },
    { nom: "Fotso", prenom: "Jean", telephone: "655112233", email: "jean.fotso@email.cm", appart: "C2", loyer: 55000 },
    { nom: "Eyinga", prenom: "Rose", telephone: "690445566", email: "rose.eyinga@email.cm", appart: "D1", loyer: 75000 },
    { nom: "Tchinda", prenom: "Samuel", telephone: "678998877", email: "samuel.tchinda@email.cm", appart: "E1", loyer: 60000 },
  ];

  const locatairePassword = await hash("locataire123", 12);

  for (const l of locatairesData) {
    const appartement = await prisma.appartement.findUnique({ where: { numero: l.appart } });
    if (!appartement) continue;

    const locataire = await prisma.locataire.upsert({
      where: { email: l.email },
      update: {},
      create: { nom: l.nom, prenom: l.prenom, telephone: l.telephone, email: l.email, dateEntree: new Date("2026-01-01") },
    });

    await prisma.utilisateur.upsert({
      where: { email: l.email },
      update: {},
      create: { email: l.email, motDePasse: locatairePassword, role: "LOCATAIRE", locataireId: locataire.id },
    });

    await prisma.appartement.update({ where: { id: appartement.id }, data: { statut: "OCCUPE" } });

    const bail = await prisma.bail.create({
      data: {
        locataireId: locataire.id, appartementId: appartement.id,
        dateDebut: new Date("2026-01-01"), dureeMois: 12, dateFin: new Date("2026-12-31"),
        montantLoyer: l.loyer, montantCaution: l.loyer * 2,
      },
    });

    for (let m = 0; m < 3; m++) {
      await prisma.paiement.create({
        data: {
          bailId: bail.id, montant: l.loyer,
          moisConcerne: new Date(2026, m, 1), datePaiement: new Date(2026, m, 5),
          modePaiement: m % 2 === 0 ? "VIREMENT_BANCAIRE" : "ORANGE_MONEY",
        },
      });
    }
  }

  console.log("Seed terminé !");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
