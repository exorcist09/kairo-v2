"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { House, Path, Key, CreditCard, Gear, SignOut, Bell } from "@phosphor-icons/react";
import { useState } from "react";
import LogoutModal from "./LogoutModal";

const NAV_ITEMS = [
  { name: "Home", href: "/home", icon: House },
  { name: "Workflows", href: "/workflows", icon: Path },
  { name: "Credentials", href: "/credentials", icon: Key },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Gear },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const isNotificationActive = pathname?.startsWith("/notifications");

  return (
    <>
      <div className="w-60 h-screen border-r border-gray-200 bg-gray-50 flex flex-col justify-between py-6 flex-shrink-0">
        {/* Top Section */}
        <div className="flex flex-col gap-8 pt-6">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 px-6">
            <Image src="/Kairo.png" alt="Logo" width={100} height={32} className="h-8 w-auto brightness-0" />
          </Link>

          {/* Navigation */}
          <nav className="mt-8 flex flex-col gap-2 pl-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);

              return (
                <div key={item.name} className="relative flex">
                  {/* Outward curves for fluid tab effect */}
                  {isActive && (
                    <>
                      <div className="absolute right-[-1px] top-[-15px] w-4 h-4 bg-transparent rounded-br-2xl border-b border-gray-200 shadow-[8px_8px_0_8px_white] z-30 pointer-events-none" />
                      <div className="absolute right-[-1px] bottom-[-15px] w-4 h-4 bg-transparent rounded-tr-2xl border-t border-gray-200 shadow-[8px_-8px_0_8px_white] z-30 pointer-events-none" />
                      {/* Extra mask to guarantee right border is hidden */}
                      <div className="absolute right-[-2px] top-0 bottom-0 w-1 bg-white z-10" />
                    </>
                  )}
                  <Link
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white text-blue-600 relative z-20 border-y border-l border-gray-200 rounded-l-xl -mr-[1px]"
                        : "text-gray-600 hover:bg-gray-200/50 hover:text-blue-600 rounded-lg mr-4"
                    }`}
                  >
                    <Icon weight={isActive ? "fill" : "regular"} className="w-5 h-5" />
                    {item.name}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="px-4 flex flex-col gap-2">
          {/* Notifications Button/Link */}
          <Link
            href="/notifications"
            className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              isNotificationActive
                ? "bg-blue-100/60 text-blue-700 font-semibold shadow-xs"
                : "text-gray-600 hover:bg-gray-200/60 hover:text-blue-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <Bell
                  weight={isNotificationActive ? "fill" : "regular"}
                  className={`w-5 h-5 transition-colors ${
                    isNotificationActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                  }`}
                />
              </div>
              <span>Notifications</span>
            </div>
          </Link>

          {/* User Info - Strictly Non-Clickable as requested */}
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl select-none bg-white/50 border border-gray-200/60 shadow-xs cursor-default">
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 bg-gray-100 shadow-xs">
              <Image
                src="/avatar/avatar1.jpg"
                alt="John Doe"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-gray-900 truncate">John Doe</span>
              <span className="text-xs text-gray-500 truncate">john@example.com</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50/80 transition-colors w-full cursor-pointer group mt-1"
          >
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <SignOut weight="bold" className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
