"use client";

import { Prohibit, X } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";

interface DisableAccountModalProps {
  isOpen: boolean;
  isDisabling?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function DisableAccountModal({
  isOpen,
  isDisabling = false,
  onClose,
  onConfirm,
}: DisableAccountModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDisabling) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDisabling, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disable-account-modal-title"
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/10 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDisabling) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !isDisabling) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 flex flex-col gap-6 border border-gray-100 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <Prohibit weight="bold" className="w-6 h-6 text-[#78350f]" />
            <h2
              id="disable-account-modal-title"
              className="text-xl font-bold text-gray-900"
            >
              Disable Account
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDisabling}
            aria-label="Close dialog"
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-gray-900">
            Are you sure you want to disable your account?
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            This will temporarily pause your personal account, webhooks, and
            active workflow executions. You can reactivate at any time simply by
            logging back in.
          </p>
        </div>

        {/* Two Full-Length Action Buttons in One Row */}
        <div className="grid grid-cols-2 gap-3 w-full pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDisabling}
            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:text-gray-900 transition-colors text-center cursor-pointer shadow-xs disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDisabling}
            className="w-full py-2.5 px-4 rounded-xl bg-[#78350f] hover:bg-[#5c280a] text-white text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDisabling ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Prohibit weight="bold" className="w-4 h-4" />
            )}
            <span>{isDisabling ? "Disabling..." : "Disable Account"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
