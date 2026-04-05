import { cn } from "@/lib/utils";

const VARIANTS: Record<string, { dot: string; bg: string; text: string }> = {
  actif: { dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400" },
  libre: { dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400" },
  occupe: { dot: "bg-sky-500", bg: "bg-sky-50 dark:bg-sky-950/30", text: "text-sky-700 dark:text-sky-400" },
  paye: { dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400" },
  partiel: { dot: "bg-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-700 dark:text-orange-400" },
  suspendu: { dot: "bg-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-700 dark:text-orange-400" },
  expire: { dot: "bg-red-500", bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-400" },
  resilie: { dot: "bg-red-500", bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-400" },
  signale: { dot: "bg-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-700 dark:text-orange-400" },
  en_cours: { dot: "bg-sky-500", bg: "bg-sky-50 dark:bg-sky-950/30", text: "text-sky-700 dark:text-sky-400" },
  resolu: { dot: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400" },
  urgente: { dot: "bg-red-500", bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-400" },
};

export function StatusBadge({ status, label, animate = true }: { status: string; label: string; animate?: boolean }) {
  const v = VARIANTS[status.toLowerCase()] || VARIANTS.actif;

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium", v.bg, v.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", v.dot, animate && "animate-pulse")} />
      {label}
    </span>
  );
}
