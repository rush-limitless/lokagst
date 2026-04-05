import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-950">404</h1>
        <p className="text-xl text-gray-500 mt-4">Page introuvable</p>
        <Link href="/dashboard"><Button className="mt-6">Retour au dashboard</Button></Link>
      </div>
    </div>
  );
}
