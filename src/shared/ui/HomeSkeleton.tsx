/**
 * Mirrors HomePage's actual layout (header + banner + category grid) so the
 * transition from skeleton to real content doesn't shift anything on screen.
 * Used both for the boot splash and the route-level Suspense fallback.
 */
export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-3 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 safe-top">
        <div className="w-9 h-9 rounded-el bg-neutral-200 dark:bg-neutral-800 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse" />
          <div className="h-2.5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse" />
        </div>
        <div className="w-11 h-11 rounded-el bg-neutral-200 dark:bg-neutral-800 animate-pulse flex-shrink-0" />
      </div>

      <div className="space-y-10 pt-4 pb-16">
        {/* Banner */}
        <div className="px-4">
          <div className="aspect-[2.2/1] rounded-card bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>

        {/* Category grid */}
        <div className="px-4 space-y-4">
          <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-card bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
