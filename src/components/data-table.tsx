"use client";

import { useState } from "react";

type Column<T> = { key: string; label: string; render?: (item: T) => React.ReactNode; sortable?: boolean };

export function DataTable<T extends Record<string, any>>({
  data, columns, mobileRender, pageSize = 10,
}: {
  data: T[]; columns: Column<T>[]; mobileRender?: (item: T) => React.ReactNode; pageSize?: number;
}) {
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const va = a[sortKey], vb = b[sortKey];
    if (va == null) return 1;
    if (vb == null) return -1;
    const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div>
      {/* Mobile cards */}
      {mobileRender && (
        <div className="md:hidden space-y-3">
          {paged.map((item, i) => (
            <div key={i} className="bg-card border rounded-lg p-4 hover:shadow-sm transition-shadow">
              {mobileRender(item)}
            </div>
          ))}
        </div>
      )}

      {/* Desktop table */}
      <div className={`bg-card rounded-lg border overflow-hidden ${mobileRender ? "hidden md:block" : ""}`}>
        <table className="w-full">
          <thead className="bg-muted/50 text-left text-sm text-muted-foreground">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`p-3 ${col.sortable !== false ? "cursor-pointer hover:text-foreground select-none" : ""}`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}>
                  {col.label} {sortKey === col.key && (sortDir === "asc" ? "↑" : "↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {paged.map((item, i) => (
              <tr key={i} className="hover:bg-muted/50">
                {columns.map((col) => (
                  <td key={col.key} className="p-3 text-sm">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {paged.length === 0 && <tr><td colSpan={columns.length} className="p-6 text-center text-muted-foreground">Aucun résultat</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <span className="text-muted-foreground">{sorted.length} résultat(s) — Page {page + 1}/{totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1 border rounded disabled:opacity-30">← Préc.</button>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 border rounded disabled:opacity-30">Suiv. →</button>
          </div>
        </div>
      )}
    </div>
  );
}
