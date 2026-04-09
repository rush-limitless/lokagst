"use client";
import { SectionError } from "@/components/section-error";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <SectionError error={error} reset={reset} section="Maintenance" />;
}
