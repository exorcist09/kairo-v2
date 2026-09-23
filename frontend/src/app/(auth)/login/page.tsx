"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Eye,
  EyeSlash,
  EnvelopeSimple,
  LockSimple,
  ArrowRight,
} from "@phosphor-icons/react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = "/home";
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-between p-6 sm:p-10 relative">
      {/* Top Left: Kairo Logo fixed (like sidebar) */}
      <div className="fixed top-6 left-6 sm:top-8 sm:left-10 z-50 pointer-events-auto">
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

      {/* Center: Full-page Content (No box/card structure) */}
      <div className="w-full max-w-md mx-auto my-auto py-10 flex flex-col">
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2">
            Log in to your account
          </h1>
          <p className="text-sm text-gray-500">
            Welcome back! Please enter your details to access your workspace.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <EnvelopeSimple className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@xyz.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Password
              </label>
              <Link
                href="/reset-password"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <LockSimple className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
              >
                {showPassword ? <EyeSlash className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit button with rounded-xl */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2 group mt-3 cursor-pointer"
          >
            <span>Log In</span>
            <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      {/* Bottom spacer for balance */}
      <div className="text-center text-xs text-gray-400 pb-2">
        © {new Date().getFullYear()} Kairo Inc. All rights reserved.
      </div>
    </div>
  );
}