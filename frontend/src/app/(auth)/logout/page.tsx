"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react";

export default function LogoutPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between p-6 sm:p-10 relative">
      {/* Top Left: Kairo Logo with brightness-0 */}
      <div className="w-full flex items-center justify-between z-10">
        <Link href="/" className="inline-block transition-opacity hover:opacity-80">
          <Image
            src="/Kairo.png"
            alt="Kairo"
            width={120}
            height={36}
            priority
            className="h-8 w-auto brightness-0"
          />
        </Link>
      </div>

      <div className="relative w-full max-w-md mx-auto my-auto py-10 flex flex-col items-center text-center">
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 shadow-xs">
          <CheckCircle weight="fill" className="w-9 h-9" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          You've been logged out
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-sm">
          Thank you for using Kairo. You have safely signed out of your session.
        </p>

        {/* Action Button */}
        <Link
          href="/login"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span>Log back in</span>
          <ArrowRight weight="bold" className="w-4 h-4" />
        </Link>
      </div>

      <div className="text-center text-xs text-gray-400 pb-2">
        © {new Date().getFullYear()} Kairo Inc. All rights reserved.
      </div>
    </div>
  );
}
