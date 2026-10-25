"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import {
  X,
  PaperPlaneRight,
  ArrowsClockwise,
  Cpu,
  Copy,
  Check,
  Minus,
} from "@phosphor-icons/react";

interface Message {
  id: string;
  sender: "user" | "kai";
  text: string;
  time: string;
}

type Phase = "idle" | "opening" | "open" | "closing";
type Dir = "open" | "minimize";
interface Pt {
  x: number;
  y: number;
}
interface Layout {
  win: Pt;
  dock: Pt;
  size: { w: number; h: number };
}

// Snappy, ultra-fast animation duration (260ms) with zero lag
const DUR = 260;
const STEP = 2; // 2px scanline slices cuts canvas draw calls by 50% for buttery 60+ FPS

// Authentic macOS Genie lamp mathematical easing functions
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const eioC = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eIn2 = (t: number) => t * t;
const eOut2 = (t: number) => 1 - (1 - t) * (1 - t);

// Mathematical scanline renderer that bends the window row-by-row into the dock
function renderGenie(
  ctx: CanvasRenderingContext2D,
  off: HTMLCanvasElement,
  W: number,
  H: number,
  rawT: number,
  dir: Dir,
  dock: Pt,
  win: Pt,
  winW: number,
  winH: number,
): void {
  ctx.clearRect(0, 0, W, H);
  if (!off || off.width === 0 || off.height === 0) return;

  for (let y = 0; y < winH; y += STEP) {
    const r = y / winH;
    const rowXStart = dir === "minimize" ? (1 - r) * 0.65 : r * 0.65;
    const xP = clamp((rawT - rowXStart) / (1 - rowXStart), 0, 1);
    const xE = eioC(xP);
    const rowYStart = dir === "minimize" ? (1 - r) * 0.2 : r * 0.2;
    const yP = clamp((rawT - rowYStart) / (1 - rowYStart), 0, 1);
    const yE = eIn2(yP);

    let left: number;
    let right: number;
    let destY: number;

    if (dir === "minimize") {
      left = lerp(win.x, dock.x, xE);
      right = lerp(win.x + winW, dock.x, xE);
      destY = lerp(win.y + y, dock.y, yE);
    } else {
      left = lerp(dock.x, win.x, xE);
      right = lerp(dock.x, win.x + winW, xE);
      destY = lerp(dock.y, win.y + y, yE);
    }

    const rowW = right - left;
    if (rowW < 0.8) continue;

    ctx.drawImage(
      off,
      0,
      (y / winH) * off.height,
      off.width,
      Math.max(1, (STEP / winH) * off.height),
      left,
      destY,
      rowW,
      STEP,
    );
  }

  // Radial magical lamp glow as window merges into dock icon
  const glowRaw = dir === "minimize" ? rawT : 1 - rawT;
  if (glowRaw > 0.72) {
    const a = eOut2((glowRaw - 0.72) / 0.28) * 0.35;
    const hex = Math.round(a * 255)
      .toString(16)
      .padStart(2, "0");
    const g = ctx.createRadialGradient(dock.x, dock.y, 0, dock.x, dock.y, 65);
    g.addColorStop(0, "#ffffff" + hex);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
}

// Isometric Hexagonal Loop Emblem for Kai
function KaiLogo({ className = "w-full h-full" }: { className?: string; idPrefix?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 44.5 11.2 Q 50 8 55.5 11.2 L 82.5 26.8 Q 88 30 88 36 L 88 64 Q 88 70 82.5 73.2 L 55.5 88.8 Q 50 92 44.5 88.8 L 17.5 73.2 Q 12 70 12 64 L 12 36 Q 12 30 17.5 26.8 Z M 51.8 32.3 Q 56 30 60.2 32.4 L 82.5 45.0 Q 86 47 81.5 49.5 L 48.2 67.7 Q 44 70 39.8 67.6 L 17.5 55.0 Q 14 53 18.5 50.5 Z"
        fill="white"
      />
    </svg>
  );
}

// Synchronous, 100% reliable high-fidelity window canvas generator
function createWindowCanvas(w: number, h: number, messages: Message[] = []): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return c;

  // Window background (rounded rectangle)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 24);
  ctx.fill();

  // Subtle outer border
  ctx.strokeStyle = "rgba(229, 231, 235, 0.9)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Top header in soft charcoal (less black)
  ctx.fillStyle = "#18181b"; // zinc-900
  ctx.beginPath();
  ctx.roundRect(0, 0, w, 44, [24, 24, 0, 0]);
  ctx.fill();

  // Header bottom border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.moveTo(0, 44);
  ctx.lineTo(w, 44);
  ctx.stroke();

  // Logo pill in header
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.beginPath();
  ctx.roundRect(16, 10, 24, 24, 6);
  ctx.fill();

  // Draw miniature Kai hexagon logo
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(28, 14);
  ctx.lineTo(34, 18);
  ctx.lineTo(34, 26);
  ctx.lineTo(28, 30);
  ctx.lineTo(22, 26);
  ctx.lineTo(22, 18);
  ctx.closePath();
  ctx.stroke();

  // Header title: Kai
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Kai", 48, 26);

  // Assistant badge
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.roundRect(76, 13, 58, 18, 9);
  ctx.fill();
  ctx.fillStyle = "#d1d5db";
  ctx.font = "500 11px system-ui, -apple-system, sans-serif";
  ctx.fillText("Assistant", 84, 26);

  // Close & minimize button pills
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.roundRect(w - 36, 10, 24, 24, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.stroke();
  // X icon
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w - 28, 18);
  ctx.lineTo(w - 20, 26);
  ctx.moveTo(w - 20, 18);
  ctx.lineTo(w - 28, 26);
  ctx.stroke();

  // Minus icon
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.beginPath();
  ctx.roundRect(w - 66, 10, 24, 24, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.stroke();
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w - 58, 22);
  ctx.lineTo(w - 50, 22);
  ctx.stroke();

  if (messages.length === 0) {
    // Initial Gemini-style screen
    const midX = w / 2;

    // Central emblem container
    ctx.fillStyle = "#27272a"; // zinc-800
    ctx.beginPath();
    ctx.roundRect(midX - 22, 96, 44, 44, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.stroke();

    // Emblem inside
    ctx.strokeStyle = "#e4e4e7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX, 105);
    ctx.lineTo(midX + 11, 112);
    ctx.lineTo(midX + 11, 124);
    ctx.lineTo(midX, 131);
    ctx.lineTo(midX - 11, 124);
    ctx.lineTo(midX - 11, 112);
    ctx.closePath();
    ctx.stroke();

    // Hero title in grey
    ctx.fillStyle = "#4b5563"; // gray-600
    ctx.font = "600 17px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("What would you like to automate today?", midX, 172);

    // Hero subtitle in grey
    ctx.fillStyle = "#9ca3af"; // gray-400
    ctx.font = "12px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      "Ask anything about triggers, node connections, or execution telemetry.",
      midX,
      196,
    );

    // Centered prompt input box mock
    const boxW = Math.min(480, w - 48);
    const boxX = (w - boxW) / 2;
    const boxY = 228;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, 80, 16);
    ctx.fill();
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Placeholder text inside box
    ctx.fillStyle = "#9ca3af";
    ctx.font = "13px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Ask Kai anything about your workflows...", boxX + 16, boxY + 30);

    // Bottom row inside box
    ctx.strokeStyle = "#f3f4f6";
    ctx.beginPath();
    ctx.moveTo(boxX + 12, boxY + 46);
    ctx.lineTo(boxX + boxW - 12, boxY + 46);
    ctx.stroke();

    ctx.fillStyle = "#9ca3af";
    ctx.font = "500 11px system-ui, -apple-system, sans-serif";
    ctx.fillText("Kairo AI Engine", boxX + 16, boxY + 66);

    // Ask Kai blue button
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.roundRect(boxX + boxW - 84, boxY + 52, 72, 22, 8);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 11px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Ask Kai", boxX + boxW - 48, boxY + 67);
  } else {
    // Chat message view
    ctx.fillStyle = "rgba(248, 250, 252, 0.5)";
    ctx.fillRect(0, 44, w, h - 44 - 56);

    let curY = 60;
    const visibleMsgs = messages.slice(-4);
    for (const m of visibleMsgs) {
      if (curY > h - 120) break;
      const isUser = m.sender === "user";
      const bubbleW = Math.min(360, w - 80);

      if (isUser) {
        ctx.fillStyle = "#2563eb"; // blue
        ctx.beginPath();
        ctx.roundRect(w - bubbleW - 20, curY, bubbleW, 36, 12);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "12px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(
          m.text.slice(0, 45) + (m.text.length > 45 ? "..." : ""),
          w - bubbleW - 8,
          curY + 22,
        );
        curY += 48;
      } else {
        // Kai logo avatar
        ctx.fillStyle = "#18181b";
        ctx.beginPath();
        ctx.roundRect(20, curY, 24, 24, 6);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(52, curY, bubbleW, 44, 12);
        ctx.fill();
        ctx.strokeStyle = "#e5e7eb";
        ctx.stroke();

        ctx.fillStyle = "#1f2937";
        ctx.font = "12px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(
          m.text.slice(0, 45) + (m.text.length > 45 ? "..." : ""),
          64,
          curY + 26,
        );
        curY += 56;
      }
    }

    // Bottom chat input bar
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, h - 56, w, 56);
    ctx.strokeStyle = "#e5e7eb";
    ctx.beginPath();
    ctx.moveTo(0, h - 56);
    ctx.lineTo(w, h - 56);
    ctx.stroke();

    ctx.fillStyle = "#f9fafb";
    ctx.beginPath();
    ctx.roundRect(16, h - 46, w - 74, 36, 10);
    ctx.fill();
    ctx.strokeStyle = "#e5e7eb";
    ctx.stroke();

    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Ask Kai a follow-up...", 28, h - 23);

    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.roundRect(w - 50, h - 46, 36, 36, 10);
    ctx.fill();
  }

  return c;
}

