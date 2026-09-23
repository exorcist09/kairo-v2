"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

export default function Payment() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between p-6 sm:p-10 relative">
      {/* Top spacer (no logo as requested) */}
      <div />

      {/* Center: Full-page Content (Matches Login & Signup layout) */}
      <div className="w-full max-w-md mx-auto my-auto py-10 flex flex-col">
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-3 leading-tight">
            Sorry, we cannot process your request at the moment
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            You can still continue with the Free trial and try again later.
          </p>
        </div>

        {/* Button */}
        <Link
          href="/home"
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer text-sm"
        >
          <span>Continue to Kairo</span>
          <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Bottom spacer for balance */}
      {/* <div className="text-center text-xs text-gray-400 pb-2">
        © {new Date().getFullYear()} Kairo Inc. All rights reserved.
      </div> */}
    </div>
  );
}
