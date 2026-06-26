"use client";

import Image from "next/image";
import Link from "next/link";
import { GoogleLogo, Eye, EyeSlash } from "@phosphor-icons/react";
import { useState } from "react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* Left side */}
      <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-24 flex flex-col justify-center relative">
        {/* Logo */}
        <div className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2">
          <Image src="/Kairo.png" alt="Logo" width={100} height={32} className="h-8 w-auto" />
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Log in to your account</h1>
          <p className="text-gray-500 text-center mb-8">Welcome back! Please enter your details.</p>

          <form className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email<span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm placeholder:text-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  className="w-full px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm placeholder:text-gray-400 pr-12"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeSlash className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between pt-2 pb-4">
              <div className="flex items-center gap-2">
                {/* <input 
                  type="checkbox" 
                  id="remember"
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </label> */}
              </div>
              <Link href="/reset-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" className="w-full bg-blue-600 text-white rounded-full py-3 px-4 font-medium hover:bg-blue-700 transition-colors">
              Log In
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Sign up</Link>
          </p>
        </div>
      </div>

      {/* Right side Image */}
      <div className="hidden lg:block w-1/2 p-4">
        <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
          <Image 
            src="/auth/auth.png" 
            alt="Auth background" 
            fill 
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}