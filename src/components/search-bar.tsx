"use client";

import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchBar({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");

  function handleSearch(v: string) {
    setValue(v);
    const params = new URLSearchParams(searchParams.toString());
    if (v) params.set("q", v);
    else params.delete("q");
    router.replace(`?${params.toString()}`);
  }

  return <Input value={value} onChange={(e) => handleSearch(e.target.value)} placeholder={placeholder} className="max-w-sm" />;
}
