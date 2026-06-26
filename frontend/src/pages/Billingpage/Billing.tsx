"use client";

import { useState } from "react";
import { Coins, ChartBar, CreditCard, CheckCircle, Circle, Receipt } from "@phosphor-icons/react";

export default function Billing() {
  const [selectedPack, setSelectedPack] = useState("medium");
  const [customCredits, setCustomCredits] = useState<number | "">("");

  const calculateCustomPrice = (credits: number | "") => {
    if (!credits) return 0;
    return (credits * 0.8).toFixed(2); // 1 credit = ₹0.80
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex-shrink-0">Billing</h1>
      
      {/* Outer Bordered Container */}
      <div className="flex-1 border border-gray-200 rounded-2xl bg-gray-50 overflow-y-auto p-6 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Centered Content Wrapper */}
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-6 pb-4">
        {/* Available Credits Card */}
        <div className="relative overflow-hidden border border-blue-100 bg-blue-50/50 rounded-2xl p-6 md:p-8 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="z-10 relative">
            <h2 className="text-lg font-bold text-gray-900">Available Credits</h2>
            <div className="text-5xl font-bold text-blue-600 my-3 font-sans tracking-tight">649</div>
            <p className="text-sm text-gray-500 font-medium">When your credit balance reaches zero, your workflows will stop working</p>
          </div>
          
          <div className="absolute right-0 top-0 bottom-0 w-64 opacity-20 pointer-events-none flex items-center justify-end pr-8">
            <div className="relative w-32 h-32 flex items-center justify-center">
               <Coins weight="duotone" className="w-48 h-48 text-blue-600 absolute -right-8" />
            </div>
          </div>
        </div>

        {/* Purchase Credits Card */}
        <div className="border border-gray-200 bg-white rounded-2xl p-6 md:p-8 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Coins weight="bold" className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Purchase Credits</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6 font-medium">Select the number of credits you want to purchase</p>
          
          <div className="flex flex-col gap-3 mb-6">
            {/* Small Pack */}
            <div 
              onClick={() => setSelectedPack("small")}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedPack === 'small' ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}
            >
              <div className="flex items-center gap-3">
                {selectedPack === 'small' ? <CheckCircle weight="fill" className="w-5 h-5 text-blue-600" /> : <Circle weight="regular" className="w-5 h-5 text-gray-300" />}
                <span className="font-semibold text-sm text-gray-800">Small Pack - 1,000 credits</span>
              </div>
              <span className="font-bold text-sm text-blue-600">₹799.00</span>
            </div>

            {/* Medium Pack */}
            <div 
              onClick={() => setSelectedPack("medium")}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedPack === 'medium' ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}
            >
              <div className="flex items-center gap-3">
                {selectedPack === 'medium' ? <CheckCircle weight="fill" className="w-5 h-5 text-blue-600" /> : <Circle weight="regular" className="w-5 h-5 text-gray-300" />}
                <span className="font-semibold text-sm text-gray-800">Medium Pack - 5,000 credits</span>
              </div>
              <span className="font-bold text-sm text-blue-600">₹3,199.00</span>
            </div>

            {/* Large Pack */}
            <div 
              onClick={() => setSelectedPack("large")}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedPack === 'large' ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}
            >
              <div className="flex items-center gap-3">
                {selectedPack === 'large' ? <CheckCircle weight="fill" className="w-5 h-5 text-blue-600" /> : <Circle weight="regular" className="w-5 h-5 text-gray-300" />}
                <span className="font-semibold text-sm text-gray-800">Large Pack - 10,000 credits</span>
              </div>
              <span className="font-bold text-sm text-blue-600">₹5,599.00</span>
            </div>

            {/* Custom Pack */}
            <div 
              onClick={() => setSelectedPack("custom")}
              className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${selectedPack === 'custom' ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedPack === 'custom' ? <CheckCircle weight="fill" className="w-5 h-5 text-blue-600" /> : <Circle weight="regular" className="w-5 h-5 text-gray-300" />}
                  <span className="font-semibold text-sm text-gray-800">Custom Credits</span>
                </div>
                <span className="font-bold text-sm text-blue-600">
                  {selectedPack === 'custom' ? `₹${calculateCustomPrice(customCredits)}` : 'Custom Amount'}
                </span>
              </div>
              
              {selectedPack === "custom" && (
                <div className="mt-4 ml-8 flex items-center gap-3" onClick={e => e.stopPropagation()}>
                  <input 
                    type="number"
                    min="1"
                    placeholder="Enter credits..."
                    value={customCredits}
                    onChange={(e) => setCustomCredits(e.target.value ? Number(e.target.value) : "")}
                    className="flex-1 bg-white border border-blue-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <span className="text-sm font-medium text-gray-500 whitespace-nowrap">credits</span>
                </div>
              )}
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            <CreditCard weight="fill" className="w-5 h-5" />
            Purchase credits
          </button>
        </div>

        {/* Bottom Row: Consumed + History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-shrink-0">
          
          {/* Credits Consumed Card */}
          <div className="border border-gray-200 bg-white rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <ChartBar weight="bold" className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Credits consumed</h2>
            </div>
            <p className="text-sm text-gray-500 mb-8 font-medium">Daily credit consumed in the current month</p>
            
            <div className="flex-1 flex flex-col justify-end">
              <div className="h-40 w-full flex items-end gap-1.5 px-1 border-b border-gray-100 pb-2">
                {[45, 12, 60, 40, 25, 10, 70, 80, 5, 85, 30, 20, 70, 45, 55, 30, 20].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-[1px] group relative h-full">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
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

              <div className="flex justify-center items-center gap-4 mt-6 flex-wrap">
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

          {/* Transaction History Card */}
          <div className="border border-gray-200 bg-white rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Receipt weight="bold" className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
              </div>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">View all</button>
            </div>
            <p className="text-sm text-gray-500 mb-6 font-medium">Recent credit purchases and usage</p>
            
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
              {[
                { type: "Purchase", pack: "Medium Pack", amount: "+5,000", cost: "₹3,199.00", date: "Oct 24, 2026", status: "success" },
                { type: "Usage", pack: "Data Scrape Workflow", amount: "-120", cost: "", date: "Oct 22, 2026", status: "success" },
                { type: "Usage", pack: "Email Campaign", amount: "-450", cost: "", date: "Oct 18, 2026", status: "success" },
                { type: "Purchase", pack: "Small Pack", amount: "+1,000", cost: "₹799.00", date: "Oct 12, 2026", status: "success" },
                { type: "Usage", pack: "Failed Webhook", amount: "-5", cost: "", date: "Oct 10, 2026", status: "failed" },
              ].map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">{tx.type} • {tx.pack}</span>
                    <span className="text-xs font-medium text-gray-500">{tx.date}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'}`}>{tx.amount}</span>
                    {tx.cost && <span className="text-xs font-medium text-gray-500">{tx.cost}</span>}
                    {tx.status === 'failed' && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 mt-0.5 rounded">Failed</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
        </div>
      </div>
    </div>
  );
}
