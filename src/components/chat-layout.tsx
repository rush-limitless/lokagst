"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";
import { ChatBox } from "@/components/chat-box";
import { Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type Conversation = {
  id: string; nom: string; prenom: string; photo?: string | null;
  dernierMessage: string | null; dernierDate: Date | null; nonLus: number;
};

export function ChatLayout({ conversations, selectedId }: { conversations: Conversation[]; selectedId?: string }) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const selected = conversations.find((c) => c.id === selectedId);

  const filtered = conversations.filter((c) =>
    !search || `${c.prenom} ${c.nom}`.toLowerCase().includes(search.toLowerCase())
  );

  function formatTime(date: Date | null) {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))} min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} h`;
    if (diff < 172800000) return "Hier";
    return `${Math.floor(diff / 86400000)} j`;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-card rounded-xl border overflow-hidden">
      {/* Sidebar conversations */}
      <div className={cn("w-full md:w-80 border-r flex flex-col shrink-0", selectedId && "hidden md:flex")}>
        {/* Header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Chats</h2>
            <span className="text-xs text-muted-foreground">{conversations.length}</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              aria-label="Rechercher une conversation"
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/messagerie?id=${c.id}`)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50",
                c.id === selectedId && "bg-muted/70"
              )}
            >
              <UserAvatar nom={c.nom} prenom={c.prenom} photo={c.photo} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate">{c.prenom} {c.nom}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(c.dernierDate)}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{c.dernierMessage || "Aucun message"}</p>
              </div>
              {c.nonLus > 0 && (
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{c.nonLus}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className={cn("flex-1 flex flex-col", !selectedId && "hidden md:flex")}>
        {selected ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-card">
              <button onClick={() => router.push("/messagerie")} className="md:hidden text-muted-foreground hover:text-foreground mr-1">←</button>
              <UserAvatar nom={selected.nom} prenom={selected.prenom} photo={selected.photo} size="md" status="ok" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{selected.prenom} {selected.nom}</p>
                <p className="text-[10px] text-emerald-500">En ligne</p>
              </div>
            </div>
            {/* Messages */}
            <ChatBox locataireId={selected.id} role="GESTIONNAIRE" />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="size-7" />
            </div>
            <p className="text-sm">Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
