"use client";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-gray-200/70 animate-pulse rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}

export function WorkflowListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 sm:p-5 bg-white border border-gray-200/80 rounded-xl"
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex flex-col gap-2 flex-1 max-w-sm">
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CredentialListSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-xl border border-gray-200/80 bg-white"
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex flex-col gap-2 flex-1 max-w-sm">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
              <Skeleton className="h-3 w-48 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BillingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Balance Card Skeleton */}
      <div className="p-6 md:p-8 rounded-2xl border border-gray-200 bg-white flex flex-col gap-4">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-12 w-48 rounded-lg" />
        <Skeleton className="h-4 w-32 rounded-md" />
      </div>

      {/* Packs Skeleton */}
      <div className="p-6 md:p-8 rounded-2xl border border-gray-200 bg-white flex flex-col gap-5">
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-gray-200 bg-white flex flex-col gap-4 h-44 justify-between"
            >
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          ))}
        </div>
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>

      {/* Bottom Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 md:p-8 rounded-2xl border border-gray-200 bg-white flex flex-col gap-4 h-64 justify-between">
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="p-6 md:p-8 rounded-2xl border border-gray-200 bg-white flex flex-col gap-4 h-64 justify-between">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 md:p-8 rounded-2xl border border-gray-200 bg-white flex flex-col items-center gap-4">
        <Skeleton className="h-6 w-36 rounded-md" />
        <Skeleton className="w-20 h-20 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
      <div className="p-6 md:p-8 rounded-2xl border border-gray-200 bg-white flex flex-col gap-4">
        <Skeleton className="h-6 w-36 rounded-md" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function HomeStatsCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="border border-gray-200 bg-white rounded-2xl p-6 flex flex-col justify-between shadow-sm min-h-[140px]"
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeGraphCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-44 rounded-md" />
        <Skeleton className="h-8 w-40 rounded-xl" />
      </div>
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  );
}

export function HomePlanCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-6 md:p-7 shadow-xs flex flex-col justify-between min-h-[220px]">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex flex-col gap-2 my-2">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-2.5 w-full rounded-full" />
        <Skeleton className="h-3 w-48 rounded-md" />
      </div>
      <div className="pt-4 border-t border-gray-100 flex justify-between">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>
    </div>
  );
}

export function HomeConnectionsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-6 md:p-7 shadow-xs flex flex-col justify-between min-h-[220px]">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-5 w-28 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function HomeTemplatesCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex flex-col gap-5">
      <Skeleton className="h-6 w-36 rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-gray-200 bg-white flex flex-col gap-3 h-28 justify-between">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-3 w-full rounded-md" />
            <Skeleton className="h-3 w-3/4 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
