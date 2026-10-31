import React from "react";
import Link from "next/link";

export interface PagerProps {
  page: number;
  pageSize: number;
  total: number;
  hrefFor: (page: number) => string;
  className?: string;
}

export function Pager({
  page,
  pageSize,
  total,
  hrefFor,
  className = "",
}: PagerProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div
      className={`flex items-center justify-between py-3 text-[13px] font-sans text-ink-2 select-none ${className}`}
    >
      <div className="font-mono tabular-nums">
        Showing {start.toLocaleString()} to {end.toLocaleString()} of{" "}
        {total.toLocaleString()}
      </div>

      <div className="flex items-center gap-4">
        {hasPrev ? (
          <Link
            href={hrefFor(page - 1)}
            className="text-ink underline decoration-1 decoration-rule hover:text-accent hover:decoration-accent focus-visible:outline-1 focus-visible:outline-accent"
          >
            Previous
          </Link>
        ) : (
          <span className="text-rule-strong cursor-not-allowed">Previous</span>
        )}

        <span className="font-mono text-[12px] text-ink-2">
          Page {page} of {totalPages}
        </span>

        {hasNext ? (
          <Link
            href={hrefFor(page + 1)}
            className="text-ink underline decoration-1 decoration-rule hover:text-accent hover:decoration-accent focus-visible:outline-1 focus-visible:outline-accent"
          >
            Next
          </Link>
        ) : (
          <span className="text-rule-strong cursor-not-allowed">Next</span>
        )}
      </div>
    </div>
  );
}
