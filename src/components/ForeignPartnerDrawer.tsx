import React from 'react';
import { X, DollarSign, ShieldAlert, Handshake } from 'lucide-react';
import { cn } from '../lib/utils';
import { ForeignPartnerInsights } from '../services/foreignPartnerService';

interface ForeignPartnerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'bn';
  insights?: ForeignPartnerInsights | null;
}

export function ForeignPartnerDrawer({ isOpen, onClose, lang, insights }: ForeignPartnerDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-blue-50">
            {lang === 'bn' ? 'বিদেশী অংশীদার দৃষ্টিকোণ' : 'Foreign Partner Perspective'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Financial Intelligence */}
          <section>
            <div className="flex items-center space-x-2 mb-4 text-blue-400">
              <DollarSign className="w-5 h-5" />
              <h3 className="text-lg font-medium">
                {lang === 'bn' ? 'আর্থিক বুদ্ধিমত্তা' : 'Financial Intelligence'}
              </h3>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 space-y-3 border border-slate-700">
              {!insights ? (
                <p className="text-sm text-slate-300">
                  {lang === 'bn' ? 'টেন্ডার বিশ্লেষণের জন্য অপেক্ষা করা হচ্ছে...' : 'Awaiting tender analysis...'}
                </p>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Exchange Rate:</span>
                    <span className="font-medium">1 USD = {insights.financials.exchangeRate} BDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Estimated Value:</span>
                    <span className="font-medium">${insights.financials.valueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">VAT & AIT:</span>
                    <span className="font-medium text-red-400">-${(insights.financials.vatAmountUSD + insights.financials.aitAmountUSD).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Local Agency Fee (5%):</span>
                    <span className="font-medium text-red-400">-${insights.financials.localAgencyFeeUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="h-px bg-slate-700 my-2"></div>
                  <div className="flex justify-between text-sm text-green-400 font-medium">
                    <span>Net Repatriable Profit:</span>
                    <span>${insights.financials.netRepatriableProfitUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                  {insights.financials.sltThresholdUSD && (
                    <div className="mt-3 p-3 bg-red-900/30 border border-red-800 rounded text-xs text-red-200">
                      <strong>SLT Warning:</strong> Bidding below ${insights.financials.sltThresholdUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} (10% below estimate) may trigger Significantly Low Tender penalties.
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* JV Compatibility */}
          <section>
            <div className="flex items-center space-x-2 mb-4 text-blue-400">
              <Handshake className="w-5 h-5" />
              <h3 className="text-lg font-medium">
                {lang === 'bn' ? 'জেভি সামঞ্জস্যতা' : 'JV Compatibility'}
              </h3>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              {!insights ? (
                <p className="text-sm text-slate-300">
                  {lang === 'bn' ? 'সামঞ্জস্যতা স্কোর এবং সমন্বয় গণনা করতে টেন্ডার বিশ্লেষণের জন্য অপেক্ষা করা হচ্ছে।' : 'Awaiting tender analysis to calculate compatibility score and synergy.'}
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center text-xl font-bold text-blue-400">
                      {insights.jvCompatibility.score}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${insights.jvCompatibility.score}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Compatibility Score</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {insights.jvCompatibility.synergyAnalysis}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Compliance Alerts */}
          <section>
            <div className="flex items-center space-x-2 mb-4 text-blue-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-lg font-medium">
                {lang === 'bn' ? 'কমপ্লায়েন্স অ্যালার্ট' : 'Compliance Alerts'}
              </h3>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              {!insights ? (
                <p className="text-sm text-slate-300">
                  {lang === 'bn' ? 'আন্তর্জাতিক দরদাতাদের জন্য PPR 2025 ক্লজগুলির জন্য টেন্ডার বিশ্লেষণের অপেক্ষা করা হচ্ছে।' : 'Awaiting tender analysis for PPR 2025 international bidder clauses.'}
                </p>
              ) : (
                <ul className="space-y-3">
                  {insights.complianceAlerts.map((alert, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-slate-300 bg-slate-900/50 p-3 rounded border border-slate-700/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
          
          {/* Strategic Advice */}
          {insights && (
            <section>
              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800/50">
                <h4 className="text-sm font-bold text-blue-400 mb-2">Strategic Advice</h4>
                <p className="text-sm text-blue-100/80 leading-relaxed">
                  {insights.strategicAdvice}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
