import { getAuditLogs } from "@/actions/immeubles";
import { formatDate } from "@/lib/utils";

export default async function AuditPage() {
  const logs = await getAuditLogs(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Journal d&apos;audit</h1>
      <p className="text-sm text-gray-500">Historique de toutes les actions effectuées dans l&apos;application</p>
      <div className="bg-card rounded-xl border overflow-x-auto table-scroll">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-sm text-gray-500">
            <tr><th className="p-3">Date</th><th className="p-3">Utilisateur</th><th className="p-3">Action</th><th className="p-3">Entité</th><th className="p-3">Détails</th></tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50 text-sm">
                <td className="p-3 text-gray-500">{formatDate(l.creeLe)}</td>
                <td className="p-3">{l.utilisateur}</td>
                <td className="p-3 font-medium">{l.action}</td>
                <td className="p-3">{l.entite} {l.entiteId ? `(${l.entiteId.slice(0, 8)})` : ""}</td>
                <td className="p-3 text-gray-500">{l.details || "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">Aucune action enregistrée</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
