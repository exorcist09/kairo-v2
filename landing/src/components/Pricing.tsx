import React, { useState } from 'react';
import { Check, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PricingPlan } from '../types';

function AnimatedPrice({ value }: { value: number }) {
  return (
    <div className="h-[44px] overflow-hidden relative flex items-baseline justify-start select-none">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 22, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -22, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="text-3xl md:text-4xl font-extrabold text-white font-display inline-block"
        >
          ₹{value.toLocaleString('en-IN')}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>('pro');
  const [successPaidMessage, setSuccessPaidMessage] = useState<string | null>(null);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Developer Basic',
      description: 'Perfect for prototyping, testing stateful flows, and mapping local AI node systems.',
      priceMonthly: 0,
      priceAnnually: 0,
      features: [
        '3 Active production pipelines',
        'Unlimited local canvas simulation',
        'Standard execution rate limits (60/min)',
        'Built-in REST API & Formatter nodes',
        'Standard Discord community support',
        '1-Day retention of historical runs'
      ],
      ctaText: 'Start for Free'
    },
    {
      id: 'pro',
      name: 'Developer Pro',
      description: 'Ideal for professional engineers automating core production tasks & integrating smart tools.',
      priceMonthly: 1800,
      priceAnnually: 1500,
      features: [
        'Unlimited active execution pipelines',
        'Priority high-throughput model queues',
        'Custom Webhooks & Cron Timers (up to 1/sec)',
        'Full Server-Side Gemini API node access',
        'Stateful branch nodes and loops',
        '30-Day retention of run data & full payloads',
        'Team scopes & credentials locker',
        '24/7 Fast-track ticket priority'
      ],
      ctaText: 'Upgrade to Pro',
      isPopular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Scale',
      description: 'Custom compliance, dedicated compute clusters, self-hosting options, and strict SLAs.',
      priceMonthly: 3000,
      priceAnnually: 2300,
      features: [
        'Dedicated isolated sandbox execution',
        'Sub-second latency execution tunnels',
        'Private bespoke custom node builders',
        'Custom VPC configuration and safe lists',
        'Custom Single Sign-On (SSO / SAML)',
        'Unlimited historical payload log duration',
        '99.99% Guaranteed service level SLA',
        'Bespoke Slack channel engineering support'
      ],
      ctaText: 'Contact Sales'
    }
  ];

  const handleCtaClick = (planName: string) => {
    setSuccessPaidMessage(`Successfully selected ${planName}! Thank you for choosing Kairo.`);
    setTimeout(() => {
      setSuccessPaidMessage(null);
    }, 4500);
  };

  return (
    <div className="w-full relative py-4 select-none">
      {/* Background glow in pricing */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full glow-blur pointer-events-none z-0" />

      {/* Header and Toggle */}
      <div className="text-center relative z-10 max-w-2xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/40 border border-indigo-900/30 rounded-full text-xs font-mono font-bold text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          PRICING PLANS
        </div>
        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-display">
          Simple, project-level pricing
        </h3>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          Scale effortlessly as your automations grow. Save over 20% on our developer-centric tiers with annual billing.
        </p>

        {/* Toggle Switch */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <span className={`text-xs font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-zinc-500'}`}>
            Monthly
          </span>
          <button
            id="billing-frequency-toggle"
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-11 h-6 rounded-full bg-zinc-800 p-0.5 transition-colors focus:outline-none relative cursor-pointer hover:bg-zinc-700"
            role="switch"
            aria-checked={isAnnual}
          >
            <div
              className={`w-5 h-5 rounded-full bg-indigo-500 shadow-md transform transition-transform duration-200 ${
                isAnnual ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-medium transition-colors ${isAnnual ? 'text-white' : 'text-zinc-500'} flex items-center gap-1.5`}>
            Annually
            {/* <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded">
              Save 24%
            </span> */}
          </span>
        </div>
      </div>

      {/* Mock payment alert message */}
      {successPaidMessage && (
        <div className="max-w-xl mx-auto mb-6 bg-emerald-950/80 border border-emerald-800/60 p-4 rounded-xl flex items-center gap-3 text-emerald-300 text-xs font-medium relative z-10 shadow-lg animate-pulse-ring">
          <Check className="w-4 h-4 shrink-0 bg-emerald-600 text-white rounded-full p-0.5" />
          <span>{successPaidMessage}</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 max-w-6xl mx-auto items-stretch">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const displayPrice = isAnnual ? plan.priceAnnually : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              id={`pricing-tier-${plan.id}`}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`rounded-2xl border bg-zinc-950/80 p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer relative ${
                plan.isPopular 
                  ? 'border-indigo-500 bg-gradient-to-b from-[#0e0f11]/90 to-zinc-950/80 shadow-2xl shadow-indigo-500/5' 
                  : 'border-gray-800 hover:border-zinc-700 hover:bg-zinc-900/40'
              }`}
            >
              {/* Highlight badge for popular plan */}
              {plan.isPopular && (
                <div className="absolute border border-indigo-500 top-0 right-1/2 translate-y-[-50%] translate-x-[50%] px-3 py-1 bg-indigo-600  rounded-full text-white text-[10px] font-extrabold tracking-wider uppercase shadow-xl shadow-indigo-500/20">
                  Most Popular
                </div>
              )}

              {/* Title & Price header */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-lg text-white font-display tracking-tight flex items-center justify-between">
                    {plan.name}
                    {plan.priceMonthly === 0 && (
                      <span className="text-[10px] font-mono tracking-wider font-semibold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        FREE
                      </span>
                    )}
                  </h4>
                  <p className="text-zinc-400 text-xs leading-relaxed min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                {/* Pricing Indicator */}
                <div className="py-4 border-b border-zinc-900 flex items-center gap-1.5 min-h-[56px] overflow-hidden">
                  <AnimatedPrice value={displayPrice} />
                  <span className="text-zinc-500 text-xs self-end pb-1 inline-block">
                    / month
                  </span>
                  {isAnnual && plan.priceAnnually > 0 && (
                    <span className="text-[10px] text-zinc-500 font-medium block ml-auto self-end pb-1">
                      Billed annually
                    </span>
                  )}
                </div>

                {/* Features Checklist */}
                <div className="pt-4 space-y-3">
                  <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                    Features Included
                  </h5>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-zinc-300 text-xs leading-tight">
                        <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA trigger */}
              <div className="pt-8">
                <button
                  id={`pricing-cta-${plan.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCtaClick(plan.name);
                  }}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${
                    plan.isPopular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/10'
                      : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-200'
                  }`}
                >
                  {plan.ctaText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
