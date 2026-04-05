export function DocumentHeader({ titre, numero }: { titre: string; numero?: string }) {
  return (
    <div className="text-center border-b-2 border-[#1e3a5f] pb-4 mb-6 relative">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] text-6xl font-bold text-[#1e3a5f] rotate-[-30deg] pointer-events-none select-none">
        IMMOSTAR SCI
      </div>
      <h1 className="text-2xl font-bold text-[#1e3a5f]">IMMOSTAR SCI</h1>
      <p className="text-gray-500 text-sm">Société Civile Immobilière</p>
      <p className="text-gray-400 text-xs">Yaoundé — Nkolfoulou</p>
      <h2 className="text-lg font-bold mt-3 uppercase tracking-wide">{titre}</h2>
      {numero && <p className="text-xs text-gray-400 mt-1">N° {numero}</p>}
    </div>
  );
}

export function DocumentFooter({ qrData }: { qrData?: string }) {
  return (
    <div className="mt-8 pt-4 border-t flex justify-between items-end">
      <div className="text-xs text-gray-400">
        <p>IMMOSTAR SCI — Société Civile Immobilière</p>
        <p>Yaoundé, Nkolfoulou — Cameroun</p>
        <p className="mt-1">Document généré par ImmoGest</p>
      </div>
      {qrData && (
        <div className="text-center">
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrData)}`} alt="QR" className="w-16 h-16" />
          <p className="text-[8px] text-gray-400 mt-1">Vérification</p>
        </div>
      )}
    </div>
  );
}

export function DocumentWatermark() {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none print:flex hidden">
      <div className="text-8xl font-bold text-gray-100 rotate-[-45deg] opacity-30">IMMOSTAR SCI</div>
    </div>
  );
}
