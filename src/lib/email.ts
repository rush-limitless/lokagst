import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendEmail(to: string, subject: string, html: string) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM || "ImmoGest <noreply@finstar.cm>",
    to,
    subject,
    html,
  });
}

export function genererEmailRappel(prenom: string, nom: string, montant: number, mois: string) {
  return {
    sujet: `Rappel de paiement — ${mois}`,
    contenu: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#003366;color:white;padding:20px;text-align:center">
          <h1 style="margin:0">ImmoGest</h1>
          <p style="margin:5px 0 0;opacity:0.8">IMMOSTAR SCI — Gestion Locative</p>
        </div>
        <div style="padding:20px;border:1px solid #eee">
          <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
          <p>Nous vous rappelons que votre loyer du mois de <strong>${mois}</strong> d'un montant de <strong>${montant.toLocaleString("fr-FR")} FCFA</strong> n'a pas encore été réglé.</p>
          <p>Merci de procéder au paiement dans les meilleurs délais.</p>
          <p>Cordialement,<br>La gestion IMMOSTAR SCI</p>
        </div>
      </div>`,
  };
}

export function genererEmailRecu(prenom: string, nom: string, montant: number, mois: string, mode: string, date: string, appartement: string) {
  return {
    sujet: `Reçu de paiement — ${mois}`,
    contenu: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#003366;color:white;padding:20px;text-align:center">
          <h1 style="margin:0">ImmoGest</h1>
          <p style="margin:5px 0 0;opacity:0.8">IMMOSTAR SCI — Reçu de paiement</p>
        </div>
        <div style="padding:20px;border:1px solid #eee">
          <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
          <p>Nous confirmons la réception de votre paiement :</p>
          <table style="width:100%;border-collapse:collapse;margin:15px 0">
            <tr style="border-bottom:1px solid #eee"><td style="padding:8px;color:#666">Appartement</td><td style="padding:8px;font-weight:bold">${appartement}</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:8px;color:#666">Mois</td><td style="padding:8px;font-weight:bold">${mois}</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:8px;color:#666">Montant</td><td style="padding:8px;font-weight:bold">${montant.toLocaleString("fr-FR")} FCFA</td></tr>
            <tr style="border-bottom:1px solid #eee"><td style="padding:8px;color:#666">Mode</td><td style="padding:8px">${mode}</td></tr>
            <tr><td style="padding:8px;color:#666">Date</td><td style="padding:8px">${date}</td></tr>
          </table>
          <p>Merci pour votre paiement.</p>
          <p>Cordialement,<br>La gestion IMMOSTAR SCI</p>
        </div>
      </div>`,
  };
}
