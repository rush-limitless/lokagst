import { getBail } from "@/actions/baux";
import { EdlForm } from "@/components/edl-form";
import { notFound } from "next/navigation";

export default async function EdlPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bail = await getBail(id);
  if (!bail) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Nouvel état des lieux</h1>
      <EdlForm bailId={id} montantCaution={bail.montantCaution} />
    </div>
  );
}
