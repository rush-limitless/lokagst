"use client";

import { Confetti } from "@/components/confetti";

export function CelebrationBanner({ totalImpayes }: { totalImpayes: number }) {
  if (totalImpayes > 0) return null;
  return (
    <>
      <Confetti />
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white text-center">
        <p className="text-lg font-bold">🎉 Félicitations !</p>
        <p className="text-sm text-emerald-100">Tous les locataires sont à jour ce mois-ci</p>
      </div>
    </>
  );
}
