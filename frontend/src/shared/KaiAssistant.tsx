"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  X,
  PaperPlaneRight,
  ArrowsClockwise,
  Lightning,
  Path,
  CreditCard,
  Key,
} from "@phosphor-icons/react";

interface Message {
  id: string;
  sender: "user" | "kai";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m-1",
    sender: "kai",
    text: "Hi! I'm Kai, your Kairo assistant. Need help building a workflow, testing credentials, or analyzing executions?",
    time: "",
  },
];

const SUGGESTIONS = [
  { text: "Build a Stripe webhook workflow", icon: Path },
  { text: "How do credit limits work?", icon: CreditCard },
  { text: "Check credential encryption", icon: Key },
  { text: "Optimize execution latency", icon: Lightning },
];

// Isometric Hexagonal Loop Emblem for Kai (White on Black)
function KaiLogo({ className = "w-full h-full" }: { className?: string; idPrefix?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      {/* Outer Hexagon with Inner Parallelogram Cutout */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 44.5 11.2 Q 50 8 55.5 11.2 L 82.5 26.8 Q 88 30 88 36 L 88 64 Q 88 70 82.5 73.2 L 55.5 88.8 Q 50 92 44.5 88.8 L 17.5 73.2 Q 12 70 12 64 L 12 36 Q 12 30 17.5 26.8 Z M 51.8 32.3 Q 56 30 60.2 32.4 L 82.5 45.0 Q 86 47 81.5 49.5 L 48.2 67.7 Q 44 70 39.8 67.6 L 17.5 55.0 Q 14 53 18.5 50.5 Z"
        fill="white"
      />
    </svg>
  );
}

export default function KaiAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Home page check for dynamic bottom-center vs bottom-right corner positioning
  const isHomePage = pathname === "/home" || pathname === "/";

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userText.trim(),
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Context-aware simulated assistant response
    setTimeout(() => {
      let reply = "I can help configure and monitor that workflow for you. You can connect triggers and actions in the node canvas anytime!";
      const lower = userText.toLowerCase();

      if (lower.includes("webhook") || lower.includes("stripe")) {
        reply = "To create a Stripe webhook workflow, add a Webhook trigger node in the editor and copy the generated endpoint URL into your Stripe dashboard webhook settings.";
      } else if (lower.includes("credit") || lower.includes("bill")) {
        reply = "Each workflow execution consumes between 1 to 5 credits depending on complexity. You currently have 649 available credits in your balance.";
      } else if (lower.includes("credential") || lower.includes("key") || lower.includes("secret")) {
        reply = "Credentials in Kairo are encrypted at rest with AES-256. You can manage or add API keys from the Credentials tab on your sidebar.";
      } else if (lower.includes("hello") || lower.includes("hi")) {
        reply = "Hello! Ready to automate some tasks today? Ask me anything about triggers, actions, or credentials.";
      }

      const kaiMsg: Message = {
        id: `k-${Date.now()}`,
        sender: "kai",
        text: reply,
        time: "Just now",
      };

      setMessages((prev) => [...prev, kaiMsg]);
      setIsTyping(false);
    }, 850);
  };

  const handleClear = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <>
      {/* Floating Container: Smooth transition between center and right-corner */}
      <div
        className={`fixed z-50 transition-all duration-500 ease-in-out pointer-events-none ${
          isHomePage
            ? "bottom-6 left-1/2 -translate-x-1/2 sm:left-[calc(50%+7.5rem)]"
            : "bottom-6 right-6 sm:right-8 translate-x-0"
        }`}
      >
        {/* Chatbox Popover */}
        {isOpen && (
          <div
            className={`pointer-events-auto absolute bottom-18 mb-2 w-[calc(100vw-2rem)] sm:w-[600px] h-[480px] max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-gray-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${
              isHomePage ? "-translate-x-1/2 left-1/2" : "right-0"
            }`}
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between bg-black/90 to-slate-900 text-white flex-shrink-0">
              <div className="flex items-center gap-2.5">
                {/* Header Icon */}
                <div className="w-8 h-8 rounded-full  flex items-center justify-center p-1 shadow-inner">
                  <KaiLogo idPrefix="header" />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm tracking-tight text-white">Kai</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  {/* <span className="text-[10px] text-gray-300 font-medium">Kairo Intelligence</span> */}
                </div>
              </div>

              <div className="flex items-center gap-1 text-gray-300">
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ArrowsClockwise className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-3.5 bg-slate-50/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      m.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-xs"
                        : "bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">{m.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-2 rounded-2xl w-16 shadow-xs animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions (Shown when minimal chat history) */}
            {messages.length <= 2 && (
              <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
                {SUGGESTIONS.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(s.text)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors whitespace-nowrap cursor-pointer flex-shrink-0"
                    >
                      <Icon className="w-3 h-3 text-blue-500" />
                      <span>{s.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Chat Input with placeholder "Ask Kai" */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 flex-shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Kai"
                className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50/50 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 shadow-xs"
              >
                <PaperPlaneRight weight="fill" className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Kai Trigger Circle Button with Single Black Concentric Circle & Surrounding Fogged Backdrop */}
        <div className="relative group pointer-events-auto flex items-center justify-center">
          
          {/* Fogged Backdrop in radius around the outer concentric circle */}
          <div className="absolute -inset-4.5 rounded-full bg-white/60 backdrop-blur-md pointer-events-none transition-all duration-300 group-hover:scale-105 shadow-[0_0_18px_rgba(255,255,255,0.95)]" />

          {/* Single Black Concentric Circle */}
          <div className="absolute -inset-1 rounded-full border border-black pointer-events-none transition-all duration-300 group-hover:scale-105 group-hover:border-black/70" />

          {/* Subtle Ambient Pulsing Glow behind Kai */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 opacity-65 blur-md group-hover:opacity-95 transition-opacity animate-pulse pointer-events-none" />

          {/* Circular Button: scales smoothly without rotation */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Open Kai AI Assistant"
            className="relative w-14 h-14 rounded-full bg-black text-white shadow-xl flex items-center justify-center p-2.5 border border-white/20 transition-transform duration-200 group-hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            {/* Quantum AI Orbital Logo */}
            <KaiLogo idPrefix="button" />

            {/* Label badge */}
            <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-[10px] font-bold text-white px-1.5 py-0.2 rounded-full  border-white shadow-xs">
              Kai
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
