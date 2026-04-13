import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { email, mdp } = await req.json();
  if (!email || !mdp) return NextResponse.json({ error: "Données manquantes" }, { status: 400 });

  await sendEmail(
    email,
    "Vos identifiants ImmoGest — IMMOSTAR SCI",
    `<h2>Bienvenue sur ImmoGest</h2>
<p>Votre compte locataire a été créé. Voici vos identifiants :</p>
<p><strong>Email :</strong> ${email}<br/><strong>Mot de passe :</strong> ${mdp}</p>
<p>Connectez-vous sur <a href="https://lokagst.vercel.app">lokagst.vercel.app</a></p>
<p>Nous vous recommandons de changer votre mot de passe après la première connexion.</p>
<p>— IMMOSTAR SCI</p>`,
  );

  return NextResponse.json({ ok: true });
}
