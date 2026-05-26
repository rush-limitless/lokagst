import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({ icon, title, description, actionLabel, actionHref }: { icon: string; title: string; description: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div className="text-center py-16 animate-in fade-in duration-500">
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="inline-block mt-4">
          <Button size="sm">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
