import React from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface PricingPageProps {
  setView: (view: any) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black mb-6 tracking-tighter">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-500 font-medium">Choose the plan that fits your bidding volume.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Starter", price: "Free", features: ["1 Scan / Month", "Basic Eligibility Score", "Community Support"], btn: "Current Plan", primary: false },
            { name: "Professional", price: "৳999", period: "/mo", features: ["Unlimited Scans", "Full SOP Generation", "PPR 2025 Clause Analysis", "Priority Q&A Support"], btn: "Get Started", primary: true },
            { name: "Enterprise", price: "Custom", features: ["Multi-user Access", "API Integration", "Custom STD Training", "Dedicated Consultant"], btn: "Contact Sales", primary: false }
          ].map((plan, i) => (
            <div key={i} className={cn(
              "p-10 rounded-[3rem] border flex flex-col transition-all",
              plan.primary 
                ? "bg-white border-blue-600 shadow-2xl shadow-blue-100 scale-105 z-10" 
                : "bg-white border-slate-200 hover:border-slate-300"
            )}>
              <h3 className="text-2xl font-black mb-3 tracking-tight">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-10">
                <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                {plan.period && <span className="text-slate-400 font-bold">{plan.period}</span>}
              </div>
              <ul className="space-y-5 mb-12 flex-grow">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-4 text-slate-600 font-medium">
                    <CheckCircle2 className="text-green-500 w-6 h-6 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => setView('dashboard')}
                className={cn(
                  "w-full py-5 rounded-2xl font-black text-lg transition-all shadow-lg",
                  plan.primary 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100" 
                    : "bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-slate-100"
                )}
              >
                {plan.btn}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <button onClick={() => setView('landing')} className="text-blue-600 font-black flex items-center justify-center gap-2 mx-auto hover:gap-4 transition-all">
            <Search className="w-5 h-5 rotate-180" /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
