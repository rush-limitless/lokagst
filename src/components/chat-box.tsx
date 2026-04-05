"use client";

import { getMessages, envoyerMessage } from "@/actions/messagerie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";

type Msg = { id: string; contenu: string; expediteur: string; creeLe: Date };

export function ChatBox({ locataireId, role }: { locataireId: string; role: "GESTIONNAIRE" | "LOCATAIRE" }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMessages(locataireId).then(setMessages);
    const interval = setInterval(() => getMessages(locataireId).then(setMessages), 5000);
    return () => clearInterval(interval);
  }, [locataireId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    await envoyerMessage(locataireId, text.trim());
    setText("");
    const updated = await getMessages(locataireId);
    setMessages(updated);
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[500px] bg-card rounded-lg border">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.expediteur === role ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${m.expediteur === role ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
              <p>{m.contenu}</p>
              <p className={`text-[10px] mt-1 ${m.expediteur === role ? "opacity-70" : "text-muted-foreground"}`}>
                {new Date(m.creeLe).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t p-3 flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Écrire un message..." onKeyDown={(e) => e.key === "Enter" && handleSend()} />
        <Button onClick={handleSend} disabled={sending || !text.trim()}>{sending ? "..." : "Envoyer"}</Button>
      </div>
    </div>
  );
}
