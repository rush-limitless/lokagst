import { auth } from "@/lib/auth";
import { ChatBox } from "@/components/chat-box";
import { redirect } from "next/navigation";

export default async function MaMessagerie() {
  const session = await auth();
  if (!session?.user?.locataireId) redirect("/login");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Messagerie</h1>
      <p className="text-sm text-muted-foreground">Échangez avec la gestion IMMOSTAR SCI</p>
      <ChatBox locataireId={session.user.locataireId} role="LOCATAIRE" />
    </div>
  );
}
