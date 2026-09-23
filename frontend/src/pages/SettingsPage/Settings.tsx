"use client";

import { CaretDown, Trash, EnvelopeSimple, LockKey, Check } from "@phosphor-icons/react";
import { useState } from "react";
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Scrollable Container with border */}
      <div className="flex-1 border border-gray-200 rounded-2xl bg-white overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 flex flex-col gap-8">

          {/* Profile Avatar Section (Increased vertical height, centered selector) */}
          <div className="bg-gray-50/70 rounded-2xl border border-gray-100 p-8 sm:p-12 shadow-xs flex flex-col items-center justify-center text-center">
            {/* <h2 className="text-xl font-bold text-gray-900 mb-1">Account Avatar</h2>
            <p className="text-xs text-gray-500 mb-4 max-w-sm">
              The avatar in the center is your selected profile picture across all workflows.
            </p> */}

            {/* Centered Avatar Selector */}
            <div className="w-full flex justify-center">
              <AvatarSelector
                selectedAvatar={selectedAvatar}
                onSelect={setSelectedAvatar}
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-gray-50/70 rounded-2xl border border-gray-100 p-6 md:p-8 shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">First Name</label>
                <input
                  type="text"
                  defaultValue="John"
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                />
              </div>
              {/* Last Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Last Name</label>
                <input
                  type="text"
                  defaultValue="Doe"
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                />
              </div>

              {/* Country */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Country</label>
                <div className="relative">
                  <select
                    defaultValue="IN"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white text-gray-900 cursor-pointer"
                  >
                    <option value="IN">India (+91)</option>
                    <option value="US">United States (+1)</option>
                    <option value="UK">United Kingdom (+44)</option>
                    <option value="CA">Canada (+1)</option>
                    <option value="DE">Germany (+49)</option>
                  </select>
                  <CaretDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Phone Number</label>
                <input
                  type="text"
                  defaultValue="9876543210"
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <button
                type="button"
                onClick={handleSave}
                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
              {savedSuccess && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-in fade-in">
                  <Check weight="bold" className="w-4 h-4" /> Changes saved successfully!
                </span>
              )}
            </div>
          </div>

          {/* Account Overview */}
          <div className="bg-gray-50/70 rounded-2xl border border-gray-100 p-6 md:p-8 shadow-xs flex flex-col gap-6">
            <h2 className="text-xl font-bold text-gray-900">Account Overview</h2>

            <div className="flex flex-col gap-4">
              {/* Username Row */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200/80">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 mb-1">Username</span>
                  <span className="text-sm text-gray-500 font-mono">@johndoe</span>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 text-gray-800 border-gray-200 px-3 py-1 rounded-full">
                  Non-editable
                </span>
              </div>

              {/* Email Row */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200/80">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 mb-1">Email Address</span>
                  <span className="text-sm text-gray-500">john.doe@example.com</span>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <EnvelopeSimple className="w-4 h-4" /> Change Email
                </button>
              </div>

              {/* Password Row */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200/80">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 mb-1">Password</span>
                  <span className="text-sm text-gray-500 font-mono">••••••••••••</span>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <LockKey className="w-4 h-4" /> Change Password
                </button>
              </div>

              {/* 2FA Row */}
              <div className="flex items-center justify-between py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 mb-1">Two-Factor Authentication</span>
                  <span className="text-sm text-gray-500">Add an extra layer of security to your account</span>
                </div>

                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  aria-pressed={is2FAEnabled}
                  aria-label="Toggle Two-Factor Authentication"
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
                    is2FAEnabled ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-xs transition-transform duration-200 ease-in-out ${
                      is2FAEnabled ? "translate-x-7 left-0" : "translate-x-1 left-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone Section */}
          <div className="bg-red-50/20 rounded-2xl border border-red-200/60 p-6 md:p-8 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col gap-1 pb-3 border-b border-red-100">
              <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
              <p className="text-xs text-gray-500">
                Irreversible actions that permanently affect your account and automation data.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">Delete Account</span>
                <span className="text-xs text-gray-500">
                  Permanently remove your personal data, workflows, and credentials.
                </span>
              </div>
              <button
                type="button"
                className="flex items-center justify-center gap-2 text-sm font-semibold text-white bg-red-500/85 hover:bg-red-600 px-6 py-2.5 rounded-xl transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Trash className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
