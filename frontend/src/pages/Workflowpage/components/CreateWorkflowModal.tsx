"use client";

import { useState } from "react";
import { Path, X } from "@phosphor-icons/react";

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export default function CreateWorkflowModal({
  isOpen,
  onClose,
  onCreate,
}: CreateWorkflowModalProps) {
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  if (!isOpen) return null;

  const handleCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newName.trim()) return;
    onCreate(newName.trim(), newDesc.trim());
    setNewName("");
    setNewDesc("");
  };

  const handleClose = () => {
    setNewName("");
    setNewDesc("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/10 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 flex flex-col gap-6 border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Path weight="bold" className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Create Workflow</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Workflow Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Stripe Webhook to Slack Sync"
              className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Description <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe what trigger and actions this workflow automates..."
              rows={3}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white resize-none"
            />
          </div>

          {/* Action Buttons: Two Full Length in One Row */}
          <div className="grid grid-cols-2 gap-3 w-full pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors text-center cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newName.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              Create Workflow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
