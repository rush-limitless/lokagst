import { auth } from "@/lib/auth";
import { ChatBox } from "@/components/chat-box";
import { redirect } from "next/navigation";

export default async function MaMessagerie() {
  const session = await auth();
  if (!session?.user?.locataireId) redirect("/login");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-blue-950">Messagerie</h1>
      <p className="text-sm text-gray-500">Échangez avec la gestion FINSTAR</p>
      <ChatBox locataireId={session.user.locataireId} role="LOCATAIRE" />
    </div>
  );
}
