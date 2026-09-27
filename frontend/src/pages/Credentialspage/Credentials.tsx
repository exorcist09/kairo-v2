"use client";

import { useState } from "react";
import {
  Key,
  Plus,
  X,
  Eye,
  EyeClosed,
  Trash,
} from "@phosphor-icons/react";

interface CredentialItem {
  id: string;
  name: string;
  provider: string;
  value: string;
  createdAt: string;
}

const PROVIDER_OPTIONS = [
  { value: "OpenAI", label: "OpenAI API", placeholder: "sk-proj-••••••••••••••••" },
  { value: "Google Gemini", label: "Google Gemini", placeholder: "AIzaSy••••••••••••••••" },
  { value: "Slack", label: "Slack Bot", placeholder: "xoxb-••••••••••••••••" },
  { value: "Email", label: "Email", placeholder: "smtp_pass_••••••••••••••••" },
  { value: "PostgreSQL", label: "PostgreSQL Database", placeholder: "postgresql://user:pass@host:5432/db" },
  { value: "Google Form", label: "Google Form", placeholder: "1FAIpQLSc••••••••••••••••" },
];

const INITIAL_CREDENTIALS: CredentialItem[] = [
  {
    id: "cred-openai",
    name: "OpenAI Production Key",
    provider: "OpenAI",
    value: "sk-proj-a98Fk2091mKLa98172bvc891240182",
    createdAt: "2 days ago",
  },
  {
    id: "cred-gemini",
    name: "Gemini API Secret",
    provider: "Google Gemini",
    value: "AIzaSyD83921049182309124kLmNpQrStU",
    createdAt: "3 days ago",
  },
  {
    id: "cred-slack",
    name: "Slack Bot Token",
    provider: "Slack",
    value: "xoxb-9182309182-1928301928371-aBcDeF",
    createdAt: "1 week ago",
  },
  {
    id: "cred-email",
    name: "Email SMTP Secret",
    provider: "Email",
    value: "smtp_live_9812739018239012389102",
    createdAt: "1 week ago",
  },
  {
    id: "cred-postgres",
    name: "Production PostgreSQL",
    provider: "PostgreSQL",
    value: "postgresql://kairo_admin:P@ssw0rd99@db.kairo.dev:5432/main",
    createdAt: "2 weeks ago",
  },
  {
    id: "cred-google-form",
    name: "Google Form Access Key",
    provider: "Google Form",
    value: "1FAIpQLSc837192847192849182039182",
    createdAt: "3 weeks ago",
  },
];

function maskKey(val: string) {
  if (!val) return "••••••••••••••••";
  if (val.length <= 8) return "••••••••••••••••";
  return val.slice(0, 4) + "••••••••••••" + val.slice(-4);
}

export default function Credentials() {
  const [credentials, setCredentials] = useState<CredentialItem[]>(INITIAL_CREDENTIALS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  // Form State
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("OpenAI");
  const [secretKey, setSecretKey] = useState("");
  const [showModalSecret, setShowModalSecret] = useState(false);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !secretKey.trim()) return;

    const newCred: CredentialItem = {
      id: `cred-${Date.now()}`,
      name: name.trim(),
      provider,
      value: secretKey.trim(),
      createdAt: "Just now",
    };

    setCredentials([newCred, ...credentials]);
    setName("");
    setSecretKey("");
    setShowModalSecret(false);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setCredentials((prev) => prev.filter((c) => c.id !== id));
    setRevealedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const currentProviderObj = PROVIDER_OPTIONS.find((p) => p.value === provider) || PROVIDER_OPTIONS[0];

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
          onClick={() => {
            setName("");
            setSecretKey("");
            setProvider("OpenAI");
            setShowModalSecret(false);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer flex-shrink-0"
        >
          <Plus weight="bold" className="w-4 h-4" />
          <span>New Credential</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 border border-gray-200 rounded-2xl bg-white overflow-hidden flex flex-col">
        {credentials.length === 0 ? (
          /* Empty State (Without Supported Integrations) */
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-lg mx-auto">
            {/* Visual Icon Badge */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-blue-50/60 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <Key weight="duotone" className="w-10 h-10" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No credentials connected yet
            </h2>
            <p className="text-xs text-gray-500 max-w-sm mb-6">
              Connect API keys and secrets for OpenAI, Gemini, Slack, Email, PostgreSQL, and Google Forms.
            </p>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Plus weight="bold" className="w-4 h-4" />
              <span>Connect Your First Credential</span>
            </button>
          </div>
        ) : (
          /* Credentials List (Shows dummy state for each provider) */
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col gap-3">
            {credentials.map((item) => {
              const isRevealed = revealedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200/80 bg-white hover:border-gray-300 transition-colors shadow-xs gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Key weight="bold" className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 shrink-0">
                          {item.provider}
                        </span>
                      </div>

                      {/* API Key Plain Text */}
                      <div className="mt-1">
                        <span className="font-mono text-xs text-gray-500 truncate max-w-[200px] sm:max-w-sm block select-none">
                          {isRevealed ? item.value : maskKey(item.value)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleReveal(item.id)}
                      title={isRevealed ? "Hide key" : "Show key"}
                      aria-label={isRevealed ? "Hide key" : "Show key"}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 active:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer select-none"
                    >
                      {isRevealed ? (
                        <EyeClosed weight="bold" className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Eye weight="bold" className="w-4 h-4" />
                      )}
                    </button>
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
              );
            })}
          </div>
        )}
      </div>

      {/* New Credential Modal */}
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
              {/* Provider Selection (Filtered by NodeType: OpenAI, Gemini, Slack, Email, PostgreSQL, Google Form) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Service / Integration
                </label>
                <select
                  value={provider}
                  onChange={(e) => {
                    const nextP = e.target.value;
                    setProvider(nextP);
                    if (!name || name.endsWith("Key") || name.endsWith("Token")) {
                      setName(`${nextP} Key`);
                    }
                  }}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white cursor-pointer"
                >
                  {PROVIDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
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
                  placeholder={`e.g. ${provider} Production Key`}
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                />
              </div>

              {/* Secret Value with Toggle Reveal */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Secret Value <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showModalSecret ? "text" : "password"}
                    required
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder={currentProviderObj.placeholder}
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalSecret((prev) => !prev)}
                    title={showModalSecret ? "Hide secret" : "Show secret"}
                    aria-label={showModalSecret ? "Hide secret" : "Show secret"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 active:text-blue-600 transition-colors cursor-pointer select-none p-1"
                  >
                    {showModalSecret ? (
                      <EyeClosed weight="bold" className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  Click eye icon to toggle secret visibility. Encrypted securely before saving.
                </p>
              </div>

              {/* Modal Buttons */}
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
