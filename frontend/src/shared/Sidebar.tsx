"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { House, Path, Key, CreditCard, Gear, UserCircle, SignOut, Bell } from "@phosphor-icons/react";

const NAV_ITEMS = [
  { name: "Home", href: "/home", icon: House },
  { name: "Workflows", href: "/workflows", icon: Path },
  { name: "Credentials", href: "/credentials", icon: Key },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Gear },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-60 h-screen border-r border-gray-200 bg-gray-50 flex flex-col justify-between py-6">
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
        {/* Notifications */}
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors w-full group">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <Bell weight="regular" className="w-6 h-6 text-gray-500 group-hover:text-blue-600 transition-colors" />
          </div>
          Notifications
        </button>

        {/* User Info */}
        <Link href="/settings" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
            <UserCircle weight="light" className="w-8 h-8 text-gray-500 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">John Doe</span>
            <span className="text-xs text-gray-500">john@example.com</span>
          </div>
        </Link>

        {/* Logout Button */}
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full mt-2 group">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <SignOut weight="bold" className="w-6 h-6" />
          </div>
          Logout
        </button>
      </div>
    </div>
  );
}
