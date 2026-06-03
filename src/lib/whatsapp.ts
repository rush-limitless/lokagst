const WHATSAPP_API = "https://graph.facebook.com/v21.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;

/** Envoie un message WhatsApp texte à un numéro (format: 237XXXXXXXXX) */
export async function envoyerWhatsApp(telephone: string, message: string) {
  if (!PHONE_NUMBER_ID || !TOKEN) return { success: false, error: "WhatsApp non configuré" };

  const numero = telephone.replace(/\s+/g, "").replace(/^\+/, "");
  const res = await fetch(`${WHATSAPP_API}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: numero,
      type: "text",
      text: { body: message },
    }),
  });

  if (!res.ok) return { success: false, error: await res.text() };
  return { success: true };
}

/** Envoie un rappel de loyer formaté */
export async function envoyerRappelWhatsApp(telephone: string, prenom: string, montant: number, mois: string) {
  const message = `Bonjour ${prenom},\n\nCeci est un rappel de la gestion IMMOSTAR SCI.\n\nVotre loyer de *${montant.toLocaleString("fr-FR")} FCFA* pour le mois de *${mois}* arrive à échéance.\n\nMerci de régulariser dans les délais.\n\n— IMMOSTAR SCI`;
  return envoyerWhatsApp(telephone, message);
}
