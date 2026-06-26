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
    <div className="w-64 h-screen border-r border-gray-200 bg-white flex flex-col justify-between py-6">
      {/* Top Section */}
      <div className="flex flex-col gap-8 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/Kairo.png" alt="Logo" width={100} height={32} className="h-8 w-auto" />
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-blue-50/50 hover:text-blue-600"
                }`}
              >
                <Icon weight={isActive ? "fill" : "regular"} className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="px-6 flex flex-col gap-2">
        {/* Notifications */}
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors w-full">
          <Bell weight="regular" className="w-5 h-5" />
          Notifications
        </button>

        {/* User Info */}
        <Link href="/settings" className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
            <UserCircle weight="light" className="w-8 h-8 text-gray-500 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">John Doe</span>
            <span className="text-xs text-gray-500">john@example.com</span>
          </div>
        </Link>

        {/* Logout Button */}
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full mt-2">
          <SignOut weight="bold" className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
