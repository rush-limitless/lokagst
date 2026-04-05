import { EdlForm } from "@/components/edl-form";

export default async function EdlPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-950 mb-6">Nouvel état des lieux</h1>
      <EdlForm bailId={id} />
    </div>
  );
}
