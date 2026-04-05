import { getConversations } from "@/actions/messagerie";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChatBox } from "@/components/chat-box";

export default async function MessageriePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const conversations = await getConversations();
  const selected = id ? conversations.find((c) => c.id === id) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Messagerie</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border divide-y md:col-span-1 max-h-[600px] overflow-y-auto">
          {conversations.map((c) => (
            <Link key={c.id} href={`/messagerie?id=${c.id}`} className={`flex items-center gap-3 p-3 hover:bg-gray-50 ${c.id === id ? "bg-blue-50" : ""}`}>
              {c.photo ? <img src={c.photo} alt="" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{c.prenom[0]}{c.nom[0]}</div>}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{c.prenom} {c.nom}</span>
                  {c.nonLus > 0 && <Badge variant="destructive" className="text-xs">{c.nonLus}</Badge>}
                </div>
                {c.dernierMessage && <p className="text-xs text-gray-500 truncate">{c.dernierMessage}</p>}
              </div>
            </Link>
          ))}
        </div>
        <div className="md:col-span-2">
          {selected ? (
            <div>
              <p className="text-sm text-gray-500 mb-2">Conversation avec <strong>{selected.prenom} {selected.nom}</strong></p>
              <ChatBox locataireId={selected.id} role="GESTIONNAIRE" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[500px] bg-white rounded-lg border text-gray-400">Sélectionnez un locataire</div>
          )}
        </div>
      </div>
    </div>
  );
}
