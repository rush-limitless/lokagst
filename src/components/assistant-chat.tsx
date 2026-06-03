"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

export function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Bonjour ! Je suis l'assistant IMMOSTAR. Posez-moi une question sur vos locataires, paiements ou logements." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reponse || "Erreur." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion." }]);
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[hsl(199,70%,32%)] hover:bg-[hsl(199,70%,26%)] text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110" aria-label="Ouvrir l'assistant">
        <MessageCircle className="size-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[hsl(199,70%,32%)] text-white">
        <div className="flex items-center gap-2">
          <Bot className="size-5" />
          <span className="font-semibold text-sm">Assistant IMMOSTAR</span>
        </div>
        <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded p-1" aria-label="Fermer">
          <X className="size-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && <div className="w-7 h-7 rounded-full bg-[hsl(199,70%,32%)] flex items-center justify-center flex-shrink-0"><Bot className="size-4 text-white" /></div>}
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-[hsl(199,70%,32%)] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"}`}>
              {m.content.split("**").map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
            </div>
            {m.role === "user" && <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0"><User className="size-4" /></div>}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-[hsl(199,70%,32%)] flex items-center justify-center"><Bot className="size-4 text-white" /></div>
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl"><span className="animate-pulse text-sm text-gray-500">Réflexion...</span></div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Posez une question..." className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[hsl(199,70%,32%)]" disabled={loading} />
        <button type="submit" disabled={loading || !input.trim()} className="w-9 h-9 flex items-center justify-center bg-[hsl(199,70%,32%)] hover:bg-[hsl(199,70%,26%)] disabled:opacity-50 text-white rounded-lg transition-colors" aria-label="Envoyer">
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
