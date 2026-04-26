import { getConversations } from "@/actions/messagerie";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ChatBox } from "@/components/chat-box";
import { MessageSquare } from "lucide-react";

export default async function MessageriePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const conversations = await getConversations();
  const selected = id ? conversations.find((c) => c.id === id) : null;

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2"><MessageSquare className="size-6 text-primary" /> Messagerie</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 max-h-[600px] overflow-y-auto divide-y">
          {conversations.map((c) => (
            <Link key={c.id} href={`/messagerie?id=${c.id}`} className={`flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors ${c.id === id ? "bg-primary/5" : ""}`}>
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{c.prenom[0]}{c.nom[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-foreground">{c.prenom} {c.nom}</span>
                  {c.nonLus > 0 && <Badge variant="destructive" className="text-xs">{c.nonLus}</Badge>}
                </div>
                {c.dernierMessage && <p className="text-xs text-muted-foreground truncate">{c.dernierMessage}</p>}
              </div>
            </Link>
          ))}
        </Card>
        <div className="md:col-span-2">
          {selected ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Conversation avec <strong className="text-foreground">{selected.prenom} {selected.nom}</strong></p>
              <ChatBox locataireId={selected.id} role="GESTIONNAIRE" />
            </div>
          ) : (
            <Card className="flex items-center justify-center h-[500px] text-muted-foreground">Sélectionnez un locataire</Card>
          )}
        </div>
      </div>
    </div>
  );
}
