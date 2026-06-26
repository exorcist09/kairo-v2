"use client";

import Link from "next/link";
import { Question } from "@phosphor-icons/react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center text-gray-300">
          <Question weight="duotone" className="w-24 h-24" />
        </div>
        <h1 className="text-6xl font-black text-gray-900">404</h1>
        <h2 className="text-2xl font-bold text-gray-800">Page not found</h2>
        <p className="text-gray-500 text-sm">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
