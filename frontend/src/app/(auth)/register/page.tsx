"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Eye,
  EyeSlash,
  User,
  EnvelopeSimple,
  LockSimple,
  IdentificationBadge,
  ArrowRight,
  Info,
} from "@phosphor-icons/react";
import AvatarSelector from "@/shared/AvatarSelector";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState("/avatar/avatar1.jpg");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;
    window.location.href = "/home";
  };

  return (
    <div className="h-screen w-full bg-white relative overflow-hidden flex flex-col">
      {/* Top Left: Fixed Logo that never scrolls */}
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

      {/* Scrollable Content Container: Only this scrolls */}
      <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar flex flex-col items-center px-6 pt-24 pb-12 sm:pt-28 sm:pb-16">
        <div className="w-full max-w-xl flex flex-col my-auto">
          {/* Header */}
          <div className="text-left mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2">
              Create your account
            </h1>
            <p className="text-sm text-gray-500">
              Join Kairo to start building, deploying, and monitoring automations.
            </p>
          </div>

          {/* Avatar Horizontal Carousel Selector (Increased vertical/horizontal area without clipping) */}
          <div className="mb-8 pt-2 pb-4 border-y border-gray-100/90 w-full overflow-visible">
            <AvatarSelector selectedAvatar={avatar} onSelect={setAvatar} />
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field with Explicit Permanent Notice */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                  <Info weight="bold" className="w-3 h-3 text-amber-600" />
                  Permanent • Non-editable later
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <IdentificationBadge className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="e.g. johndoe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-mono text-sm"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                Your unique handle (lowercase letters, numbers, underscores). This cannot be modified once set.
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email Address with placeholder name@xyz.com */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Email Address <span className="text-red-500">*</span>
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <LockSimple className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

            {/* Terms Agreement */}
            <div className="flex items-start gap-2.5 pt-2 pb-1">
              <input
                type="checkbox"
                id="terms"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
                I agree to Kairo's{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button with rounded-xl */}
            <button
              type="submit"
              disabled={!agreedToTerms}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all hover:shadow-md active:scale-[0.99] flex items-center justify-center gap-2 group mt-3 cursor-pointer"
            >
              <span>Create Account</span>
              <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              Log in
            </Link>
          </p>

          <div className="text-center text-xs text-gray-400 mt-10">
            © {new Date().getFullYear()} Kairo Inc. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}