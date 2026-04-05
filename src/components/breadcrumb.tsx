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
  nouveau: "Nouveau",
  recu: "Reçu",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length <= 1) return null;

  return (
    <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1">
      <Link href="/dashboard" className="hover:text-blue-600">Accueil</Link>
      {parts.map((part, i) => {
        const href = "/" + parts.slice(0, i + 1).join("/");
        const label = LABELS[part] || part;
        const isLast = i === parts.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            <span className="text-gray-300">/</span>
            {isLast ? (
              <span className="text-gray-700 font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-blue-600">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
