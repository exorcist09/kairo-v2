"use client";

import { useState } from "react";
import {
  Key,
  Plus,
  ShieldCheck,
  LockKey,
  X,
  Eye,
  EyeSlash,
  CheckCircle,
  Copy,
  Trash,
} from "@phosphor-icons/react";

interface CredentialItem {
  id: string;
  name: string;
  provider: string;
  createdAt: string;
}

const POPULAR_PROVIDERS = [
  { name: "OpenAI", type: "API Key", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { name: "Stripe", type: "Secret Key", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { name: "GitHub", type: "Personal Access Token", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { name: "Slack", type: "Bot Token", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { name: "PostgreSQL", type: "Database URI", color: "bg-blue-50 text-blue-700 border-blue-200" },
];

export default function Credentials() {
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("OpenAI");
  const [secretKey, setSecretKey] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !secretKey.trim()) return;

    const newCred: CredentialItem = {
      id: `cred-${Date.now()}`,
      name: name.trim(),
      provider,
      createdAt: "Just now",
    };

    setCredentials([newCred, ...credentials]);
    setName("");
    setSecretKey("");
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setCredentials((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credentials</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage encrypted access keys, tokens, and secrets for your integrations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer flex-shrink-0"
        >
          <Plus weight="bold" className="w-4 h-4" />
          <span>New Credential</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 border border-gray-200 rounded-2xl bg-white overflow-hidden flex flex-col">
        {credentials.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-lg mx-auto">
            {/* Visual Icon Badge */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <Key weight="duotone" className="w-10 h-10" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm border-2 border-white">
                <ShieldCheck weight="bold" className="w-4 h-4" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No credentials connected yet
            </h2>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex mt-4 items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer mb-10"
            >
              <Plus weight="bold" className="w-4 h-4" />
              <span>Connect Your First Credential</span>
            </button>

            {/* Supported Integrations Pills */}
            <div className="w-full pt-8 border-t border-gray-100 flex flex-col items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Supported Integrations
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {POPULAR_PROVIDERS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setProvider(p.name);
                      setName(`${p.name} Key`);
                      setIsModalOpen(true);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${p.color} hover:opacity-90 transition-opacity cursor-pointer`}
                  >
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Credentials List (When Items Exist) */
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-3">
            {credentials.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200/80 bg-white hover:border-gray-300 transition-colors shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Key weight="bold" className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{item.name}</span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{item.provider}</span>
                      <span>•</span>
                      <span>Created {item.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                    <CheckCircle weight="fill" className="w-3.5 h-3.5" /> Encrypted
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete credential"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash weight="bold" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Credential Modal (Matches CreateWorkflowModal styling) */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-900/10 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 flex flex-col gap-6 border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <Key weight="bold" className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Add Credential</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              {/* Provider Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Service / Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white cursor-pointer"
                >
                  <option value="OpenAI">OpenAI API</option>
                  <option value="Stripe">Stripe Payments</option>
                  <option value="GitHub">GitHub</option>
                  <option value="Slack">Slack Bot</option>
                  <option value="PostgreSQL">PostgreSQL Database</option>
                  <option value="Custom">Custom Bearer Token / Key</option>
                </select>
              </div>

              {/* Credential Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Credential Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production Stripe Key"
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                />
              </div>

              {/* Secret Value */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Secret Value <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    required
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="sk-live-••••••••••••••••"
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showSecret ? <EyeSlash className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  Encrypted securely before saving. Only workflow runners can decrypt this.
                </p>
              </div>

              {/* Modal Buttons: Two Full Length in One Row */}
              <div className="grid grid-cols-2 gap-3 w-full pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors text-center cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || !secretKey.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  Save Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
