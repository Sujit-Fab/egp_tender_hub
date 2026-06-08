import React from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Download, Printer, CheckCircle2, XCircle, Gavel, Check, X, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import type { AnalysisResult } from '../services/tenderService';

/**
 * AnalysisReport
 * ------------------------------------------------------------------
 * Self-contained, styled Tender Eligibility Analysis report.
 * It renders the same markup that previously lived inline in App.tsx,
 * driven entirely by the data you already have (`result` + `info`).
 *
 * Integration (3 steps):
 *   1) Place this file at: src/components/AnalysisReport.tsx
 *   2) In App.tsx, where the old report block used to render, do:
 *        import AnalysisReport from './components/AnalysisReport';
 *        ...
 *        return <AnalysisReport result={result} info={info} lang={lang} onUpdateProfile={() => setView('profile')} />;
 *      (Keep your existing `info` computation in App.tsx and pass it in.)
 *   3) Make sure src/index.css has the @theme color tokens and the
 *      @media print block (same ones already in your styled index.css).
 *
 * NOTE: The Gemini / data logic is untouched — this is presentation only.
 */

export interface ReportInfo {
  tenderId: string;
  refAndDate: string;
  procuringEntity: string;
  brief: string;
  closing: string;
  security: string;
}

interface Props {
  result: AnalysisResult;
  /** Optional tender meta box. If omitted, the meta box is hidden. */
  info?: ReportInfo;
  lang: 'en' | 'bn';
  /** Optional: called when the "Update Profile" link is clicked (hidden in print). */
  onUpdateProfile?: () => void;
}

