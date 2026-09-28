"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Coins,
  ChartBar,
  CreditCard,
  CheckCircle,
  Circle,
  Receipt,
} from "@phosphor-icons/react";
import { getBalance, getHistory } from "@/api/billing.api";

interface CreditPack {
  id: string;
  name: string;
  credits: number;
  creditsLabel: string;
  price: number;
  formattedPrice: string;
  unitPrice: string;
  badge?: string;
  savings?: string;
}

const FREE_TIER = {
  name: "Free Tier",
  credits: 100,
  creditsLabel: "100 credits / month",
  formattedPrice: "Free",
  unitPrice: "Included with account",
};

const PRESET_PACKS: CreditPack[] = [
  {
    id: "small",
    name: "Small Pack",
    credits: 1000,
    creditsLabel: "1,000 credits",
    price: 799,
    formattedPrice: "₹799.00",
    unitPrice: "₹0.80 / credit",
  },
  {
    id: "medium",
    name: "Medium Pack",
    credits: 5000,
    creditsLabel: "5,000 credits",
    price: 3199,
    formattedPrice: "₹3,199.00",
    unitPrice: "₹0.64 / credit",
    badge: "Most Popular",
    savings: "Save 20%",
  },
  {
    id: "large",
    name: "Large Pack",
    credits: 10000,
    creditsLabel: "10,000 credits",
    price: 5599,
    formattedPrice: "₹5,599.00",
    unitPrice: "₹0.56 / credit",
    savings: "Save 30%",
  },
];

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Billing() {
  const router = useRouter();
  const [selectedPack, setSelectedPack] = useState("medium");
  const [customCredits, setCustomCredits] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const balRes = await getBalance();
        if (typeof balRes?.balance === "number") {
          setCreditBalance(balRes.balance);
        }
      } catch (err) {
        console.error("Failed to load balance", err);
      }

      try {
        setHistoryLoading(true);
        const histRes = await getHistory();
        if (histRes?.history && Array.isArray(histRes.history)) {
          setHistory(histRes.history);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error("Failed to load transaction history", err);
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchBilling();
  }, []);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setPaymentStatus(null);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Check your internet connection.");
      }

      let planType: "SMALL" | "MEDIUM" | "LARGE" | "CUSTOM" = "MEDIUM";
      let creditsCount: number | undefined = undefined;

      if (selectedPack === "small") planType = "SMALL";
      else if (selectedPack === "medium") planType = "MEDIUM";
      else if (selectedPack === "large") planType = "LARGE";
      else if (selectedPack === "custom") {
        planType = "CUSTOM";
        creditsCount = Number(customCredits);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      // 1. Create order on backend
      const orderRes = await fetch(`${apiUrl}/billing/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: planType,
          credits: creditsCount,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || "Failed to create order");
      }

      const orderInfo = orderData.purchase?.order || orderData.order;
      const razorpayKey =
        orderData.purchase?.razorpayKey ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

      // 2. Open Razorpay Standard Checkout modal
      const options = {
        key: razorpayKey,
        amount: orderInfo.amount,
        currency: orderInfo.currency || "INR",
        name: "Kairo",
        description: `${summary.credits.toLocaleString()} Credits Top-up`,
        image: "/Kairo.png",
        order_id: orderInfo.id,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            setLoading(true);
            setPaymentStatus({
              type: "info",
              message: "Verifying payment signature...",
            });

            // 3. Verify payment signature on backend
            const verifyRes = await fetch(`${apiUrl}/billing/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.message || "Payment verification failed");
            }

            if (verifyData.newBalance !== undefined) {
              setCreditBalance(verifyData.newBalance);
            } else {
              setCreditBalance((prev) => prev + summary.credits);
            }

            setPaymentStatus({
              type: "success",
              message: `Payment successful! Added ${summary.credits.toLocaleString()} credits to your account.`,
            });
          } catch (verifyErr: any) {
            setPaymentStatus({
              type: "error",
              message: verifyErr?.message || "Payment verification failed",
            });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setPaymentStatus({
              type: "info",
              message: "Payment window closed by user",
            });
          },
        },
        theme: {
          color: "#2563EB",
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on("payment.failed", function (response: any) {
        setLoading(false);
        setPaymentStatus({
          type: "error",
          message: response.error?.description || "Payment failed",
        });
      });
      rzpInstance.open();
    } catch (err: any) {
      setLoading(false);
      setPaymentStatus({
        type: "error",
        message: err?.message || "Failed to initiate payment",
      });
    }
  };

  const calculateCustomPrice = (credits: number | "") => {
    if (!credits || credits <= 0) return 0;
    return Number((Number(credits) * 0.8).toFixed(2));
  };

  const getPurchaseSummary = () => {
    if (selectedPack === "custom") {
      const cr = customCredits ? Number(customCredits) : 0;
      const pr = calculateCustomPrice(customCredits);
      return {
        credits: cr,
        priceStr: pr > 0 ? `₹${pr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₹0.00",
        buttonText:
          cr > 0
            ? `Purchase ${cr.toLocaleString()} Credits • ₹${pr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "Enter custom amount",
        isValid: cr > 0,
      };
    }
    const pack = PRESET_PACKS.find((p) => p.id === selectedPack) || PRESET_PACKS[1];
    return {
      credits: pack.credits,
      priceStr: pack.formattedPrice,
      buttonText: `Purchase ${pack.credits.toLocaleString()} Credits • ${pack.formattedPrice}`,
      isValid: true,
    };
  };

  const summary = getPurchaseSummary();

  return (
    <div className="w-full h-full flex flex-col">
      {/* Page Header */}
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage your account credits, plan usage, and payment history.
        </p>
      </div>

      {/* Main Scrollable Canvas */}
      <div className="flex-1 border border-gray-200 rounded-2xl bg-white overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 flex flex-col">
          <div className="max-w-5xl mx-auto w-full flex flex-col gap-6 pb-6">

            {/* 1. Available Credits Card (Coins on right, Account Healthy and avg consumption below 649) */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex items-center justify-between flex-shrink-0">
              <div className="z-10 relative">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Available Credits</h2>
                <div className="text-5xl font-extrabold text-blue-600 my-2 font-sans tracking-tight">
                  {creditBalance.toLocaleString()}
                </div>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Account Healthy
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Average consumption: ~18 credits/day
                  </span>
                </div>
              </div>

              {/* Right-aligned coins as they were earlier */}
              <div className="absolute right-0 top-0 bottom-0 w-64 opacity-20 pointer-events-none flex items-center justify-end pr-8">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <Coins weight="duotone" className="w-48 h-48 text-blue-600 absolute -right-8" />
                </div>
              </div>
            </div>

            {/* 2. Purchase Credits Card */}
            <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex flex-col gap-5 flex-shrink-0">
              {/* Top-left clipped watermark icon */}
              <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-blue-600">
                <CreditCard weight="duotone" className="w-full h-full" />
              </div>

              <div className="z-10 relative pb-1 border-b border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Purchase Credits</h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                  Select the number of credits you want to purchase
                </p>
              </div>

              {/* 1. Disabled Free Tier Row on TOP of all */}
              <div className="z-10 relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-200/80 bg-gray-50/70 opacity-60 cursor-not-allowed select-none">
                <div className="flex items-center gap-3">
                  <Circle weight="regular" className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-700">
                      {FREE_TIER.name} - {FREE_TIER.creditsLabel}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                      Current Plan
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mt-2 sm:mt-0 ml-8 sm:ml-0">
                  <span className="text-[11px] text-gray-400 font-medium">{FREE_TIER.unitPrice}</span>
                  <span className="font-bold text-sm text-gray-500">{FREE_TIER.formattedPrice}</span>
                </div>
              </div>

              {/* 2. Three Square Boxes for Small, Medium, Large */}
              <div className="z-10 relative grid grid-cols-1 md:grid-cols-3 gap-4">
                {PRESET_PACKS.map((pack) => {
                  const isSelected = selectedPack === pack.id;
                  return (
                    <div
                      key={pack.id}
                      onClick={() => setSelectedPack(pack.id)}
                      className={`relative flex flex-col justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs"
                          : "border-gray-200/90 bg-white hover:border-gray-300 hover:shadow-xs"
                      }`}
                    >
                      {/* Optional Badge */}
                      {pack.badge && (
                        <div className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                          {pack.badge}
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            {pack.name}
                          </span>
                          {isSelected ? (
                            <CheckCircle weight="fill" className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          ) : (
                            <Circle weight="regular" className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          )}
                        </div>

                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                            {pack.credits.toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">credits</span>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-blue-600">{pack.formattedPrice}</span>
                          <span className="text-[11px] text-gray-400 font-medium">{pack.unitPrice}</span>
                        </div>
                        {pack.savings && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                            {pack.savings}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3. Custom Credits Row Underneath */}
              <div
                onClick={() => setSelectedPack("custom")}
                className={`z-10 relative flex flex-col p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  selectedPack === "custom"
                    ? "border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs"
                    : "border-gray-200/90 bg-white hover:border-gray-300 hover:shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {selectedPack === "custom" ? (
                      <CheckCircle weight="fill" className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <Circle weight="regular" className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-sm text-gray-900">Custom Credits</span>
                      <p className="text-xs text-gray-500 font-medium">
                        Top up any custom amount needed for your workflows at ₹0.80 / credit
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-blue-600 self-end sm:self-auto">
                    {selectedPack === "custom" && customCredits
                      ? `₹${calculateCustomPrice(customCredits).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "₹0.80 per credit"}
                  </span>
                </div>

                {selectedPack === "custom" && (
                  <div
                    className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="100"
                        step="100"
                        placeholder="Enter amount (e.g. 2,500)"
                        value={customCredits}
                        onChange={(e) =>
                          setCustomCredits(e.target.value ? Math.max(0, Number(e.target.value)) : "")
                        }
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                        credits
                      </span>
                    </div>

                    {/* Quick Stepper Chips */}
                    <div className="flex items-center gap-2">
                      {[1000, 2500, 5000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCustomCredits(amt)}
                          className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200/80 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                          +{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback Alert Banner */}
              {paymentStatus && (
                <div
                  className={`z-10 relative p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    paymentStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : paymentStatus.type === "error"
                      ? "bg-red-50 text-red-800 border border-red-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  <span>{paymentStatus.message}</span>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus(null)}
                    className="text-xs opacity-60 hover:opacity-100 ml-3 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Purchase Action Button */}
              <div className="z-10 relative pt-1">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={loading || !summary.isValid || summary.credits <= 0}
                  className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-xs cursor-pointer text-sm"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <CreditCard weight="fill" className="w-5 h-5" />
                      <span>{summary.buttonText}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Row: Consumed + Transaction History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-shrink-0">

              {/* 3. Credits Consumed Card (Top-Left Clipped Watermark Icon) */}
              <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex flex-col justify-between">
                {/* Top-left clipped watermark icon */}
                <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-blue-600">
                  <ChartBar weight="duotone" className="w-full h-full" />
                </div>

                <div className="z-10 relative mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Credits consumed</h2>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                    Daily credit consumed in the current month
                  </p>
                </div>

                <div className="z-10 relative flex-1 flex flex-col justify-end pt-4">
                  <div className="h-40 w-full flex items-end gap-1.5 px-1 border-b border-gray-100 pb-2">
                    {[45, 12, 60, 40, 25, 10, 70, 80, 5, 85, 30, 20, 70, 45, 55, 30, 20].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end gap-[1px] group relative h-full">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-md">
                          {val + 5} credits
                        </div>
                        <div
                          className="w-full bg-blue-200 rounded-t-sm transition-all group-hover:bg-blue-300"
                          style={{ height: `${val * 0.2}%` }}
                        />
                        <div
                          className="w-full bg-blue-500 rounded-b-sm transition-all group-hover:bg-blue-600"
                          style={{ height: `${val * 0.8}%` }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2 px-1 font-semibold tracking-wide">
                    <span>Oct 1</span>
                    <span>Oct 8</span>
                    <span>Oct 15</span>
                    <span>Oct 22</span>
                    <span>Oct 31</span>
                  </div>

                  <div className="flex justify-center items-center gap-4 mt-5 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                      <span className="text-[11px] font-bold text-gray-600">Successful</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-blue-200 rounded-sm" />
                      <span className="text-[11px] font-bold text-gray-600">Failed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Transaction History Card (Top-Left Clipped Watermark Icon) */}
              <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex flex-col">
                {/* Top-left clipped watermark icon */}
                <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-blue-600">
                  <Receipt weight="duotone" className="w-full h-full" />
                </div>

                <div className="z-10 relative flex items-center justify-between mb-1">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Transaction History</h2>
                </div>
                <p className="z-10 relative text-xs sm:text-sm text-gray-500 mb-5 font-medium">
                  Recent credit purchases and usage
                </p>

                <div className="z-10 relative flex-1 flex flex-col gap-2.5 overflow-y-auto no-scrollbar max-h-[260px]">
                  {historyLoading ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                      <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : history.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                      <Receipt weight="duotone" className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-xs font-semibold text-gray-600">No transaction history yet</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Purchases and credit usage will show up here.</p>
                    </div>
                  ) : (
                    history.map((tx: any, idx: number) => {
                      const isPositive = tx.amount > 0;
                      const formattedDate = tx.createdAt
                        ? new Date(tx.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recent";

                      return (
                        <div
                          key={tx.id || idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200/80 hover:border-gray-300 hover:shadow-2xs transition-all"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900">
                              {tx.type}
                            </span>
                            <span className="text-[11px] font-medium text-gray-400">{formattedDate}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span
                              className={`text-xs font-bold ${
                                isPositive ? "text-emerald-600" : "text-gray-900"
                              }`}
                            >
                              {isPositive ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                            </span>
                            <span className="text-[11px] font-medium text-gray-400">
                              Balance: {tx.balanceAfter?.toLocaleString() ?? "—"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
