import React from "react";

export default function Loading() {
  return (
    <div
      className="w-full max-w-[1240px] mx-auto px-2 min-[320px]:px-3 sm:px-6 pt-6 pb-20 animate-in fade-in duration-150"
      aria-label="Loading page"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="space-y-2.5">
          <div className="h-7 w-48 rounded-xl bg-slate-200/80 dark:bg-white/10 animate-pulse" />
          <div className="h-4 w-72 max-w-full rounded-lg bg-slate-100 dark:bg-white/5 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 rounded-xl bg-slate-200/60 dark:bg-white/10 animate-pulse" />
          <div className="h-9 w-28 rounded-xl bg-slate-200/60 dark:bg-white/10 animate-pulse" />
        </div>
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="h-12 flex-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 animate-pulse" />
        <div className="h-12 w-full sm:w-44 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 animate-pulse" />
      </div>

      {/* Card Grid Skeleton */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-4 bg-white/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-white/10 shadow-sm flex flex-col justify-between h-44"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-200/80 dark:bg-white/10 shrink-0 animate-pulse" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 w-3/4 rounded bg-slate-200/80 dark:bg-white/10 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-white/5 animate-pulse" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
              <div className="h-5 w-16 rounded bg-blue-100 dark:bg-blue-950/60 animate-pulse" />
              <div className="h-8 w-20 rounded-xl bg-slate-200/80 dark:bg-white/10 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
