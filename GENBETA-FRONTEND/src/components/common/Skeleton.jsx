/**
 * Reusable Skeleton Loaders
 * 
 * WHAT: Modern skeleton loading components for better UX
 * WHY: Replaces blank screens and spinners with content-aware placeholders
 * 
 * Usage:
 * - SkeletonCard: For stat cards and dashboard KPIs
 * - SkeletonTable: For data tables
 * - SkeletonChart: For charts and graphs
 * - SkeletonFacility: For form inputs
 */

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-pulse ${className}`}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl" />
        <div className="flex-1 space-y-2.5">
          <div className="h-3 w-20 bg-gray-100 rounded" />
          <div className="h-7 w-14 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="p-4 flex gap-4">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div
                key={colIdx}
                className="flex-1 h-4 bg-gray-50 rounded animate-pulse"
                style={{ animationDelay: `${rowIdx * 50}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart({ className = "" }) {
  return (
    <div className={`bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-pulse ${className}`}>
      <div className="h-5 w-40 bg-gray-100 rounded mb-8" />
      <div className="h-64 bg-gray-50 rounded-2xl flex items-end justify-center gap-3 p-4">
        {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
          <div
            key={i}
            className="w-8 bg-gray-200 rounded-t-lg"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonFacility({ fields = 3, className = "" }) {
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-50 rounded-lg animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 5, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div className="divide-y divide-gray-50">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-100 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-100 rounded" />
              <div className="h-3 w-20 bg-gray-50 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
