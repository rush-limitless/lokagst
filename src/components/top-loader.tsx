"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function TopLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(70);
    const t = setTimeout(() => { setProgress(100); setTimeout(() => setLoading(false), 200); }, 300);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
