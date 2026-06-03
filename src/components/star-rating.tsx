import { Star } from "lucide-react";

export function StarRating({ etoiles, label }: { etoiles: number; label: string }) {
  return (
    <div className="flex items-center gap-1" title={label}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`size-3.5 ${i <= etoiles ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`} />
      ))}
      <span className="text-[10px] text-muted-foreground ml-1">{label}</span>
    </div>
  );
}
