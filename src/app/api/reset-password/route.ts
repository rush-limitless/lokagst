import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

  const user = await prisma.utilisateur.findUnique({ where: { email } });
  // Toujours répondre OK pour ne pas révéler si l'email existe
  if (!user) return NextResponse.json({ ok: true });

  const token = randomBytes(32).toString("hex");
  const expire = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await prisma.utilisateur.update({
    where: { id: user.id },
    data: { resetToken: token, resetExpire: expire },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "https://lokagst.vercel.app";
  const link = `${baseUrl}/login/nouveau-mdp?token=${token}`;

  const html = `
    <div style="font-family:Arial;max-width:500px;margin:0 auto">
      <div style="background:#1B6B9E;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0">
        <h2 style="margin:0">ImmoGest — IMMOSTAR SCI</h2>
      </div>
      <div style="padding:20px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px">
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p style="text-align:center;margin:25px 0">
          <a href="${link}" style="background:#29ABE2;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Réinitialiser mon mot de passe</a>
        </p>
        <p style="color:#666;font-size:12px">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
      </div>
    </div>
  `;

  try {
    await sendEmail(email, "Réinitialisation de mot de passe — ImmoGest", html);
  } catch {}

  return NextResponse.json({ ok: true });
}
