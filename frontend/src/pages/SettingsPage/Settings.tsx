"use client";

import { useState } from "react";
import {
  CaretDown,
  Trash,
  EnvelopeSimple,
  LockKey,
  Check,
  UserCircle,
  IdentificationCard,
  ShieldCheck,
  WarningOctagon,
} from "@phosphor-icons/react";
import AvatarSelector from "@/shared/AvatarSelector";

export default function Settings() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("/avatar/avatar1.jpg");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Page Header */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage your personal profile, account credentials, and platform preferences.
        </p>
      </div>

      {/* Main Scrollable Canvas */}
      <div className="flex-1 border border-gray-200 rounded-2xl bg-white overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 flex flex-col">
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 pb-6">

            {/* 1. Profile Avatar Card (Signature Top-Left Clipped Watermark Icon) */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex flex-col items-center justify-center text-center">
              {/* Top-left clipped watermark icon */}
              <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-blue-600">
                <UserCircle weight="duotone" className="w-full h-full" />
              </div>

              <div className="z-10 relative mb-5">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Profile Avatar</h2>
              </div>

              {/* Centered Avatar Selector */}
              <div className="z-10 relative w-full flex justify-center">
                <AvatarSelector
                  selectedAvatar={selectedAvatar}
                  onSelect={setSelectedAvatar}
                />
              </div>
            </div>

            {/* 2. Contact Details Card (Signature Top-Left Clipped Watermark Icon) */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex flex-col gap-6">
              {/* Top-left clipped watermark icon */}
              <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-blue-600">
                <IdentificationCard weight="duotone" className="w-full h-full" />
              </div>

              <div className="z-10 relative pb-3 border-b border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Contact Details</h2>
              </div>

              {/* Form Grid */}
              <div className="z-10 relative grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* First Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">First Name</label>
                  <input
                    type="text"
                    defaultValue="John"
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Last Name</label>
                  <input
                    type="text"
                    defaultValue="Doe"
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Country */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Country / Region</label>
                  <div className="relative">
                    <select
                      defaultValue="IN"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer pr-10"
                    >
                      <option value="IN">India (+91)</option>
                      <option value="US">United States (+1)</option>
                      <option value="UK">United Kingdom (+44)</option>
                      <option value="CA">Canada (+1)</option>
                      <option value="DE">Germany (+49)</option>
                      <option value="SG">Singapore (+65)</option>
                    </select>
                    <CaretDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="9876543210"
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="z-10 relative flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
                {savedSuccess && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-in fade-in">
                    <Check weight="bold" className="w-4 h-4" />
                    <span>Changes saved successfully</span>
                  </span>
                )}
              </div>
            </div>

            {/* 3. Account Security & Overview Card (Signature Top-Left Clipped Watermark Icon) */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex flex-col gap-5">
              {/* Top-left clipped watermark icon */}
              <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-blue-600">
                <ShieldCheck weight="duotone" className="w-full h-full" />
              </div>

              <div className="z-10 relative pb-3 border-b border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Account Security</h2>
              </div>

              <div className="z-10 relative flex flex-col divide-y divide-gray-100">
                {/* Username Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">Username</span>
                    <span className="text-xs text-gray-500 font-mono mt-0.5">@johndoe</span>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 border border-gray-200/80 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                    Non-editable
                  </span>
                </div>

                {/* Email Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">Email Address</span>
                    <span className="text-xs text-gray-500 mt-0.5">john.doe@example.com</span>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                  >
                    <EnvelopeSimple className="w-3.5 h-3.5 text-gray-500" />
                    <span>Change Email</span>
                  </button>
                </div>

                {/* Password Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">Password</span>
                    <span className="text-xs text-gray-400 font-mono tracking-wider mt-0.5">
                      ••••••••••••
                    </span>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                  >
                    <LockKey className="w-3.5 h-3.5 text-gray-500" />
                    <span>Change Password</span>
                  </button>
                </div>

                {/* 2FA Row */}
                <div className="flex items-center justify-between py-3.5 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">Two-Factor Authentication (2FA)</span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      Add an extra layer of multi-factor security using an authenticator app
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                    aria-pressed={is2FAEnabled}
                    aria-label="Toggle Two-Factor Authentication"
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
                      is2FAEnabled ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-xs transition-transform duration-200 ease-in-out ${
                        is2FAEnabled ? "translate-x-6 left-0" : "translate-x-1 left-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Danger Zone Card (Signature Top-Left Clipped Watermark Icon in Red) */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-red-200/80 p-6 md:p-8 shadow-xs flex flex-col gap-4">
              {/* Top-left clipped watermark icon */}
              <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-red-500">
                <WarningOctagon weight="duotone" className="w-full h-full" />
              </div>

              <div className="z-10 relative pb-3 border-b border-red-100 flex flex-col gap-0.5">
                <h2 className="text-base sm:text-lg font-bold text-red-600">Danger Zone</h2>
              </div>

              <div className="z-10 relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900">Delete Account</span>
                  <span className="text-xs text-gray-500 mt-0.5 max-w-md">
                    Permanently delete your personal profile, credentials, pipelines, and credit balance.
                  </span>
                </div>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-xl transition-colors shadow-xs cursor-pointer self-start sm:self-auto flex-shrink-0"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
