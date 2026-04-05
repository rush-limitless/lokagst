export function DocumentHeader({ titre, numero }: { titre: string; numero?: string }) {
  return (
    <div className="text-center border-b-2 border-black pb-4 mb-6">
      <h1 className="text-2xl font-bold">IMMOSTAR SCI</h1>
      <p className="text-gray-500">Société Civile Immobilière</p>
      <p className="text-gray-500 text-sm">Yaoundé — Nkolfoulou</p>
      <h2 className="text-xl font-bold mt-4">{titre}</h2>
      {numero && <p className="text-sm text-gray-400">N° {numero}</p>}
    </div>
  );
}

export function DocumentFooter() {
  return (
    <div className="mt-8 pt-4 border-t text-center text-xs text-gray-400">
      <p>IMMOSTAR SCI — Société Civile Immobilière — Yaoundé, Nkolfoulou</p>
      <p>Document généré par ImmoGest</p>
    </div>
  );
}
