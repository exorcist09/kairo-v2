"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Coins,
  ChartBar,
  CreditCard,
  CheckCircle,
  Circle,
  Receipt,
} from "@phosphor-icons/react";
import { useBillingStore } from "@/zusstore/billing.store";
import { BillingSkeleton } from "@/shared/Skeleton";

function useAnimatedCounter(targetValue: number, duration: number = 1000) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const prevValueRef = useRef(targetValue);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const startValue = prevValueRef.current;
    if (startValue === targetValue) {
      setDisplayValue(targetValue);
      return;
    }

    prevValueRef.current = targetValue;
    setIsAnimating(true);
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (targetValue - startValue) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplayValue(targetValue);
        setIsAnimating(false);
      }
    };

    const handle = requestAnimationFrame(update);
    return () => cancelAnimationFrame(handle);
  }, [targetValue, duration]);

  return { displayValue, isAnimating };
}

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
  const {
    balance,
    plans,
    history,
    loading,
    hasLoaded,
    fetchBillingData,
    setBalance,
    addBalance,
  } = useBillingStore();

  const [selectedPack, setSelectedPack] = useState("medium");
  const [customCredits, setCustomCredits] = useState<number | "">("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const { displayValue: animatedBalance, isAnimating: isBalanceCounting } =
    useAnimatedCounter(balance, 1200);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  // Dynamic Free Tier from DB plans
  const freeTier = useMemo(() => {
    const found = plans.find((p) => p.type === "FREE_TIER");
    const cr = found?.credits ?? 50;
    return {
      name: "Free Tier",
      credits: cr,
      creditsLabel: `${cr.toLocaleString()} credits / month`,
      formattedPrice: "Free",
      unitPrice: "Included with account",
    };
  }, [plans]);

  // Dynamic Preset Packs from DB plans
  const presetPacks = useMemo(() => {
    const small = plans.find((p) => p.type === "SMALL");
    const medium = plans.find((p) => p.type === "MEDIUM");
    const large = plans.find((p) => p.type === "LARGE");

    const sCredits = small?.credits ?? 100;
    const sPrice = Number(small?.price ?? 99);

    const mCredits = medium?.credits ?? 500;
    const mPrice = Number(medium?.price ?? 299);

    const lCredits = large?.credits ?? 1200;
    const lPrice = Number(large?.price ?? 499);

    return [
      {
        id: "small",
        backendType: "SMALL" as const,
        name: "Small Tier",
        credits: sCredits,
        price: sPrice,
        formattedPrice: `₹${sPrice.toLocaleString("en-IN")}`,
        unitPrice: `₹${(sPrice / sCredits).toFixed(2)} / credit`,
      },
      {
        id: "medium",
        backendType: "MEDIUM" as const,
        name: "Medium Tier",
        credits: mCredits,
        price: mPrice,
        formattedPrice: `₹${mPrice.toLocaleString("en-IN")}`,
        unitPrice: `₹${(mPrice / mCredits).toFixed(2)} / credit`,
        badge: "Most Popular",
        savings: "Best Value",
      },
      {
        id: "large",
        backendType: "LARGE" as const,
        name: "Large Tier",
        credits: lCredits,
        price: lPrice,
        formattedPrice: `₹${lPrice.toLocaleString("en-IN")}`,
        unitPrice: `₹${(lPrice / lCredits).toFixed(2)} / credit`,
        savings: "Save More",
      },
    ];
  }, [plans]);

  // Dynamic Custom Plan Config from DB
  const customConfig = useMemo(() => {
    const custom = plans.find((p) => p.type === "CUSTOM");
    return {
      minCredits: custom?.minCredits ?? 100,
      maxCredits: custom?.maxCredits ?? 10000,
      pricePerCredit: Number(custom?.pricePerCredit ?? 0.4),
    };
  }, [plans]);

  const calculateCustomPrice = (credits: number | "") => {
    if (!credits || credits <= 0) return 0;
    return Number((Number(credits) * customConfig.pricePerCredit).toFixed(2));
  };

  const getPurchaseSummary = () => {
    if (selectedPack === "custom") {
      const cr = customCredits ? Number(customCredits) : 0;
      const pr = calculateCustomPrice(customCredits);
      const isWithinLimits =
        cr >= customConfig.minCredits && cr <= customConfig.maxCredits;

      return {
        credits: cr,
        priceStr:
          pr > 0
            ? `₹${pr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "₹0.00",
        buttonText:
          cr <= 0
            ? "Enter custom credit amount"
            : cr < customConfig.minCredits
            ? `Minimum ${customConfig.minCredits} credits required`
            : cr > customConfig.maxCredits
            ? `Maximum ${customConfig.maxCredits.toLocaleString()} credits allowed`
            : `Purchase ${cr.toLocaleString()} Credits • ₹${pr.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        isValid: isWithinLimits,
      };
    }

    const pack = presetPacks.find((p) => p.id === selectedPack) || presetPacks[1];
    return {
      credits: pack.credits,
      priceStr: pack.formattedPrice,
      buttonText: `Purchase ${pack.credits.toLocaleString()} Credits • ${pack.formattedPrice}`,
      isValid: true,
    };
  };

  const summary = getPurchaseSummary();

  // Consumed credits extraction from real history
  const usageEntries = useMemo(() => {
    return history.filter((tx: any) => tx.type === "USAGE");
  }, [history]);

  const totalCreditsConsumed = useMemo(() => {
    return Math.abs(
      usageEntries.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0)
    );
  }, [usageEntries]);

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
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
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

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
            setCheckoutLoading(true);
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
              setBalance(verifyData.newBalance);
            } else {
              addBalance(summary.credits);
            }

            // Refresh full ledger and state
            fetchBillingData(true);

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
            setCheckoutLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setCheckoutLoading(false);
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
        setCheckoutLoading(false);
        setPaymentStatus({
          type: "error",
          message: response.error?.description || "Payment failed",
        });
      });
      rzpInstance.open();
    } catch (err: any) {
      setCheckoutLoading(false);
      setPaymentStatus({
        type: "error",
        message: err?.message || "Failed to initiate payment",
      });
    }
  };

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
          {loading && !hasLoaded ? (
            <BillingSkeleton />
          ) : (
            <div className="max-w-5xl mx-auto w-full flex flex-col gap-6 pb-6">
              {/* 1. Available Credits Card */}
              <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex items-center justify-between flex-shrink-0">
                <div className="z-10 relative">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Available Credits</h2>
                  <div
                    className={`text-5xl font-extrabold my-2 font-sans tracking-tight transition-all duration-300 ${
                      isBalanceCounting ? "text-emerald-600 scale-105" : "text-blue-600"
                    }`}
                  >
                    {animatedBalance.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Account Healthy
                    </span>
                  </div>
                </div>

                {/* Right-aligned coins illustration */}
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

                {/* 1. Disabled Free Tier Row */}
                <div className="z-10 relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-200/80 bg-gray-50/70 opacity-60 cursor-not-allowed select-none">
                  <div className="flex items-center gap-3">
                    <Circle weight="regular" className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-700">
                        {freeTier.name} - {freeTier.creditsLabel}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                        Current Free Plan
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mt-2 sm:mt-0 ml-8 sm:ml-0">
                    <span className="text-[11px] text-gray-400 font-medium">{freeTier.unitPrice}</span>
                    <span className="font-bold text-sm text-gray-500">{freeTier.formattedPrice}</span>
                  </div>
                </div>

                {/* 2. Three Square Boxes for Small, Medium, Large */}
                <div className="z-10 relative grid grid-cols-1 md:grid-cols-3 gap-4">
                  {presetPacks.map((pack) => {
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
                          Top up any custom amount from {customConfig.minCredits.toLocaleString()} to {customConfig.maxCredits.toLocaleString()} credits at ₹{customConfig.pricePerCredit.toFixed(2)} / credit
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-bold text-blue-600 self-end sm:self-auto">
                      {selectedPack === "custom" && customCredits
                        ? `₹${calculateCustomPrice(customCredits).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : `₹${customConfig.pricePerCredit.toFixed(2)} per credit`}
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
                          min={customConfig.minCredits}
                          max={customConfig.maxCredits}
                          step="100"
                          placeholder={`Enter amount (${customConfig.minCredits} - ${customConfig.maxCredits.toLocaleString()})`}
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
                        {[250, 500, 1000, 2500].map((amt) => (
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
                    disabled={checkoutLoading || !summary.isValid || summary.credits <= 0}
                    className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-xs cursor-pointer text-sm"
                  >
                    {checkoutLoading ? (
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
                {/* 3. Credits Consumed Card */}
                <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex flex-col justify-between min-h-[300px]">
                  {/* Top-left clipped watermark icon */}
                  <div className="absolute -top-7 -left-7 w-28 h-28 opacity-10 pointer-events-none text-blue-600">
                    <ChartBar weight="duotone" className="w-full h-full" />
                  </div>

                  <div className="z-10 relative mb-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900">Credits Consumed</h2>
                      {totalCreditsConsumed > 0 && (
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                          Total: {totalCreditsConsumed.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                      Credit consumed across workflow execution runs
                    </p>
                  </div>

                  {usageEntries.length === 0 ? (
                    <div className="z-10 relative flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <ChartBar weight="duotone" className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">No credits consumed yet</span>
                      <span className="text-xs text-gray-400 mt-1 max-w-xs">
                        Credits consumed during workflow executions will be tracked and displayed here.
                      </span>
                    </div>
                  ) : (
                    <div className="z-10 relative flex-1 flex flex-col justify-end pt-4">
                      <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar max-h-[180px]">
                        {usageEntries.map((u: any, i: number) => (
                          <div
                            key={u.id || i}
                            className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-200/60"
                          >
                            <span className="text-xs font-semibold text-gray-800">
                              Workflow Execution
                            </span>
                            <span className="text-xs font-bold text-red-600">
                              -{Math.abs(u.amount).toLocaleString()} credits
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Transaction History Card */}
                <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs flex flex-col min-h-[300px]">
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

                  <div className="z-10 relative flex-1 flex flex-col gap-2.5 overflow-y-auto no-scrollbar max-h-[220px]">
                    {history.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
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
          )}
        </div>
      </div>
    </div>
  );
}