export default function KaiAssistant() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stateRef = useRef<{ phase: Phase }>({ phase: "idle" });
  stateRef.current.phase = phase;

  const isHomePage = pathname === "/home" || pathname === "/";

  // Compute layout coordinates for window and dock button
  // Places the chatbox higher up above the Kai trigger button with comfortable breathing room
  const getLayout = useCallback((): Layout => {
    const isHome = pathname === "/home" || pathname === "/";
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;

    const w = Math.min(vw - 32, 540);
    const h = Math.min(vh - 140, 480);

    let dockX = vw - 56;
    let dockY = vh - 56;

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      dockX = rect.left + rect.width / 2;
      dockY = rect.top + rect.height / 2;
    } else if (isHome) {
      dockX = vw / 2 + (vw > 640 ? 120 : 0);
    }

    // Direct alignment: center window right over the Kai logo button
    let winX = isHome
      ? dockX - w / 2
      : Math.max(16, vw - w - 24);

    winX = Math.max(16, Math.min(vw - w - 16, winX));
    // Positioned a little higher up from the Kai logo button (dockY - h - 64)
    const winY = Math.max(20, dockY - h - 64);

    return {
      win: { x: winX, y: winY },
      dock: { x: dockX, y: dockY },
      size: { w, h },
    };
  }, [pathname]);

  const setupCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    c.width = w * dpr;
    c.height = h * dpr;
    c.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  const clearCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
  }, []);

  const startAnim = useCallback(
    (dir: Dir, layout: Layout, onDone: () => void) => {
      cancelAnimationFrame(rafRef.current);
      const { win, dock, size } = layout;
      // Guarantee high-fidelity texture is always ready
      const off = offCanvasRef.current || createWindowCanvas(size.w, size.h, messages);
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      let start: number | null = null;

      function frame(ts: number) {
        if (!start) start = ts;
        const rawT = clamp((ts - start) / DUR, 0, 1);
        const c = canvasRef.current;
        if (!c) return;
        renderGenie(
          c.getContext("2d")!,
          off,
          cw,
          ch,
          rawT,
          dir,
          dock,
          win,
          size.w,
          size.h,
        );
        if (rawT < 1) {
          rafRef.current = requestAnimationFrame(frame);
        } else {
          onDone();
        }
      }
      rafRef.current = requestAnimationFrame(frame);
    },
    [messages],
  );

  const doOpen = useCallback(() => {
    if (stateRef.current.phase !== "idle") return;
    const layout = getLayout();
    const cvs = canvasRef.current;
    if (cvs) cvs.style.zIndex = "9999";
    setupCanvas();

    const { size } = layout;
    const off = createWindowCanvas(size.w, size.h, messages);
    offCanvasRef.current = off;

    stateRef.current.phase = "opening";
    setPhase("opening");

    startAnim("open", layout, () => {
      stateRef.current.phase = "open";
      flushSync(() => {
        setPhase("open");
      });
      clearCanvas();
    });
  }, [getLayout, setupCanvas, startAnim, clearCanvas, messages]);

  // Synchronous and immediate minimize - guaranteed visible closing genie animation
  const doMinimize = useCallback(() => {
    if (stateRef.current.phase !== "open") return;
    const layout = getLayout();
    const cvs = canvasRef.current;
    if (cvs) cvs.style.zIndex = "9999";

    setupCanvas();
    const { win, dock, size } = layout;
    // Generate fresh window canvas texture matching current chat state
    const off = createWindowCanvas(size.w, size.h, messages);
    offCanvasRef.current = off;

    const ctx = cvs?.getContext("2d");
    if (ctx && cvs && off) {
      renderGenie(
        ctx,
        off,
        window.innerWidth,
        window.innerHeight,
        0,
        "minimize",
        dock,
        win,
        size.w,
        size.h,
      );
    }

    if (windowRef.current) {
      windowRef.current.style.opacity = "0";
      windowRef.current.style.pointerEvents = "none";
    }

    stateRef.current.phase = "closing";
    setPhase("closing");

    startAnim("minimize", layout, () => {
      stateRef.current.phase = "idle";
      setPhase("idle");
      clearCanvas();
    });
  }, [getLayout, setupCanvas, startAnim, clearCanvas, messages]);

  const handleToggle = () => {
    if (phase === "open") {
      doMinimize();
    } else if (phase === "idle") {
      doOpen();
    }
  };

  useEffect(() => {
    if (phase === "open") {
      if (messages.length > 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        inputRef.current?.focus();
      }
    }
  }, [messages, phase]);

  // Escape key minimizes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "open") {
        doMinimize();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, doMinimize]);

  // Click outside minimizes
  useEffect(() => {
    if (phase !== "open") return;
    const handlePointerDown = (e: MouseEvent) => {
      if (
        windowRef.current &&
        !windowRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        doMinimize();
      }
    };
    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [phase, doMinimize]);

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userText.trim(),
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply =
        "I can help configure and monitor that workflow for you. You can connect triggers and executor nodes in the canvas editor anytime!";
      const lower = userText.toLowerCase();

      if (lower.includes("webhook") || lower.includes("stripe")) {
        reply =
          "To create a Stripe webhook workflow, add a Webhook Trigger node in the editor. Copy the endpoint into your Stripe Dashboard webhook settings, then pipe the payload into an AI or Slack Executor.";
      } else if (lower.includes("credit") || lower.includes("bill") || lower.includes("cost")) {
        reply =
          "Each node in your workflow has a marked credit cost (AI executors consume 2-3 credits, triggers 0-1 credits). Credits are atomically deducted when the workflow starts execution.";
      } else if (lower.includes("credential") || lower.includes("key") || lower.includes("secret") || lower.includes("encrypt")) {
        reply =
          "Credentials in Kairo are encrypted at rest with AES-256. You can manage or add API keys from the Credentials page, and select them seamlessly inside node config drawers.";
      } else if (lower.includes("latency") || lower.includes("speed") || lower.includes("fast")) {
        reply =
          "Kairo executes workflows using an event-driven background engine with 0ms perceived UI latency. Execution states and payloads stream to your editor worker via real-time WebSocket events.";
      } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
        reply =
          "Hello! I am Kai, your Kairo assistant. Ask me to construct workflow topologies, verify credentials, or inspect background executor telemetry.";
      }

      const kaiMsg: Message = {
        id: `k-${Date.now()}`,
        sender: "kai",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, kaiMsg]);
      setIsTyping(false);
    }, 650);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([]);
    setInput("");
  };

  const currentLayout = getLayout();

  return (
    <>
      {/* Fullscreen High-Performance Genie Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{
          width: "100vw",
          height: "100vh",
          zIndex: 9999,
        }}
      />

      {/* Real Live Interactive Kai Window */}
      {(phase === "open" || phase === "closing") && (
        <div
          ref={windowRef}
          className="fixed rounded-3xl shadow-2xl border border-gray-200/90 flex flex-col overflow-hidden bg-white/95 backdrop-blur-2xl z-[70] transition-opacity duration-150"
          style={{
            width: currentLayout.size.w,
            height: currentLayout.size.h,
            left: currentLayout.win.x,
            top: currentLayout.win.y,
            opacity: phase === "open" ? 1 : 0,
            pointerEvents: phase === "open" ? "auto" : "none",
          }}
        >
          {/* Top Bar Header (Soft Charcoal / Less Black) */}
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-zinc-900 text-white flex-shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center p-1 border border-white/15">
                <KaiLogo idPrefix="live-header" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">Kai</span>
                <span className="text-[11px] font-medium text-gray-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                  Assistant
                </span>
              </div>
            </div>

            {/* Top Bar Actions with visible backgrounds */}
            <div className="flex items-center gap-2 text-gray-200">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  title="New Chat / Clear"
                  className="w-7 h-7 rounded-lg text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all cursor-pointer shadow-2xs flex items-center justify-center"
                >
                  <ArrowsClockwise className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={doMinimize}
                title="Minimize window"
                className="w-7 h-7 rounded-lg text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all cursor-pointer shadow-2xs flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={doMinimize}
                title="Close"
                className="w-7 h-7 rounded-lg text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all cursor-pointer shadow-2xs flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Gemini Style Initial Screen vs Active Chatbox Stream */}
          {messages.length === 0 ? (
            /* Gemini View: Text box in center, polished grey-only typography */
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 overflow-y-auto no-scrollbar text-center">
              <div className="w-11 h-11 rounded-2xl bg-zinc-800 flex items-center justify-center p-2.5 shadow-sm border border-white/10 mb-3 text-gray-300">
                <KaiLogo idPrefix="gemini-hero" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-600">
                What would you like to automate today?
              </h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Ask anything about triggers, node connections, or execution telemetry.
              </p>

              {/* Centered Gemini Prompt Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="w-full max-w-lg mt-5 bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-gray-300 focus-within:border-gray-400 focus-within:ring-4 focus-within:ring-gray-200/50 transition-all p-3 flex flex-col gap-2 text-left"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Kai anything about your workflows..."
                  className="w-full px-2 py-1.5 text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent"
                />
                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                    <Cpu weight="duotone" className="w-3.5 h-3.5 text-gray-400" />
                    <span>Kairo AI Engine</span>
                  </div>
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Ask Kai</span>
                    <PaperPlaneRight weight="fill" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Active Chatbox View: Scrollable messages + bottom docked input */
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/40">
              <div className="flex-1 overflow-y-auto no-scrollbar p-5 flex flex-col gap-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-start gap-2.5 max-w-[88%] sm:max-w-[80%]">
                      {m.sender === "kai" && (
                        <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center p-1.5 flex-shrink-0 shadow-xs border border-white/20 mt-0.5">
                          <KaiLogo idPrefix={`msg-${m.id}`} />
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                          m.sender === "user"
                            ? "bg-blue-600 text-white rounded-br-xs"
                            : "bg-white text-gray-800 border border-gray-200/90 rounded-bl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.text}</p>
                        {m.sender === "kai" && (
                          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                            <span>{m.time}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(m.id, m.text)}
                              className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              {copiedId === m.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-600">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {m.sender === "user" && (
                      <span className="text-[10px] text-gray-400 mt-1 px-1">{m.time}</span>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center p-1.5 flex-shrink-0 shadow-xs border border-white/20">
                      <KaiLogo idPrefix="typing" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-white border border-gray-200/90 px-3.5 py-2.5 rounded-2xl shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Docked Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="p-3.5 bg-white border-t border-gray-200/90 flex items-center gap-2 flex-shrink-0"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Kai a follow-up..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50/70 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 shadow-xs"
                >
                  <PaperPlaneRight weight="fill" className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Floating Container: Positioned bottom-center on homepage, bottom-right on other pages */}
      <div
        className={`fixed z-50 transition-all duration-500 ease-in-out pointer-events-none ${
          isHomePage
            ? "bottom-6 left-1/2 -translate-x-1/2 sm:left-[calc(50%+7.5rem)]"
            : "bottom-6 right-6 sm:right-8 translate-x-0"
        }`}
      >
        {/* Kai Trigger Circle Button with Single Black Concentric Circle & Surrounding Fogged Backdrop */}
        <div className="relative group pointer-events-auto flex items-center justify-center">
          {/* Fogged Backdrop in radius around outer circle */}
          <div className="absolute -inset-4.5 rounded-full bg-white/60 backdrop-blur-md pointer-events-none transition-all duration-300 group-hover:scale-105 shadow-[0_0_18px_rgba(255,255,255,0.95)]" />

          {/* Single Black Concentric Circle */}
          <div className="absolute -inset-1 rounded-full border border-black pointer-events-none transition-all duration-300 group-hover:scale-105 group-hover:border-black/70" />

          {/* Subtle Ambient Pulsing Glow behind Kai */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 opacity-65 blur-md group-hover:opacity-95 transition-opacity animate-pulse pointer-events-none" />

          {/* Circular Button */}
          <button
            ref={buttonRef}
            type="button"
            onClick={handleToggle}
            aria-label="Open Kai AI Assistant"
            className="relative w-14 h-14 rounded-full bg-black text-white shadow-xl flex items-center justify-center p-2.5 border border-white/20 transition-transform duration-200 group-hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <KaiLogo idPrefix="button" />

            <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-[10px] font-bold text-white px-1.5 py-0.2 rounded-full border border-white shadow-xs">
              Kai
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
