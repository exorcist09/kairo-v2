"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SignOut, X } from "@phosphor-icons/react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
    router.push("/login");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/10 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 flex flex-col gap-6 border border-gray-100 animate-in zoom-in-95 duration-200"
      >
        {/* Header like CreateWorkflowModal */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <SignOut weight="bold" className="w-6 h-6 text-red-500/85" />
            <h2 id="logout-modal-title" className="text-xl font-bold text-gray-900">
              Log Out
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-gray-900">
            Are you sure you want to log out?
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            You will be redirected to the login screen and will need to authenticate again to access your workflows and credentials.
          </p>
        </div>

        {/* Two Full-Length Action Buttons in One Row */}
        <div className="grid grid-cols-2 gap-3 w-full pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:text-gray-900 transition-colors text-center cursor-pointer shadow-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-red-500/85 hover:bg-red-600 text-white text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <SignOut weight="bold" className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
