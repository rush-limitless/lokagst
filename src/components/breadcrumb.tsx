"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  appartements: "Appartements",
  locataires: "Locataires",
  baux: "Contrats",
  paiements: "Paiements",
  emails: "Emails",
  maintenance: "Maintenance",
  messagerie: "Messagerie",
  nouveau: "Nouveau",
  recu: "Reçu",
  quittance: "Quittance",
  situation: "Situation",
  calendrier: "Calendrier",
  finances: "Finances",
  reporting: "Reporting",
  parametres: "Paramètres",
  immeubles: "Immeubles",
  audit: "Audit",
  documents: "Documents",
  contrat: "Contrat",
  edl: "État des lieux",
  modifier: "Modifier",
  depenses: "Dépenses",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length <= 1) return null;

  return (
    <nav className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
      <Link href="/dashboard" className="hover:text-blue-600">Accueil</Link>
      {parts.map((part, i) => {
        const href = "/" + parts.slice(0, i + 1).join("/");
        const label = LABELS[part] || (part.length > 20 ? "Détail" : part);
        const isLast = i === parts.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            <span className="text-border">/</span>
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-blue-600">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
