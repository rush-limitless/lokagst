import { getDocumentsLocataire } from "@/actions/documents";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Paperclip, Home, ClipboardList, CheckCircle2, Upload, XCircle, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { UploadReglementForm } from "./upload-reglement";

const TYPE_ICONS: Record<string, ReactNode> = {
  contrat: <FileText className="w-6 h-6 text-sky-600" />,
  contrat_enregistre: <Paperclip className="w-6 h-6 text-violet-600" />,
  edl: <Home className="w-6 h-6 text-amber-600" />,
  reglement: <ClipboardList className="w-6 h-6 text-slate-600" />,
};
const STATUT_STYLES: Record<string, { label: string; icon: ReactNode; bg: string; text: string }> = {
  signe: { label: "Signé", icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-400" },
  uploade: { label: "Uploadé", icon: <Upload className="w-4 h-4 text-sky-600" />, bg: "bg-sky-50 dark:bg-sky-950/20", text: "text-sky-700 dark:text-sky-400" },
  non_signe: { label: "Manquant", icon: <XCircle className="w-4 h-4 text-red-600" />, bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-700 dark:text-red-400" },
};

export default async function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getDocumentsLocataire(id);
  if (!data) notFound();

  const signes = data.documents.filter((d) => d.statut === "signe" || d.statut === "uploade").length;
  const total = data.documents.length;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center gap-3">
        <Link href={`/locataires/${id}`} className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Retour</Link>
        <h1 className="text-xl font-bold text-foreground">Documents — {data.locataire.prenom} {data.locataire.nom}</h1>
      </div>

      <div className="glass rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Dossier complet</p>
          <p className="text-xs text-muted-foreground">{signes}/{total} documents signés/uploadés</p>
        </div>
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full progress-animated" style={{ width: `${total > 0 ? (signes / total) * 100 : 0}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {data.documents.map((doc, i) => {
          const style = STATUT_STYLES[doc.statut];
          return (
            <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${style.bg}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">{TYPE_ICONS[doc.type]}</div>
                <div>
                  <p className="font-medium text-foreground text-sm">{doc.nom}</p>
                  <p className={`text-xs font-medium flex items-center gap-1 ${style.text}`}>{style.icon} {style.label}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {doc.lien && doc.statut !== "non_signe" && (
                  <a href={doc.lien} target={doc.lien.startsWith("/") ? "_self" : "_blank"} className="text-primary text-xs hover:underline">Voir →</a>
                )}
                {doc.lien && doc.statut === "non_signe" && (
                  <Link href={doc.lien}><Button size="sm" variant="outline">Compléter</Button></Link>
                )}
                {doc.bailId && doc.type === "contrat" && (
                  <Link href={`/baux/${doc.bailId}/contrat`}><Button size="sm" variant="outline">📄 PDF</Button></Link>
                )}
                {doc.type === "reglement" && doc.statut === "non_signe" && (
                  <UploadReglementForm locataireId={id} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