const AnalysisReport: React.FC<Props> = ({ result, info, lang, onUpdateProfile }) => {
  const isClauseSatisfied = (clauseText: string) => {
    const lowerClause = clauseText.toLowerCase();
    const failedItems = (result.companyMatch || []).filter(
      (m: any) => m.met === false || m.met === 'data-needed'
    );
    for (const item of failedItems) {
      const reqLower = item.requirement.toLowerCase();
      const keywords = ['experience', 'similar', 'liquid', 'turnover', 'capacity', 'authorization', 'license', 'tin', 'vat', 'personnel', 'equipment'];
      for (const kw of keywords) {
        if (reqLower.includes(kw) && lowerClause.includes(kw)) {
          return false;
        }
      }
    }
    return true;
  };

  const isEligible = !(result.eligibilityLabel === 'Not Eligible' || (!result.eligibilityLabel && result.score < 50));

  const handlePrint = async () => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      await document.fonts.ready;
    }
    window.print();
  };

  return (
    <motion.div
      key="result"
      id="analysisReport"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 print-container"
    >
      {/* Action bar (hidden in print) */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm no-print transition-colors duration-300">
        <h2 className="text-xl font-bold dark:text-white">Analysis Report</h2>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-colors">
            <Download className="w-4 h-4" />
            {lang === 'bn' ? 'ডাউনলোড' : 'Download PDF'}
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-colors">
            <Printer className="w-4 h-4" />
            {lang === 'bn' ? 'প্রিন্ট করুন' : 'Print Report'}
          </button>
        </div>
      </div>

      {/* Title & Light Info Box */}
      <div className="space-y-4 print-avoid-break">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-2xl font-extrabold text-headings-navy dark:text-blue-400 tracking-tight">
            {lang === 'bn' ? 'Tender Eligibility Analysis / দরপত্র যোগ্যতা বিশ্লেষণ' : 'Tender Eligibility Analysis'}
          </h1>
          <p className="text-xs font-semibold text-accent-blue mt-1">
            {lang === 'bn' ? 'পিপিআর ২০২৫ এবং এসটিডি গাইডলাইন পর্যালোচনা রিপোর্ট' : 'PPR 2025 & STD Clause-by-Clause Evaluation Report'}
          </p>
        </div>

        {info && (
        <div className="bg-[#f2f7fa] dark:bg-slate-900/60 p-5 rounded-2xl border border-sky-100/60 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Tender ID / দরপত্র আইডি</span>
              <p className="font-extrabold text-headings-navy dark:text-blue-300 text-sm">#{info.tenderId}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Ref + Date / রেফারেন্স ও তারিখ</span>
              <p className="font-extrabold text-headings-navy dark:text-slate-200 text-sm">{info.refAndDate}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Procuring Entity / ক্রয়কারী প্রতিষ্ঠান</span>
              <p className="font-extrabold text-headings-navy dark:text-slate-200 text-sm">{info.procuringEntity}</p>
            </div>
            <div className="space-y-0.5 lg:col-span-2">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Brief / সংক্ষিপ্ত তথ্য</span>
              <p className="font-medium text-headings-navy dark:text-slate-200 text-sm">{info.brief}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Closing / বন্ধের সময়</span>
              <p className="font-extrabold text-slate-700 dark:text-slate-200 text-sm">{info.closing}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Tender Security / দরপত্র জামানত</span>
              <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{info.security}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-fail-red" />
              <span className="text-xs font-black text-fail-red uppercase tracking-wider">
                {lang === 'bn' ? 'যৌথ উদ্যোগ (ITT 17.1): অনুমোদিত নয়' : 'Joint Venture (ITT 17.1): Not allowed'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">PPR 2025 compliant</span>
          </div>
        </div>
        )}
      </div>

      {/* Two Cards Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-avoid-break">
        {/* Eligibility Score Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
          <span className="text-[11px] font-black text-headings-navy dark:text-slate-400 uppercase tracking-widest mb-1.5 block">
            {lang === 'bn' ? 'যোগ্যতার স্কোর' : 'ELIGIBILITY SCORE'}
          </span>
          <div className="flex items-baseline justify-center">
            <span className={cn('text-5xl font-black tracking-tight', isEligible ? 'text-pass-green' : 'text-fail-red')}>
              {result.score}
            </span>
            <span className="text-xl font-bold text-slate-400 dark:text-slate-500 ml-0.5">/100</span>
          </div>
          <div className={cn(
            'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm mt-3',
            isEligible ? 'bg-pass-green/10 text-pass-green border border-pass-green/20' : 'bg-fail-red/10 text-fail-red border border-fail-red/20'
          )}>
            {isEligible ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-pass-green" />
                <span>{lang === 'bn' ? 'যোগ্য / Eligible' : 'Eligible'}</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-fail-red" />
                <span>{lang === 'bn' ? 'অযোগ্য / Not Eligible' : 'Not Eligible / অযোগ্য'}</span>
              </>
            )}
          </div>
        </div>

        {/* STD Identification Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <Gavel className="w-4 h-4 text-accent-blue" />
              <span className="text-[11px] font-black text-headings-navy dark:text-slate-400 uppercase tracking-widest">
                {lang === 'bn' ? 'প্রমাণ দলিল সনাক্তকরণ' : 'STD IDENTIFICATION'}
              </span>
            </div>
            <div className="py-3">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block mb-0.5">
                {lang === 'bn' ? 'প্রাসঙ্গিক প্রমাণ দলিল:' : 'Relevant Document:'}
              </span>
              <p className="text-xl font-extrabold text-accent-blue tracking-tight">{result.stdUsed || 'e-PW2A'}</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
            {lang === 'bn'
              ? 'উৎস নথিপত্র এবং সরকারি আর্থিক সীমার উপর ভিত্তি করে মূল্যায়ন করা হয়েছে।'
              : 'Identified standard tender document aligned under standard PPR limits.'}
          </p>
        </div>
      </div>

      {/* Company Profile Match Section */}
      {result.companyMatch && result.companyMatch.length > 0 && (
        <div className="space-y-4 print-avoid-break">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
            <h3 className="font-extrabold text-base text-headings-navy dark:text-white uppercase tracking-wider">
              {lang === 'bn' ? 'কোম্পানি প্রোফাইল ম্যাচিং' : 'Company Profile Match'}
            </h3>
            <button onClick={() => onUpdateProfile?.()} className="text-xs font-bold text-accent-blue hover:underline no-print">
              {lang === 'bn' ? 'সম্পাদনা করুন' : 'Update Profile'}
            </button>
          </div>

          <div className="space-y-3">
            {result.companyMatch.map((match: any, idx: number) => {
              const isMet = match.met === true;

              let plainNote = match.reason || '';
              let snippetText = '';

              if (plainNote.includes('Snippet:')) {
                const parts = plainNote.split('Snippet:');
                plainNote = parts[0].trim();
                snippetText = parts[1].trim().replace(/^["']|["']$/g, '');
              } else if (plainNote.includes('snippet:')) {
                const parts = plainNote.split('snippet:');
                plainNote = parts[0].trim();
                snippetText = parts[1].trim().replace(/^["']|["']$/g, '');
              }

              return (
                <div
                  key={idx}
                  className={cn(
                    'flex flex-col md:flex-row md:items-stretch justify-between gap-6 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all print-avoid-break',
                    isMet ? 'border-l-4 border-l-pass-green' : 'border-l-4 border-l-fail-red'
                  )}
                >
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-headings-navy dark:text-gray-100 text-sm">{match.requirement}</h4>
                        {isMet ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-pass-green/10 text-pass-green border border-pass-green/20">
                            ✓ {lang === 'bn' ? 'মেলেছে' : 'MET'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-fail-red/10 text-fail-red border border-fail-red/20">
                            ✗ {lang === 'bn' ? 'মেলেনি' : 'NOT MET'}
                          </span>
                        )}
                      </div>

                      {plainNote && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">{plainNote}</p>
                      )}
                    </div>

                    {snippetText && (
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50 mt-1">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">TDS Evidence Snippet</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic font-mono leading-relaxed">"{snippetText}"</p>
                      </div>
                    )}
                  </div>

                  {/* Right Stacked Box Panel */}
                  <div className="flex md:flex-col gap-2 min-w-full md:min-w-[140px] md:max-w-[170px] shrink-0 justify-end md:justify-center">
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 p-2.5 rounded-xl text-center flex-1 md:flex-initial">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">
                        {lang === 'bn' ? 'প্রয়োজনীয়' : 'REQUIRED'}
                      </span>
                      <span className="font-extrabold text-[11px] text-slate-700 dark:text-slate-300 block break-words">{match.requiredValue}</span>
                    </div>
                    <div className={cn(
                      'border p-2.5 rounded-xl text-center flex-1 md:flex-initial',
                      isMet ? 'bg-pass-green/5 border-pass-green/20 text-pass-green' : 'bg-fail-red/5 border-fail-red/20 text-fail-red'
                    )}>
                      <span className="text-[9px] font-black uppercase tracking-wider block mb-0.5 opacity-85">
                        {lang === 'bn' ? 'আপনার আছে' : 'YOU HAVE'}
                      </span>
                      <span className="font-black text-[11px] block break-words">{match.userValue}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Summary Section */}
      <div className="space-y-3 print-avoid-break">
        <h3 className="text-base font-extrabold text-headings-navy dark:text-white uppercase tracking-wider">
          {lang === 'bn' ? 'বিশ্লেষণ সারসংক্ষেপ' : 'Analysis Summary'}
        </h3>
        <div className="bg-[#f2f7fa] dark:bg-slate-900/40 p-5 rounded-2xl border-l-4 border-l-accent-blue border border-sky-100/40 dark:border-slate-800/50">
          <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-semibold whitespace-pre-line">{result.summary}</p>
        </div>
      </div>

      {/* Mandatory Clauses Status Checklist */}
      {result.clauses && result.clauses.length > 0 && (
        <div className="space-y-3 print-avoid-break">
          <h3 className="text-base font-extrabold text-headings-navy dark:text-white uppercase tracking-wider">
            {lang === 'bn' ? 'বাধ্যতামূলক ধারা পর্যবেক্ষণ পরিস্থিতি' : 'Mandatory Clauses Status'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.clauses.map((clause: string, idx: number) => {
              const satisfied = isClauseSatisfied(clause);
              return (
                <div
                  key={idx}
                  className={cn(
                    'flex items-start gap-3 p-3.5 bg-white dark:bg-slate-900 rounded-xl border transition-all print-avoid-break',
                    satisfied ? 'border-pass-green/25 hover:border-pass-green/35' : 'border-fail-red/25 hover:border-fail-red/35'
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    {satisfied ? (
                      <div className="w-5 h-5 rounded-full bg-pass-green/10 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-pass-green stroke-[3.5]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-fail-red/10 flex items-center justify-center">
                        <X className="w-3 h-3 text-fail-red stroke-[3.5]" />
                      </div>
                    )}
                  </div>
                  <span className={cn(
                    'text-xs font-bold leading-normal',
                    satisfied ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-300'
                  )}>
                    {clause}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Winning Strategy Custom Callout Box */}
      {result.winningStrategy && (
        <div className="space-y-3 print-avoid-break">
          <h3 className="text-base font-extrabold text-headings-navy dark:text-white uppercase tracking-wider">
            {lang === 'bn' ? 'জয়ী হওয়ার কর্মকৌশল' : 'Winning Strategy'}
          </h3>
          <div
            id="winning-strategy-box"
            className="bg-[#fffaf3] dark:bg-slate-950/20 p-6 rounded-2xl border-l-4 border-l-amber-400 border border-amber-100/50 dark:border-amber-900/10"
          >
            <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-amber-200/30">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">
                {lang === 'bn' ? 'বিজ্ঞ পরামর্শ ও পরামর্শ গাইড' : 'STRATEGIC RECOMMENDATIONS'}
              </span>
            </div>
            <div className="prose dark:prose-invert prose-sm max-w-none text-slate-800 dark:text-slate-300 leading-relaxed font-semibold">
              <ReactMarkdown>{result.winningStrategy}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AnalysisReport;
