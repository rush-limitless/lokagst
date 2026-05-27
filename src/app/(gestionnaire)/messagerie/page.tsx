import { getConversations } from "@/actions/messagerie";
import { ChatLayout } from "@/components/chat-layout";

export default async function MessageriePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const conversations = await getConversations();

  return <ChatLayout conversations={conversations} selectedId={id} />;
}
