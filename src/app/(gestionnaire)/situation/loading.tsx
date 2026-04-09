import { CardsSkeleton, ListSkeleton } from "@/components/skeletons";
export default function Loading() { return <div className="space-y-6"><div className="h-8 bg-muted rounded w-48 animate-pulse" /><CardsSkeleton count={5} /><ListSkeleton count={8} /></div>; }
