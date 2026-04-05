import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground mt-4">Page introuvable</p>
        <Link href="/dashboard"><Button className="mt-6">Retour au dashboard</Button></Link>
      </div>
    </div>
  );
}
