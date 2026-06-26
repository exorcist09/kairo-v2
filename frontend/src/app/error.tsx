"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WarningCircle } from "@phosphor-icons/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center text-red-500">
          <WarningCircle weight="fill" className="w-16 h-16" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Something went wrong!</h1>
        <p className="text-gray-500 text-sm">
          An unexpected error occurred. We have been notified and are working on a fix.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
