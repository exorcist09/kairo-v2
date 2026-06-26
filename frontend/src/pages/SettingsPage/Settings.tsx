"use client";

import { CaretDown, Trash, EnvelopeSimple, LockKey } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";

export default function Settings() {
  return (
    <div className="w-full h-full flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      {/* Scrollable Container with border */}
      <div className="flex-1 border border-gray-200 rounded-2xl bg-white overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
          
          {/* Avatar Section */}
          <div className="flex items-end gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-sm flex items-center justify-center flex-shrink-0 bg-gray-100">
              <Image src="/avatar/avatar1.jpg" alt="Avatar 1" width={128} height={128} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-3 pb-2 flex-wrap">
              {/* Small selectable avatars */}
              <div className="w-12 h-12 rounded-full overflow-hidden cursor-pointer border-2 border-blue-500 transition-all shadow-sm">
                 <Image src="/avatar/avatar2.jpg" alt="Avatar 2" width={48} height={48} className="w-full h-full object-cover" />
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all shadow-sm">
                 <Image src="/avatar/avatar3.jpg" alt="Avatar 3" width={48} height={48} className="w-full h-full object-cover" />
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all shadow-sm">
                 <Image src="/avatar/avatar4.jpg" alt="Avatar 4" width={48} height={48} className="w-full h-full object-cover" />
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all shadow-sm">
                 <Image src="/avatar/avatar5.jpg" alt="Avatar 5" width={48} height={48} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">First Name</label>
                <input type="text" defaultValue="John" className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white" />
              </div>
              {/* Last Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Last Name</label>
                <input type="text" defaultValue="Doe" className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white" />
              </div>
              
              {/* Country */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Country</label>
                <div className="relative">
                  <select defaultValue="IN" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white text-gray-900">
                    <option value="IN">India (+91)</option>
                    <option value="US">United States (+1)</option>
                    <option value="UK">United Kingdom (+44)</option>
                    <option value="BD">Bangladesh (+880)</option>
                  </select>
                  <CaretDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Phone Number</label>
                <input type="text" defaultValue="9876543210" className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white" />
              </div>
            </div>
            
            <button className="mt-8 bg-blue-600 text-white px-8 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
              Save Changes
            </button>
          </div>

          {/* Account Overview */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col gap-6">
            <h2 className="text-xl font-bold text-gray-900">Account Overview</h2>
            
            <div className="flex flex-col gap-4">
              {/* Email Row */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 mb-1">Email Address</span>
                  <span className="text-sm text-gray-500">john.doe@example.com</span>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <EnvelopeSimple className="w-4 h-4" /> Change Email
                </button>
              </div>

              {/* Password Row */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 mb-1">Password</span>
                  <span className="text-sm text-gray-500 font-mono">••••••••••••</span>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <LockKey className="w-4 h-4" /> Change Password
                </button>
              </div>
            </div>

            {/* Delete Account */}
            <div className="pt-4 mt-2">
              <button className="flex items-center gap-2 text-sm font-medium text-white bg-red-600 px-6 py-2.5 rounded-full hover:bg-red-700 transition-colors shadow-sm">
                <Trash className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
