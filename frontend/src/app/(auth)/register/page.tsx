"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  IdentificationBadge,
  Info,
  LockSimple,
  User,
} from "@phosphor-icons/react";
import { login, register } from "@/api/auth.api";
import AvatarSelector, { getAvatarLabel } from "@/shared/AvatarSelector";
import { setAuthToken } from "@/utils/auth";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState("Cyber");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms || loading) return;
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await register({
        avatar: getAvatarLabel(avatar),
        username,
        name,
        email,
        password,
      });
      console.log("Registration successful:", data);

      try {
        const loginData = await login({ email, password });
        if (loginData?.token) {
          setAuthToken(loginData.token, loginData.user);
          window.location.href = "/home";
          return;
        }
      } catch {
        // Ignore auto-login error and redirect to login
      }

      window.location.href = "/login";
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.message ||
          "Registration failed. Please check your details.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-white relative overflow-hidden flex flex-col justify-between p-6 sm:p-10">
      {/* Top Left: Kairo Logo fixed (like login) */}
      <div className="fixed top-6 left-6 sm:top-8 sm:left-10 z-50 pointer-events-auto">
        <Link
          href="/"
          className="inline-block transition-opacity hover:opacity-80"
        >
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

      {/* Main Container - Centered and Static Without Scrolling */}
      <div className="flex-1 w-full flex items-center justify-center py-2 px-4 my-auto">
        <div className="w-full max-w-2xl sm:max-w-3xl flex flex-col">
          {/* Header above both - moved higher */}
          <div className="text-left w-full mb-7 sm:mb-9">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-1.5">
              Create your account
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Join Kairo to start building and monitoring automations.
            </p>
          </div>

          {/* Two-column layout: Avatar on the left, Form on the right */}
          <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-12 lg:gap-14">
            {/* Left Side: Vertical Avatar Carousel */}
            <div className="flex flex-col items-center justify-center shrink-0 pt-1 mt-5">
              <AvatarSelector
                selectedAvatar={avatar}
                onSelect={(_src, label) => setAvatar(label)}
                orientation="vertical"
              />
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block w-px self-stretch bg-gray-200/80 shrink-0" />

            {/* Right Side: Registration Form */}
            <div className="w-full max-w-md flex flex-col">
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                {/* Username Field with Permanent Notice & Helper Text */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="username"
                      className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
                    >
                      Username <span className="text-red-500">*</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-full">
                      <Info weight="bold" className="w-2.5 h-2.5 text-amber-600" />
                      Permanent • Non-editable later
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <IdentificationBadge className="w-4 h-4" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                        )
                      }
                      placeholder="johndoe"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 leading-tight">
                    Your unique handle (lowercase letters, numbers, underscores). This cannot be modified once set.
                  </p>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <EnvelopeSimple className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@xyz.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <LockSimple className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeSlash className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-2 pt-1 pb-0.5">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label
                    htmlFor="terms"
                    className="text-xs text-gray-600 leading-normal cursor-pointer select-none"
                  >
                    I agree to Kairo&apos;s{" "}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!agreedToTerms || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all hover:shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 group mt-2.5 cursor-pointer text-xs sm:text-sm"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight
                        weight="bold"
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <p className="mt-3.5 text-center text-xs text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>

      {/* Bottom spacer for copyright */}
      <div className="text-center text-[11px] text-gray-400 py-1 shrink-0">
        © {new Date().getFullYear()} Kairo Inc. All rights reserved.
      </div>
    </div>
  );
}
