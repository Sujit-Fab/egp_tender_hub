/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardCheck, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Search,
  Gavel,
  ShieldCheck,
  UploadCloud,
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Globe,
  Image as ImageIcon,
  X,
  Settings,
  Calculator,
  Building2,
  ChevronRight,
  Sun,
  Moon,
  Printer,
  ChevronDown,
  User as UserIcon,
  Wrench,
  BookOpen,
  History,
  LayoutDashboard,
  Download,
  LifeBuoy,
  Newspaper,
  Activity,
  HeartHandshake,
  Cpu,
  Network,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { analyzeTender, TenderData, AnalysisResult, extractTenderData } from './services/tenderService';
import { getQAResponse } from './services/qaService';
import { cn } from './lib/utils';
import { auth, loginWithGoogle, logout, onAuthStateChanged, User, db, collection, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, OperationType, handleFirestoreError, onSnapshot, storage, ref, uploadBytes, getDownloadURL, deleteObject, deleteDoc, updateDoc, increment } from './firebase';
import { ForeignPartnerDrawer } from './components/ForeignPartnerDrawer';
import { generateForeignPartnerInsights, ForeignPartnerInsights } from './services/foreignPartnerService';
import { SoRCopilot } from './components/SoRCopilot';
import { CompanyProfileSettings } from './components/CompanyProfile';
import { UserManual } from './components/UserManual';
import { SupportDesk } from './components/SupportDesk';
import { Blog } from './components/Blog';
import { TermsAndConditions } from './components/TermsAndConditions';
import { PaymentModal } from './components/PaymentModal';
import { NoticeBoard } from './components/NoticeBoard';

const AICreditWidget = ({ userData, lang, setView }: any) => {
  if (!userData) return null;
  
  let limit = 100000;
  let planName = 'Free Plan';
  if (userData.subscriptionTier === 'pro') { limit = 1000000; planName = 'Pro Plan'; }
  if (userData.subscriptionTier === 'enterprise') { limit = 5000000; planName = 'Enterprise Plan'; }
  
  const used = userData.tokensUsedThisMonth || 0;
  const percentage = Math.min((used / limit) * 100, 100);
  
  let barColor = "bg-blue-500";
  if (percentage > 75) barColor = "bg-amber-500";
  if (percentage > 90) barColor = "bg-red-500";
  
  return (
    <div className="max-w-4xl mx-auto mb-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 xl:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            {lang === 'bn' ? 'এআই কম্পিউটিং ক্রেডিট' : 'AI Computing Credits'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'bn' ? `আপনার বর্তমান প্ল্যান: ${planName}` : `Your Active Plan: ${planName}`}
          </p>
        </div>
        {percentage > 90 && (
          <button 
            onClick={() => setView('pricing')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            {lang === 'bn' ? 'কোটা বাড়ান' : 'Top-Up Quota'}
          </button>
        )}
      </div>
      
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 mb-3 overflow-hidden">
        <div className={`h-4 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${percentage}%` }}></div>
      </div>
      
      <div className="flex justify-between items-center text-sm font-medium">
        <span className="text-slate-600 dark:text-slate-400">
          {used.toLocaleString()} {lang === 'bn' ? 'টোকেন ব্যবহৃত' : 'Tokens Used'}
        </span>
        <span className="text-slate-900 dark:text-white">
          {limit.toLocaleString()} {lang === 'bn' ? 'লিমিট' : 'Limit'}
        </span>
      </div>
    </div>
  );
};

const PricingPage = ({ lang, userData, onUpgradeClick }: { lang: 'en' | 'bn', userData: any, onUpgradeClick: (tier: 'pro' | 'enterprise') => void }) => {
  return (
    <motion.div 
      key="pricing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 max-w-5xl mx-auto py-8"
    >
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold text-slate-900">
          {lang === 'bn' ? 'আপনার প্ল্যান বেছে নিন' : 'Choose Your Plan'}
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          {lang === 'bn' 
            ? 'টেন্ডার বিশ্লেষণ এবং এসওপি তৈরির জন্য আমাদের সাবস্ক্রিপশন প্ল্যানগুলো দেখুন।' 
            : 'Explore our subscription plans for tender analysis and SOP generation.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Tier */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Freemium</h3>
          <div className="text-3xl font-bold text-slate-900 mb-6">
            ৳0 <span className="text-sm font-normal text-slate-500">/ month</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{lang === 'bn' ? 'PPR 2025 গাইড' : 'PPR 2025 Guide'}</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{lang === 'bn' ? 'বেসিক STD লাইব্রেরি' : 'Basic STD Library'}</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{lang === 'bn' ? 'মাসে ২টি ফ্রি স্ক্যান' : '2 Free Scans / Month'}</span>
            </li>
          </ul>
          <button 
            disabled={userData?.subscriptionTier === 'free'}
            className="w-full py-3 rounded-xl font-semibold border-2 border-slate-200 text-slate-700 disabled:opacity-50 disabled:bg-slate-50"
          >
            {userData?.subscriptionTier === 'free' ? (lang === 'bn' ? 'বর্তমান প্ল্যান' : 'Current Plan') : (lang === 'bn' ? 'ফ্রি শুরু করুন' : 'Start Free')}
          </button>
        </div>

        {/* Pro Tier */}
        <div className="bg-blue-600 rounded-3xl border border-blue-600 p-8 shadow-lg flex flex-col relative transform md:-translate-y-4 transition-all">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-sm whitespace-nowrap">
            🚀 {lang === 'bn' ? 'আর্লি বার্ড: প্রথম ১০০ জন (৫০% ছাড়)' : 'Early Bird: First 100 Users (50% Off)'}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
          <div className="flex flex-col mb-6">
            <div className="text-blue-300 line-through text-lg font-semibold">
              ৳1999
            </div>
            <div className="text-4xl font-bold text-white mt-1">
              ৳999 <span className="text-base font-normal text-blue-200">/ month</span>
            </div>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-white">
              <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0" />
              <span>{lang === 'bn' ? 'আনলিমিটেড টেন্ডার স্ক্যান' : 'Unlimited Tender Scans'}</span>
            </li>
            <li className="flex items-center gap-3 text-white">
              <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0" />
              <span>{lang === 'bn' ? 'ফুল এআই বিশ্লেষণ' : 'Full AI Analysis'}</span>
            </li>
            <li className="flex items-center gap-3 text-white">
              <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0" />
              <span>{lang === 'bn' ? 'ডাউনলোডযোগ্য এসওপি' : 'Downloadable SOPs'}</span>
            </li>
            <li className="flex items-center gap-3 text-white">
              <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0" />
              <span>{lang === 'bn' ? 'আনলিমিটেড প্রশ্নোত্তর' : 'Unlimited Q&A History'}</span>
            </li>
          </ul>
          <button 
            onClick={() => onUpgradeClick('pro')}
            className="w-full py-3 rounded-xl font-bold bg-white text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
          >
            {userData?.subscriptionTier === 'pro' ? (lang === 'bn' ? 'বর্তমান প্ল্যান' : 'Current Plan') : (lang === 'bn' ? 'আপগ্রেড করুন' : 'Upgrade to Pro')}
          </button>
        </div>

        {/* Enterprise Tier */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
          <div className="text-3xl font-bold text-slate-900 mb-6">
            Custom
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{lang === 'bn' ? 'কাস্টম STD আপলোড' : 'Custom STD Uploads'}</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{lang === 'bn' ? 'মাল্টি-ইউজার টিম অ্যাকাউন্ট' : 'Multi-user Team Accounts'}</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{lang === 'bn' ? 'এপিআই অ্যাক্সেস' : 'API Access'}</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span>{lang === 'bn' ? 'ডেডিকেটেড সাপোর্ট' : 'Dedicated Support'}</span>
            </li>
          </ul>
          <button 
            onClick={() => onUpgradeClick('enterprise')}
            className="w-full py-3 rounded-xl font-semibold border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            {lang === 'bn' ? 'আপগ্রেড করুন' : 'Upgrade to Enterprise'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const STDsLibrary = () => (
  <motion.div 
    key="library"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-8"
  >
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8">
      <h2 className="text-2xl font-bold mb-4">Standard Tender Documents (STDs) Library - Goods</h2>
      <p className="text-slate-500 mb-8">Reference library for mandatory STDs under BPPA/PPR 2025 regulations.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { id: 'e-PG1', title: 'SRFQ (Goods)', range: 'Up to 1.2 Million BDT', method: 'RFQ', desc: 'Used for low-value off-the-shelf goods.' },
          { id: 'e-PG2', title: 'OTM/LTM (Goods)', range: 'Up to 50 Lac BDT', method: 'OTM / LTM', desc: 'Standard document for mid-range goods procurement.' },
          { id: 'e-PG3', title: 'OTM (Goods)', range: 'Above 50 Lac BDT', method: 'OTM', desc: 'Comprehensive document for large-scale goods procurement.' },
          { id: 'e-PG9', title: 'DPM (Goods)', range: 'Any Value', method: 'Direct Procurement', desc: 'Used for proprietary items or emergency procurement.' },
          { id: 'e-PG3A', title: 'Framework (Goods)', range: 'Estimated Quantity', method: 'OTM / LTM', desc: 'Used for long-term supply agreements.' },
        ].map((std) => (
          <div key={std.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-blue-200 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">{std.id}</span>
              <span className="text-xs font-medium text-slate-400">{std.method}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{std.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{std.desc}</p>
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Applicable Range</span>
              <span className="text-xs font-bold text-blue-600">{std.range}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Standard Request for Proposal (RFP) - Services</h2>
      <p className="text-slate-500 mb-8">The 11 mandatory documents for procurement of intellectual and professional services.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { id: 'e-PS1', title: 'Consulting Firm (Intl.) - Time Based', range: 'Any Value', method: 'QCBS / FBS / LCS', desc: 'International selection of consulting firm based on time spent.' },
          { id: 'e-PS2', title: 'Consulting Firm (Intl.) - Lump Sum', range: 'Any Value', method: 'QCBS / FBS / LCS', desc: 'International selection of consulting firm based on lump-sum.' },
          { id: 'e-PS3', title: 'Individual Consultant (Natl.) - Lump Sum', range: 'Any Value', method: 'SIC', desc: 'National selection of individual consultant based on lump-sum.' },
          { id: 'e-PS4', title: 'Individual Consultant (Natl.) - Time Based', range: 'Any Value', method: 'SIC', desc: 'National selection of individual consultant based on time spent.' },
          { id: 'e-PS5', title: 'Consulting Firm (Natl.) - Simple Lump Sum', range: 'Up to 1 Crore BDT', method: 'QCBS / FBS / LCS', desc: 'National selection of consulting firm for simple assignments.' },
          { id: 'e-PS6', title: 'Consulting Firm (Natl.) - Simple Time Based', range: 'Up to 1 Crore BDT', method: 'QCBS / FBS / LCS', desc: 'National selection of consulting firm for simple assignments.' },
          { id: 'e-PS7', title: 'Consulting Firm (Natl.) - Complex Lump Sum', range: 'Above 1 Crore BDT', method: 'QCBS / FBS / LCS', desc: 'National selection of consulting firm for complex assignments.' },
          { id: 'e-PS8', title: 'Consulting Firm (Natl.) - Complex Time Based', range: 'Above 1 Crore BDT', method: 'QCBS / FBS / LCS', desc: 'National selection of consulting firm for complex assignments.' },
          { id: 'e-PS9', title: 'Consulting Firm (Natl.) - Design Contest', range: 'Any Value', method: 'Design Contest', desc: 'National selection of consulting firm through design contest.' },
          { id: 'e-PS10', title: 'NGOs / CBOs', range: 'Any Value', method: 'QCBS / FBS / LCS', desc: 'Selection of Non-Governmental Organizations or Community Based Organizations.' },
          { id: 'e-REOI', title: 'Request for Expression of Interest', range: 'Any Value', method: 'EOI', desc: 'Standard format for requesting expressions of interest from consulting firms.' },
        ].map((std) => (
          <div key={std.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-blue-200 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">{std.id}</span>
              <span className="text-xs font-medium text-slate-400">{std.method}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{std.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{std.desc}</p>
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Applicable Range</span>
              <span className="text-xs font-bold text-blue-600">{std.range}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const PPRGuide = () => (
  <motion.div 
    key="guide"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-8"
  >
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">PPR 2025 Key Updates</h2>
      <p className="text-slate-500 mb-8">Essential changes in the Public Procurement Rules 2025 that every analyst must know.</p>
      
      <div className="space-y-6">
        {[
          { rule: 'Section 65(1) & Rule 16', title: 'E-GP & Sustainability', desc: 'All procurements must use the e-GP portal. Sustainable Public Procurement (SPP) principles are now mandatory.' },
          { rule: 'Section 32(1)(e) & Rule 102', title: 'Reverse Auction', desc: 'Introduced Reverse Auction method for standard goods and physical services to ensure competitive real-time bidding.' },
          { rule: 'Rule 24', title: 'Procurement Strategy', desc: 'Mandatory preparation of a Procurement Strategy before selecting a procurement method for complex or high-value projects.' },
          { rule: 'Rule 36(1)', title: 'Performance Security', desc: 'Works contracts up to BDT 1 Crore require no performance security. Standard works/physical services require 5%, while goods require 10%.' },
          { rule: 'Section 39(2)', title: 'IT Services JV', desc: 'International procurement of IT services now mandatorily requires a Joint Venture (JV) with a local consultant/firm.' },
        ].map((guide, idx) => (
          <div key={idx} className="flex gap-6 p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-blue-50/50 transition-colors">
            <div className="shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Gavel className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase tracking-wider">{guide.rule}</span>
                <h3 className="text-lg font-bold text-slate-900">{guide.title}</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{guide.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Delegation of Financial Powers (DoFP)</h2>
      <p className="text-slate-500 mb-8">Key approval thresholds for contract awards based on the latest DoFP.</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-4 px-4 font-semibold text-slate-900">Approving Authority</th>
              <th className="py-4 px-4 font-semibold text-slate-900">Works</th>
              <th className="py-4 px-4 font-semibold text-slate-900">Goods & Equipment</th>
              <th className="py-4 px-4 font-semibold text-slate-900">Consultancy Services</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-4 px-4 font-medium text-slate-900">Ministry / Division</td>
              <td className="py-4 px-4 text-slate-600">Up to 50 Crore</td>
              <td className="py-4 px-4 text-slate-600">Up to 50 Crore</td>
              <td className="py-4 px-4 text-slate-600">Up to 10 Crore</td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-4 px-4 font-medium text-slate-900">Head of Department (HOPE)</td>
              <td className="py-4 px-4 text-slate-600">Up to 5.00 Crore</td>
              <td className="py-4 px-4 text-slate-600">Up to 2.00 Crore</td>
              <td className="py-4 px-4 text-slate-600">Up to 1.00 Crore</td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-4 px-4 font-medium text-slate-900">Divisional / Regional Office</td>
              <td className="py-4 px-4 text-slate-600">Up to 1.00 Crore</td>
              <td className="py-4 px-4 text-slate-600">Up to 50.00 Lakh</td>
              <td className="py-4 px-4 text-slate-600">Nil</td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-4 px-4 font-medium text-slate-900">District Level Office</td>
              <td className="py-4 px-4 text-slate-600">Up to 50.00 Lakh</td>
              <td className="py-4 px-4 text-slate-600">Up to 30.00 Lakh</td>
              <td className="py-4 px-4 text-slate-600">Nil</td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-4 px-4 font-medium text-slate-900">Upazila Level Office</td>
              <td className="py-4 px-4 text-slate-600">Up to 20.00 Lakh</td>
              <td className="py-4 px-4 text-slate-600">Up to 15.00 Lakh</td>
              <td className="py-4 px-4 text-slate-600">Nil</td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50 bg-blue-50/30">
              <td colSpan={4} className="py-2 px-4 font-bold text-slate-700 uppercase text-xs tracking-wider">Development Projects Only</td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-4 px-4 font-medium text-slate-900">Project Director (Category A - Above 100 Cr)</td>
              <td className="py-4 px-4 text-slate-600">Up to 5.00 Crore</td>
              <td className="py-4 px-4 text-slate-600">Up to 3.00 Crore</td>
              <td className="py-4 px-4 text-slate-600">Up to 50.00 Lakh</td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-4 px-4 font-medium text-slate-900">Project Director (Category B - 50 to 100 Cr)</td>
              <td className="py-4 px-4 text-slate-600">Up to 3.00 Crore</td>
              <td className="py-4 px-4 text-slate-600">Up to 2.00 Crore</td>
              <td className="py-4 px-4 text-slate-600">Up to 30.00 Lakh</td>
            </tr>
            <tr className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-4 px-4 font-medium text-slate-900">Project Director (Category C - Up to 50 Cr)</td>
              <td className="py-4 px-4 text-slate-600">Up to 1.00 Crore</td>
              <td className="py-4 px-4 text-slate-600">Up to 1.00 Crore</td>
              <td className="py-4 px-4 text-slate-600">Up to 20.00 Lakh</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">e-GP Guidelines & Security Policies</h2>
      <p className="text-slate-500 mb-8">Critical operational and security directives for the e-GP system based on the 2025 Guidelines, Information Security Policy, and BCMS Policy.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'e-Reverse Auction', desc: 'Introduced as an online real-time procurement technique for standard goods and physical services to ensure competitive pricing.' },
          { title: 'Data Security & Backup', desc: 'Follows the 3-2-1 backup rule (3 copies, 2 media, 1 offsite). Data loss in disaster recovery is limited to a maximum of 1 hour.' },
          { title: 'Password Policy', desc: 'Passwords must be changed every 90 days, contain at least 8 alphanumeric characters, and include upper/lower case, digits, and punctuation.' },
          { title: 'Business Continuity', desc: 'BPPA ensures Business Continuity Management System (BCMS) implementation to manage risks and ensure uninterrupted e-GP operations.' },
          { title: 'Tender Submission', desc: 'Multiple dropping of tenders is not applicable. Tenders must be submitted online before the deadline; late submissions are automatically rejected.' },
          { title: 'Pre-Tender Queries', desc: 'Queries must be posted via the e-GP online channel. Fax, post, or email queries will not be entertained.' },
          { title: 'Tender Security', desc: 'Tender security will be prepared by the bank using the e-GP system template. The bank will update the transaction information and upload the scanned copy in the e-GP system.' },
          { title: 'Evaluation Committees', desc: 'If the approving authority is HOPE or below, TEC/PEC shall be formed with 3 members (at least 1 from another PE). If above HOPE, TEC/PEC shall be formed with 5 members (at least 1 external).' },
        ].map((policy, idx) => (
          <div key={idx} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-blue-200 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{policy.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{policy.desc}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Bangladesh Public Procurement Authority (BPPA) Act 2023</h2>
      <p className="text-slate-500 mb-8">Key provisions and transformations introduced by the BPPA Act 2023 (Act No. 32 of 2023).</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Establishment of BPPA', desc: 'The Act transforms the former Central Procurement Technical Unit (CPTU) into the Bangladesh Public Procurement Authority (BPPA), granting it more autonomy and regulatory power.' },
          { title: 'Board of Directors', desc: 'BPPA is governed by a Board of Directors chaired by the Minister of Planning, ensuring high-level oversight and strategic direction for public procurement.' },
          { title: 'Enhanced Regulatory Role', desc: 'BPPA is empowered to formulate policies, strategies, and legal frameworks for public procurement, ensuring transparency, efficiency, and accountability.' },
          { title: 'e-GP System Management', desc: 'BPPA has the explicit mandate to operate, manage, and utilize data from the e-GP System, driving the digitalization of public procurement.' },
          { title: 'Capacity Building & Professionalization', desc: 'The Authority is responsible for setting standards, conducting exams, and issuing professional certifications to build a skilled procurement workforce.' },
          { title: 'Dispute Resolution', desc: 'BPPA maintains a list of experts and dispute resolution facilitators to handle procurement-related conflicts efficiently.' },
        ].map((provision, idx) => (
          <div key={idx} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-blue-200 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{provision.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{provision.desc}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Outsourcing Policy 2025</h2>
      <p className="text-slate-500 mb-8">Key guidelines for procuring services through outsourcing as per the 2025 policy.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Applicability', desc: 'Applies to ministries, divisions, government institutions, statutory bodies, autonomous/semi-autonomous bodies, and state-owned enterprises.' },
          { title: 'Service Categories', desc: 'Includes security, cleaning, gardening, transport, electrical/mechanical maintenance, catering, and specialized services (IT, engineering, research, etc.).' },
          { title: 'Age Limit', desc: 'The age limit for outsourced service personnel must be between 18 and 60 years.' },
          { title: 'Contract Duration', desc: 'Generally, service contracts are for two years. However, in special cases, with Finance Division approval, the duration can be extended or reduced.' },
          { title: 'Leave & Benefits', desc: 'Personnel are entitled to 15 days of casual leave per year, maternity leave (45 days for women), two festival bonuses (50% of basic pay), and a Baishakhi allowance (20%).' },
          { title: 'Monitoring Committee', desc: 'A 3-member "Outsourcing Service Monitoring Committee" must be formed to oversee the outsourced activities and ensure service quality.' },
        ].map((policy, idx) => (
          <div key={idx} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-blue-200 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{policy.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{policy.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const ManageSTDs = ({ uploadData, setUploadData, handleUpload, loading, stds, handleDeleteStd, userData, lang }: any) => {
  if (userData?.subscriptionTier !== 'enterprise' && userData?.role !== 'admin') {
    return (
      <motion.div 
        key="manage"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          {lang === 'bn' ? 'এন্টারপ্রাইজ ফিচার' : 'Enterprise Feature'}
        </h2>
        <p className="text-slate-500 max-w-md mb-8">
          {lang === 'bn' 
            ? 'কাস্টম STD আপলোড এবং ম্যানেজ করার জন্য এন্টারপ্রাইজ প্ল্যান প্রয়োজন।' 
            : 'Custom STD uploads and management require an Enterprise plan.'}
        </p>
      </motion.div>
    );
  }

  return (
  <motion.div 
    key="manage"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-8"
  >
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4">
        <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Upload New STD
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Document Title</label>
              <input 
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                value={uploadData.title}
                onChange={e => setUploadData({...uploadData, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  value={uploadData.category}
                  onChange={e => setUploadData({...uploadData, category: e.target.value})}
                >
                  <option value="Goods">Goods</option>
                  <option value="Works">Works</option>
                  <option value="Physical Services">Physical Services</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Method</label>
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  value={uploadData.method}
                  onChange={e => setUploadData({...uploadData, method: e.target.value})}
                >
                  <option value="OTM">OTM</option>
                  <option value="LTM">LTM</option>
                  <option value="RFQ">RFQ</option>
                  <option value="DPM">DPM</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Value</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  value={uploadData.valueMin}
                  onChange={e => setUploadData({...uploadData, valueMin: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Value</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  value={uploadData.valueMax}
                  onChange={e => setUploadData({...uploadData, valueMax: Number(e.target.value)})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload PDF</label>
              <input 
                type="file"
                accept="application/pdf"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={e => setUploadData({...uploadData, file: e.target.files?.[0] || null})}
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              Upload Document
            </button>
          </form>
        </section>
      </div>
      
      <div className="lg:col-span-8">
        <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Uploaded Documents
          </h2>
          <div className="space-y-4">
            {stds.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <p>No custom STDs uploaded yet.</p>
              </div>
            ) : (
              stds.map((std) => (
                <div key={std.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-blue-200 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-900">{std.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {std.category} • {std.method} • {std.valueMin.toLocaleString()} - {std.valueMax.toLocaleString()} BDT
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={std.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                      View
                    </a>
                    <button 
                      onClick={() => handleDeleteStd(std.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  </motion.div>
  );
};

const TenderQnA = ({ scannedText, qnaMessages, qnaLoading, qnaInput, setQnaInput, handleAskQuestion, messagesEndRef, lang, qnaImages, setQnaImages, fileInputRef, handleImageChange }: any) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    let finalTranscript = qnaInput;

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let currentFinal = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setQnaInput(finalTranscript + (finalTranscript && currentFinal ? ' ' : '') + currentFinal + interimTranscript);
      if (currentFinal) {
         finalTranscript += (finalTranscript ? ' ' : '') + currentFinal;
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  return (
    <motion.div 
      key="qna"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{lang === 'bn' ? 'টেন্ডার প্রশ্নোত্তর' : 'Tender Q&A'}</h2>
          <p className="text-sm text-slate-500">{lang === 'bn' ? 'স্ক্যান করা টেন্ডার নোটিশ বা সাধারণ প্রকিউরমেন্ট নীতি সম্পর্কে প্রশ্ন করুন' : 'Ask questions about the scanned tender notice or general procurement policies'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {qnaMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">{lang === 'bn' ? 'যেকোনো কিছু জিজ্ঞাসা করুন' : 'Ask Anything'}</p>
            <p className="max-w-md">{lang === 'bn' ? 'আপনি স্ক্যান করা টেন্ডার নোটিশ বা সাধারণ প্রকিউরমেন্ট নীতি (PPR 2025, e-GP, BPPA Act, Outsourcing Policy) সম্পর্কে প্রশ্ন করতে পারেন।' : 'You can ask questions about the scanned tender notice or general procurement policies (PPR 2025, e-GP, BPPA Act, Outsourcing Policy).'}</p>
          </div>
        ) : (
          qnaMessages.map((msg: any, idx: number) => (
            <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] rounded-2xl p-4",
                msg.role === 'user' ? "bg-blue-600 text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"
              )}>
                <div className="prose prose-sm max-w-none">
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded" className="max-w-full h-auto rounded-lg mb-2 border border-slate-200/20" />
                  )}
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))
        )}
        {qnaLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm p-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{lang === 'bn' ? 'ভাবছি...' : 'Thinking...'}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        {qnaImages && qnaImages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {qnaImages.map((img: string, idx: number) => (
              <div key={idx} className="relative inline-block">
                <img src={img} alt={`Preview ${idx}`} className="h-20 w-auto rounded-lg border border-slate-200 object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setQnaImages(qnaImages.filter((_: any, i: number) => i !== idx));
                    if (qnaImages.length === 1 && fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleAskQuestion} className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={qnaLoading}
            className="px-4 py-3 rounded-xl font-semibold flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-slate-100 text-slate-700 hover:bg-slate-200"
            title="Attach a screenshot"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={qnaInput}
            onChange={(e) => setQnaInput(e.target.value)}
            placeholder={lang === 'bn' ? "প্রশ্ন করুন..." : "Ask a question..."}
            disabled={qnaLoading}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={toggleRecording}
            disabled={qnaLoading}
            className={cn(
              "px-4 py-3 rounded-xl font-semibold flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              isRecording ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
            title={isRecording ? "Stop recording" : "Start voice input"}
          >
            {isRecording ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            type="submit"
            disabled={(!qnaInput.trim() && qnaImages.length === 0) || qnaLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'পাঠান' : 'Send'}</span>
          </button>
        </form>
      </div>
    </motion.div>
  );
};

const TenderSOP = ({ result, lang }: any) => {
  const sop = result?.sop;

  return (
    <motion.div
      key="sop"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ClipboardCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{lang === 'bn' ? 'টেন্ডার এসওপি (SOP)' : 'Tender SOP'}</h2>
            <p className="text-slate-500">{lang === 'bn' ? 'অংশগ্রহণের নির্দেশিকা এবং সময়সূচী' : 'Participation guidelines and timeline'}</p>
          </div>
        </div>

        {!sop ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">{lang === 'bn' ? 'কোনো এসওপি পাওয়া যায়নি' : 'No SOP Available'}</p>
            <p className="max-w-md">{lang === 'bn' ? 'অনুগ্রহ করে প্রথমে ড্যাশবোর্ড থেকে একটি টেন্ডার নোটিশ স্ক্যান এবং বিশ্লেষণ করুন।' : 'Please scan and analyze a tender notice from the dashboard first.'}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* How to Participate */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                {lang === 'bn' ? 'কীভাবে অংশগ্রহণ করবেন' : 'How to Participate'}
              </h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
                {sop.howToParticipate}
              </div>
            </section>

            {/* Eligibility Criteria */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                {lang === 'bn' ? 'যোগ্যতার মানদণ্ড' : 'Eligibility Criteria'}
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sop.eligibilityCriteria?.map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Essential Documents */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {lang === 'bn' ? 'প্রয়োজনীয় কাগজপত্র' : 'Essential Documents'}
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sop.essentialDocuments?.map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Step-by-Step Timeline */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                {lang === 'bn' ? 'ধাপে ধাপে সময়সূচী' : 'Step-by-Step Timeline'}
              </h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {sop.stepByStepTimeline?.map((item: string, idx: number) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-blue-600 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      {idx + 1}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                      <p className="text-sm text-slate-700">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const MyAnalyses = ({ user, lang, setView, setResult, setFormData }: any) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoadingHistory(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const q = query(collection(db, 'analyses'), where('authorUid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const analysesData = querySnapshot.docs.map(doc => doc.data());
        // Sort by createdAt descending
        analysesData.sort((a: any, b: any) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
        setHistory(analysesData);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [user]);

  const handleViewAnalysis = (analysisData: any) => {
    setResult(analysisData.analysis);
    if (analysisData.tenderData) {
      setFormData(analysisData.tenderData);
    }
    setView('dashboard');
  };

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{lang === 'bn' ? 'আমার বিশ্লেষণ' : 'My Analyses'}</h2>
            <p className="text-slate-500">{lang === 'bn' ? 'আপনার পূর্ববর্তী টেন্ডার বিশ্লেষণ এবং এসওপি' : 'Your previous tender analyses and SOPs'}</p>
          </div>
        </div>

        {!user ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <ShieldCheck className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">{lang === 'bn' ? 'লগইন প্রয়োজন' : 'Login Required'}</p>
            <p className="max-w-md">{lang === 'bn' ? 'আপনার ইতিহাস দেখতে অনুগ্রহ করে লগইন করুন।' : 'Please log in to view your history.'}</p>
          </div>
        ) : loadingHistory ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">{lang === 'bn' ? 'কোনো ইতিহাস পাওয়া যায়নি' : 'No History Found'}</p>
            <p className="max-w-md">{lang === 'bn' ? 'আপনি এখনও কোনো টেন্ডার বিশ্লেষণ করেননি।' : 'You have not analyzed any tenders yet.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-blue-200 transition-colors">
                <div>
                  <h3 className="font-bold text-slate-900">{item.tenderData?.title || 'Untitled Tender'}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.tenderData?.nature} • {item.tenderData?.method} • {item.tenderData?.value?.toLocaleString()} BDT
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Unknown Date'}
                  </p>
                </div>
                <button 
                  onClick={() => handleViewAnalysis(item)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {lang === 'bn' ? 'দেখুন' : 'View'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const LandingPage = ({ loginWithGoogle, lang, setView }: { loginWithGoogle: () => void, lang: 'en' | 'bn', setView: (v: any) => void }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  const faqs = [
    {
      question: lang === 'bn' ? 'আমার কোম্পানির প্রোফাইলের ডেটা কি নিরাপদ?' : 'Is my company profile data secure?',
      answer: lang === 'bn' ? 'হ্যাঁ, আপনার ডেটা এনক্রিপ্ট করা থাকে এবং সম্পূর্ণ গোপনীয় রাখা হয়। এটি শুধুমাত্র আপনার নিজস্ব টেন্ডার বিশ্লেষণের জন্য ব্যবহৃত হয়।' : 'Yes, your data is fully encrypted and kept completely private. It is only used to run eligibility analysis against the tenders you specifically choose to scan.'
    },
    {
      question: lang === 'bn' ? 'এটি কি বাংলা টেন্ডার নথির সাথে কাজ করে?' : 'Does this work with Bengali tender documents?',
      answer: lang === 'bn' ? 'অবশ্যই। আমাদের এআই ইঞ্জিনটি বিশেষায়িত করা হয়েছে যাতে এটি বাংলা এবং ইংরেজি উভয় ভাষার ই-জিপি টেন্ডার পড়তে এবং বুঝতে পারে।' : 'Absolutely. Our fine-tuned AI engine is fully bilingual and can flawlessly read, understand, and extract clauses from both Bengali and English e-GP e-PW2A documents.'
    },
    {
      question: lang === 'bn' ? 'ফ্রিমিয়াম প্ল্যানটি কীভাবে কাজ করে?' : 'How does the Freemium plan work?',
      answer: lang === 'bn' ? 'সাইন আপ করার সাথে সাথেই আপনি প্রতি মাসে ২টি ফ্রি ফুল-স্কেল টেন্ডার স্ক্যান করতে পারবেন, কোনো ক্রেডিট কার্ডের প্রয়োজন নেই।' : 'Upon signing up with Google, you instantly receive 2 free, full-scale tender intelligence scans per month. No credit card required. You only upgrade if you need more volume.'
    }
  ];

  return (
    <motion.div 
      key="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col w-full -mt-8"
    >
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-full min-h-[85vh]">
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={() => setView('blog')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
          >
            <Newspaper className="w-4 h-4" />
            {lang === 'bn' ? 'আমাদের ব্লগ পড়ুন' : 'Read Our Blog'}
          </button>
        </div>
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white dark:from-slate-800/20 dark:via-slate-900 dark:to-slate-900"></div>
        <div className="max-w-5xl mx-auto space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-2 mx-auto border border-blue-200 dark:border-blue-800/50 shadow-sm backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'bn' ? 'BPPA ও PPR 2025 গাইডলাইন সমর্থিত' : 'Fully aligned with BPPA & PPR 2025'}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            Stop Guessing. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Win More e-GP Tenders.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {lang === 'bn' 
              ? 'eGPTenderHub হল বাংলাদেশের প্রথম AI-চালিত প্ল্যাটফর্ম। আপনার কোম্পানির যোগ্যতার সাথে ই-জিপি টেন্ডারের মিল খুঁজুন এবং নিখুঁত দরপত্র প্রস্তুত করুন।' 
              : 'eGPTenderHub is the digital legal assistant for Class-A & Class-B contractors. Upload your profile and match instantly against complex STD PDFs.'}
          </p>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={loginWithGoogle}
              className="px-8 py-4 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-xl shadow-blue-600/20 dark:shadow-blue-900/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              {lang === 'bn' ? 'বিনামূল্যে শুরু করুন' : 'Start Your 2 Free Scans'} <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 w-full sm:w-auto bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-bold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {lang === 'bn' ? 'কীভাবে কাজ করে?' : 'How It Works'}
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-6 font-medium">
            No credit card required. Secure login via Google Workspace.
          </p>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-10 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center opacity-70 hover:opacity-100 transition-opacity">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400 mb-6">Built for top-tier contractors across Bangladesh</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center text-slate-400 dark:text-slate-600">
             {/* Logobar mimicking corporate trust */}
             <div className="flex items-center gap-2 font-bold text-xl"><HeartHandshake className="w-6 h-6 text-blue-500"/> National Care Service</div>
             <div className="flex items-center gap-2 font-bold text-xl"><Cpu className="w-6 h-6 text-indigo-500"/> Fab Technologies Ltd.</div>
             <div className="flex items-center gap-2 font-bold text-xl"><Building2 className="w-6 h-6 text-amber-500"/> SMS Enterprise</div>
             <div className="hidden md:flex items-center gap-2 font-bold text-xl"><Network className="w-6 h-6 text-emerald-500"/> CINTech Bangladesh Ltd</div>
          </div>
        </div>
      </section>

{/* Demo Video Section */}
<section id="demo" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold border border-blue-200 dark:border-blue-800/50">
      <Activity className="w-4 h-4" />
      {lang === 'bn' ? 'দেখুন কীভাবে কাজ করে' : 'See it work, start to finish'}
    </span>
    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
      {lang === 'bn' ? 'ফাঁকা প্রতিশ্রুতি নয় — নিজের চোখে দেখুন।' : "Don't take our word for it. Watch it run."}
    </h2>
    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
      {lang === 'bn'
        ? 'একটি আসল STD PDF আপলোড থেকে চূড়ান্ত রিস্ক রিপোর্ট তৈরি পর্যন্ত পুরো প্রক্রিয়া দেখুন।'
        : 'Watch a real STD PDF go from upload to a final risk verdict — start to finish.'}
    </p>

    <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-600/10 border border-slate-200 dark:border-slate-700 bg-slate-900 aspect-video">
      <iframe
        className="absolute inset-0 w-full h-full"
        src="https://www.youtube.com/embed/5CN8LV4XSW8?rel=0&modestbranding=1"
        title="eGPTenderHub Demo"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>

    <button
      onClick={loginWithGoogle}
      className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 inline-flex items-center gap-2"
    >
      {lang === 'bn' ? 'এখন বিনামূল্যে চেষ্টা করুন' : 'Try It Free Now'} <ChevronRight className="w-5 h-5" />
    </button>
  </div>
</section>

      {/* Deep Dive Features */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          {/* Feature 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 md:p-6 shadow-inner overflow-hidden md:h-[500px] flex justify-center items-center">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0089421810.firebasestorage.app/o/sample-verdict-report.png?alt=media&token=0b3a58d3-67cb-43b5-9213-4d532879e8fd"
                alt={lang === 'bn' ? 'নমুনা PPR 2025 কমপ্লায়েন্স রিপোর্ট' : 'Sample PPR 2025 compliance verdict report'}
                className="w-full h-full object-contain rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"
                loading="lazy"
              />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">AI-Powered PPR 2025 Compliance Engine.</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Tender clauses are intentionally complex. A single misread line regarding liquid asset requirements can disqualify your bid after weeks of preparation.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Extracts the exact AAT, Liquid Asset, and Specific Experience limits.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Automatically cross-references against your saved Company Profile.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Generates a detailed, downloadable PDF risk verdict report.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                <Calculator className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Smart SoR & BoQ Insights.</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Stop estimating blindly. Use our integrated Smart Estimates tool to calculate precise margins based on the Schedule of Rates (SoR).
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Instantly generate baseline costs from PWD rate schedules.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Adjust overhead, profit margins, and VAT seamlessly.</span>
                </li>
              </ul>
            </div>
            <div className="relative rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 md:p-6 shadow-inner overflow-hidden md:h-[500px] flex justify-center items-center">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0089421810.firebasestorage.app/o/sample-sor-estimate.png?alt=media&token=81b91c0c-cb1f-45e5-8e6f-6efa587354dd"
                alt={lang === 'bn' ? 'নমুনা SoR ও BoQ এস্টিমেট' : 'Sample SoR and BoQ estimate calculation'}
                className="w-full h-full object-contain rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"
                loading="lazy"
              />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 md:p-6 shadow-inner overflow-hidden md:h-[500px] flex justify-center items-center">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0089421810.firebasestorage.app/o/sample-tender-chat.png?alt=media&token=8b67bd98-d706-40fb-9b2b-31c426d319bb"
                alt={lang === 'bn' ? 'নমুনা টেন্ডার প্রশ্নোত্তর চ্যাট' : 'Sample Tender Q&A chat'}
                className="w-full h-full object-contain rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"
                loading="lazy"
              />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Chat With Your Tender.</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Don't waste hours scanning a 500-page PDF document looking for one specific clause. Ask our specialized Q&A Intelligence Engine.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Context-aware AI reads the entire text of the uploaded notice.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Multimodal support: Upload screenshots of tables for analysis.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* ROI / Cost of Failure Section */}
      <section className="py-24 bg-blue-600 dark:bg-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/50 dark:from-blue-800/50 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
           <h2 className="text-4xl md:text-5xl font-extrabold text-white">A single missed clause can cost you the entire bid.</h2>
           <p className="text-xl text-blue-100 font-medium leading-relaxed max-w-2xl mx-auto">
             eGPTenderHub acts as your digital compliance officer, ensuring every requirement is met before you hit submit. Reduce human error, save hundreds of hours, and win more contracts.
           </p>
           <div className="pt-8 block">
             <button onClick={loginWithGoogle} className="px-8 py-4 bg-white text-blue-700 hover:bg-slate-50 border-transparent rounded-2xl text-lg font-bold shadow-xl transition-all hover:-translate-y-1 inline-flex items-center gap-2">
               {lang === 'bn' ? 'ফ্রি অ্যাকাউন্ট তৈরি করুন' : 'Create Free Account'} <ChevronRight className="w-5 h-5" />
             </button>
           </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Everything you need to know about the product and billing.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50 overflow-hidden transition-all duration-200"
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                >
                  <span className="font-bold text-slate-900 dark:text-white text-lg">{faq.question}</span>
                  <ChevronDown className={cn("w-5 h-5 text-slate-500 transition-transform duration-200", openFaq === idx ? "rotate-180" : "")} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  <span className="text-blue-500">eGP</span>TenderHub
                </h1>
              </div>
              <p className="max-w-sm text-sm leading-relaxed">
                The intelligence layer for Bangladesh's e-GP ecosystem. Plan, estimate, and evaluate tenders with unparalleled AI accuracy.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm">
                <li><button onClick={loginWithGoogle} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={loginWithGoogle} className="hover:text-white transition-colors">Pricing</button></li>
                <li><span onClick={() => {}} className="cursor-pointer hover:text-white transition-colors">Enterprise</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Resources & Legal</h4>
              <ul className="space-y-4 text-sm">
                <li><span onClick={() => {
                   document.documentElement.scrollTop = 0;
                   setView('blog');
                }} className="hover:text-white cursor-pointer transition-colors text-blue-400">eGPTenderHub Blog</span></li>
                  <li><Link to="/privacy" className="hover:text-white cursor-pointer transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="hover:text-white cursor-pointer transition-colors">Terms of Service</Link></li>
                <li><span className="hover:text-white cursor-pointer transition-colors">Contact Us</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
             <p>© {new Date().getFullYear()} eGPTenderHub.com. All rights reserved.</p>
             <div className="flex items-center gap-6">
               <button onClick={() => setView('terms')} className="hover:text-blue-400 transition-colors">
                 {lang === 'bn' ? 'শর্তাবলী' : 'Terms & Conditions'}
               </button>
               <p>Dhaka, Bangladesh</p>
             </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

// GA4 event helper — fires to the gtag already loaded in index.html (G-6MT7G3LGZY)
const trackEvent = (name: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', name, params);
  }
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [view, setView] = useState<'landing' | 'dashboard' | 'library' | 'guide' | 'manage' | 'qna' | 'sop' | 'history' | 'pricing' | 'sor' | 'profile' | 'manual' | 'support' | 'blog' | 'terms' | 'noticeboard'>('landing');
  const [activeMobileMenu, setActiveMobileMenu] = useState<'tools' | 'profile' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isForeignMode, setIsForeignMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark_mode');
    return saved === 'true';
  });

  const [paymentModalTier, setPaymentModalTier] = useState<'pro' | 'enterprise' | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Track each in-app screen change as a virtual pageview (so GA4 shows /landing, /dashboard, /pricing, etc.)
  useEffect(() => {
    trackEvent('page_view', {
      page_title: `egp_${view}`,
      page_path: `/${view}`,
    });
  }, [view]);

  const [foreignInsights, setForeignInsights] = useState<ForeignPartnerInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stds, setStds] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [scannedText, setScannedText] = useState<string>('');
  
  // Q&A State
  const [qnaMessages, setQnaMessages] = useState<{role: 'user'|'assistant', content: string}[]>([]);
  const [qnaInput, setQnaInput] = useState('');
  const [qnaImages, setQnaImages] = useState<string[]>([]);
  const [qnaLoading, setQnaLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Company Profile State
  const [companyProfile, setCompanyProfile] = useState<any>(() => {
    const saved = localStorage.getItem('company_profile');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return {
          liquidAssets: parsed.liquidAssets ?? 0,
          similarWorkExperience: parsed.similarWorkExperience ?? 0,
          averageAnnualTurnover: parsed.averageAnnualTurnover ?? 0,
          tenderCapacity: parsed.tenderCapacity ?? 0,
          generalExperienceYears: parsed.generalExperienceYears ?? '',
          similarContractsCount5Years: parsed.similarContractsCount5Years ?? '',
          keyPersonnel: parsed.keyPersonnel ?? [],
          equipment: parsed.equipment ?? [],
          tradeLicense: parsed.tradeLicense ?? { hasLicense: '', validityDate: '' },
          electricalLicense: parsed.electricalLicense ?? { hasLicense: '', validityDate: '', category: '' },
          fireLicense: parsed.fireLicense ?? { hasLicense: '', validityDate: '' },
          bercLicense: parsed.bercLicense ?? { hasLicense: '', validityDate: '' },
          dlsLicense: parsed.dlsLicense ?? { hasLicense: '', validityDate: '' },
          tinLicense: parsed.tinLicense ?? { hasLicense: '', validityDate: '' },
          vatLicense: parsed.vatLicense ?? { hasLicense: '', validityDate: '' },
          supplyCapacity: parsed.supplyCapacity ?? '',
          manufacturerAuthorization: parsed.manufacturerAuthorization ?? { hasAuth: '', items: '' }
        };
      } catch (e) {}
    }
    return {
      liquidAssets: 0,
      similarWorkExperience: 0,
      averageAnnualTurnover: 0,
      tenderCapacity: 0,
      generalExperienceYears: '',
      similarContractsCount5Years: '',
      keyPersonnel: [],
      equipment: [],
      tradeLicense: { hasLicense: '', validityDate: '' },
      electricalLicense: { hasLicense: '', validityDate: '', category: '' },
      fireLicense: { hasLicense: '', validityDate: '' },
      bercLicense: { hasLicense: '', validityDate: '' },
      dlsLicense: { hasLicense: '', validityDate: '' },
      tinLicense: { hasLicense: '', validityDate: '' },
      vatLicense: { hasLicense: '', validityDate: '' },
      supplyCapacity: '',
      manufacturerAuthorization: { hasAuth: '', items: '' }
    };
  });

  const saveCompanyProfile = async (profile: any) => {
    setCompanyProfile(profile);
    localStorage.setItem('company_profile', JSON.stringify(profile));
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          companyProfile: profile
        });
      } catch (err) {
        console.error("Failed to sync companyProfile with firestore:", err);
      }
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<TenderData>({
    title: '',
    nature: 'Goods',
    value: 1000000,
    method: 'OTM'
  });

  const [uploadData, setUploadData] = useState({
    title: '',
    category: 'Goods',
    method: 'OTM',
    valueMin: 0,
    valueMax: 5000000,
    file: null as File | null
  });

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setView(prev => prev === 'landing' ? 'dashboard' : prev);
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              role: 'user',
              subscriptionTier: 'free',
              scansThisMonth: 0,
              createdAt: serverTimestamp()
            });
            trackEvent('sign_up', { method: 'google_workspace' });
          }
        } catch (err) {
          console.error("Error creating user document:", err);
        }
      }
    });
    return () => {
      unsubscribeAuth();
    };
  }, []);

  React.useEffect(() => {
    if (!user) {
      setUserData(null);
      setStds([]);
      return;
    }
    const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const uData = docSnap.data();
        setUserData(uData);
        if (uData.companyProfile) {
          setCompanyProfile(uData.companyProfile);
          localStorage.setItem('company_profile', JSON.stringify(uData.companyProfile));
        }
      }
    }, (err) => {
      console.error("Failed to fetch user data", err);
    });

    const unsubscribeStds = onSnapshot(query(collection(db, 'stds'), where('authorUid', '==', user.uid)), (snapshot) => {
      const stdsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStds(stdsData);
    }, (err) => {
      console.error('Failed to fetch STDs:', err);
      alert(`Failed to fetch STDs: ${err instanceof Error ? err.message : 'Unknown error'}`);
    });

    return () => {
      unsubscribeUser();
      unsubscribeStds();
    };
  }, [user]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Paywall Check & Quota Check
    if (user && userData) {
      if (userData.subscriptionTier === 'free' && userData.scansThisMonth >= 2) {
        setShowUpgradeModal(true);
        return;
      }
      
      let limit = 100000;
      if (userData.subscriptionTier === 'pro') limit = 1000000;
      if (userData.subscriptionTier === 'enterprise') limit = 5000000;
      
      if ((userData.tokensUsedThisMonth || 0) > limit) {
        alert(lang === 'bn' ? 'আপনার এআই কোটা শেষ হয়ে গেছে। দয়া করে আপগ্রেড করুন।' : 'Your AI Analysis Quota has been exceeded. Please upgrade to continue.');
        setShowUpgradeModal(true);
        return;
      }
    } else if (!user) {
      // Allow 1 free scan for non-logged in users, or force login?
      // Let's force login for scanning to track usage properly.
      alert(lang === 'bn' ? 'অনুগ্রহ করে লগইন করুন' : 'Please login to scan tenders.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await analyzeTender(
        { ...formData, fullText: scannedText || formData.fullText },
        lang,
        stds,
        companyProfile
      );
      setResult(data);
      trackEvent('scan_complete', { verdict: data.eligibilityLabel || (data.score >= 50 ? 'eligible' : 'not_eligible'), score: data.score });
      
      let fInsights = null;
      let totalTokens = data.tokensUsed || 0;
      
      if (isForeignMode || userData?.subscriptionTier === 'enterprise') {
        try {
          fInsights = await generateForeignPartnerInsights(formData, lang, companyProfile);
          if (fInsights.tokensUsed) totalTokens += fInsights.tokensUsed;
          setForeignInsights(fInsights);
        } catch (err) {
          console.error("Failed to generate foreign insights", err);
        }
      }
      
      if (user && userData) {
        try {
          if (totalTokens > 0) {
            await updateDoc(doc(db, 'users', user.uid), {
              tokensUsedThisMonth: increment(totalTokens)
            });
          }
        } catch(e) { console.error("Failed to update tokens", e); }
        
        const analysisId = Date.now().toString();
        try {
          // Remove undefined values to prevent Firestore errors
          const safeData = JSON.parse(JSON.stringify(data));
          const safeFormData = { ...formData };
          delete (safeFormData as any).file;
          
          const analysisDoc: any = {
            id: analysisId,
            tenderData: safeFormData,
            analysis: safeData,
            authorUid: user.uid,
            createdAt: serverTimestamp()
          };
          if (fInsights) {
            analysisDoc.foreignPartnerInsights = JSON.parse(JSON.stringify(fInsights));
          }
          await setDoc(doc(db, 'analyses', analysisId), analysisDoc);
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.CREATE, 'analyses');
          return; // Stop execution if analysis creation fails
        }
          
        try {
          // Increment scansThisMonth
          await updateDoc(doc(db, 'users', user.uid), {
            scansThisMonth: (userData.scansThisMonth || 0) + 1
          });
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.UPDATE, 'users');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleScanNotice = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে স্ক্যান করার জন্য লগইন করুন।' : 'Please login to upload and scan tenders.');
      return;
    }

    if (user && userData) {
      let limit = 100000;
      if (userData.subscriptionTier === 'pro') limit = 1000000;
      if (userData.subscriptionTier === 'enterprise') limit = 5000000;
      
      if ((userData.tokensUsedThisMonth || 0) > limit) {
        alert(lang === 'bn' ? 'আপনার এআই কোটা শেষ হয়ে গেছে। দয়া করে আপগ্রেড করুন।' : 'Your AI Analysis Quota has been exceeded. Please upgrade to continue.');
        setShowUpgradeModal(true);
        return;
      }
    }

    setScanning(true);
    setError(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const extracted = await extractTenderData(base64, file.type, file);
      
      if (user && extracted.tokensUsed) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            tokensUsedThisMonth: increment(extracted.tokensUsed)
          });
        } catch(e) { console.error("Failed to update tokens", e); }
      }

      if (extracted.fullText) {
        setScannedText(extracted.fullText);
      }
      setFormData(prev => ({
        ...prev,
        title: extracted.title || prev.title,
        nature: extracted.nature || prev.nature,
        value: extracted.value !== undefined ? extracted.value : prev.value,
        method: extracted.method || prev.method,
        fullText: extracted.fullText || prev.fullText,
        // Report-header fields (Tender ID, Reference No, Procuring Entity, Closing, Tender
        // Security, Joint Venture): keep whatever Gemini extracted, null included — the
        // header renders directly from these, it must never re-derive them from raw text.
        tenderId: extracted.tenderId !== undefined ? extracted.tenderId : prev.tenderId,
        referenceNo: extracted.referenceNo !== undefined ? extracted.referenceNo : prev.referenceNo,
        procuringEntity: extracted.procuringEntity !== undefined ? extracted.procuringEntity : prev.procuringEntity,
        closingDateTime: extracted.closingDateTime !== undefined ? extracted.closingDateTime : prev.closingDateTime,
        tenderSecurity: extracted.tenderSecurity !== undefined ? extracted.tenderSecurity : prev.tenderSecurity,
        jointVenture: extracted.jointVenture !== undefined ? extracted.jointVenture : prev.jointVenture
      }));
    } catch (err) {
      setError('Failed to scan notice. Please enter details manually.');
    } finally {
      setScanning(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages: string[] = [];
      let processed = 0;
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          processed++;
          if (processed === files.length) {
            setQnaImages(prev => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qnaInput.trim() && qnaImages.length === 0) return;

    const userMsg = qnaInput.trim();
    const currentImages = [...qnaImages];
    
    setQnaInput('');
    setQnaImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const newMessage: any = { role: 'user', content: userMsg };
    if (currentImages.length > 0) {
      newMessage.images = currentImages;
    }

    if (user && userData) {
      let limit = 100000;
      if (userData.subscriptionTier === 'pro') limit = 1000000;
      if (userData.subscriptionTier === 'enterprise') limit = 5000000;
      
      if ((userData.tokensUsedThisMonth || 0) > limit) {
        alert(lang === 'bn' ? 'আপনার এআই কোটা শেষ হয়ে গেছে। দয়া করে আপগ্রেড করুন।' : 'Your AI Analysis Quota has been exceeded. Please upgrade to continue.');
        setShowUpgradeModal(true);
        return;
      }
    }

    setQnaMessages(prev => [...prev, newMessage]);
    setQnaLoading(true);

    try {
      const newMessages = [...qnaMessages, newMessage];
      const answer = await getQAResponse(newMessages, scannedText, lang);
      
      if (user && answer.tokensUsed) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            tokensUsedThisMonth: increment(answer.tokensUsed)
          });
        } catch(e) { console.error("Failed to update tokens", e); }
      }
      
      setQnaMessages(prev => [...prev, { role: 'assistant', content: answer.text }]);
    } catch (err) {
      setQnaMessages(prev => [...prev, { role: 'assistant', content: lang === 'bn' ? 'দুঃখিত, আপনার প্রশ্নের উত্তর দিতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।' : 'Sorry, I encountered an error while trying to answer.' }]);
    } finally {
      setQnaLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qnaMessages]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file || !user) return;

    setUploading(true);
    try {
      const fileId = Date.now().toString();
      const storageRef = ref(storage, `stds/${fileId}-${uploadData.file.name}`);
      await uploadBytes(storageRef, uploadData.file);
      const downloadURL = await getDownloadURL(storageRef);

      const stdId = Date.now().toString();
      await setDoc(doc(db, 'stds', stdId), {
        id: stdId,
        title: uploadData.title || uploadData.file.name,
        category: uploadData.category,
        method: uploadData.method,
        valueMin: Number(uploadData.valueMin),
        valueMax: Number(uploadData.valueMax),
        url: downloadURL,
        storagePath: storageRef.fullPath,
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      setUploadData({
        title: '',
        category: 'Goods',
        method: 'OTM',
        valueMin: 0,
        valueMax: 5000000,
        file: null
      });
    } catch (err) {
      console.error('Upload failed:', err);
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteStd = async (id: string) => {
    try {
      const stdDoc = stds.find((s: any) => s.id === id);
      if (stdDoc && stdDoc.storagePath) {
        const storageRef = ref(storage, stdDoc.storagePath);
        await deleteObject(storageRef).catch(e => console.error("Failed to delete file from storage", e));
      }
      await deleteDoc(doc(db, 'stds', id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert(`Delete failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(user ? 'dashboard' : 'landing')}>
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              <span className="text-blue-600 dark:text-blue-500">eGP</span>TenderHub
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                {lang === 'bn' ? 'বিদেশী অংশীদার' : 'Foreign Partner'}
              </span>
              <button
                onClick={() => { const next = !isForeignMode; trackEvent('foreign_partner_toggle', { enabled: next }); setIsForeignMode(next); }}
                className={cn(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
                  isForeignMode ? "bg-blue-900 dark:bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    isForeignMode ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>
            {user ? (
              <div className="relative group flex items-center gap-2 cursor-pointer z-50">
                <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" />
                <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.displayName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <span onClick={() => setView('profile')} className={cn("px-4 py-2.5 text-sm flex items-center gap-2 transition-colors cursor-pointer", view === 'profile' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700")}><Building2 className="w-4 h-4"/> {lang === 'bn' ? 'কোম্পানি প্রোফাইল' : 'Company Profile'}</span>
                  <span onClick={() => setView('pricing')} className={cn("px-4 py-2.5 text-sm flex items-center gap-2 transition-colors cursor-pointer", view === 'pricing' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700")}><TrendingUp className="w-4 h-4"/> {lang === 'bn' ? 'কাস্টম প্ল্যান' : 'Pricing & Upgrade'}</span>
                  <span onClick={() => setView('manage')} className={cn("px-4 py-2.5 text-sm flex items-center gap-2 transition-colors cursor-pointer", view === 'manage' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700")}><Settings className="w-4 h-4"/> {lang === 'bn' ? 'এসটিডি পরিচালনা' : 'Manage STDs'}</span>
                  <span onClick={() => setView('support')} className={cn("px-4 py-2.5 text-sm flex items-center gap-2 transition-colors cursor-pointer", view === 'support' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700")}><LifeBuoy className="w-4 h-4"/> {lang === 'bn' ? 'সাহায্য ও সাপোর্ট' : 'Help & Support'}</span>
                  <div className="border-t border-slate-100 dark:border-slate-700">
                    <button onClick={logout} className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"><X className="w-4 h-4"/> Logout</button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => { trackEvent('cta_click', { location: 'header' }); loginWithGoogle(); }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4 hidden sm:block" /> Login
              </button>
            )}
            
            {/* Desktop Navigation */}
            {view !== 'landing' && (
              <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
                <span 
                  onClick={() => setView('dashboard')}
                  className={cn(
                    "cursor-pointer transition-all py-5 border-b-2",
                    view === 'dashboard' ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400" : "hover:text-slate-900 dark:hover:text-white border-transparent"
                  )}
                >
                  {lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
                </span>
                <span 
                  onClick={() => setView('noticeboard')}
                  className={cn(
                    "cursor-pointer transition-all py-5 border-b-2",
                    view === 'noticeboard' ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400" : "hover:text-slate-900 dark:hover:text-white border-transparent"
                  )}
                >
                  {lang === 'bn' ? 'নোটিশ বোর্ড' : 'Notice Board'}
                </span>
                <span 
                  onClick={() => setView('history')}
                  className={cn(
                    "cursor-pointer transition-all py-5 border-b-2",
                    view === 'history' ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400" : "hover:text-slate-900 dark:hover:text-white border-transparent"
                  )}
                >
                  {lang === 'bn' ? 'ইতিহাস' : 'My Analyses'}
                </span>
                
                {/* Knowledge Base Dropdown */}
                <div className="relative group z-40">
                  <span className={cn(
                    "cursor-pointer transition-all py-5 border-b-2 flex items-center gap-1",
                    ['library', 'guide'].includes(view) ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400" : "hover:text-slate-900 dark:hover:text-white border-transparent"
                  )}>
                    {lang === 'bn' ? 'নলেজ বেস' : 'Knowledge Base'} <ChevronDown className="w-4 h-4" />
                  </span>
                  <div className="absolute top-[80%] -left-4 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
                    <span onClick={() => setView('guide')} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2"><BookOpen className="w-4 h-4 text-slate-400" /> {lang === 'bn' ? 'পিপিআর গাইড' : 'PPR 2025 Guide'}</span>
                    <span onClick={() => setView('library')} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /> {lang === 'bn' ? 'এসটিডি লাইব্রেরি' : 'STDs Library'}</span>
                    <span onClick={() => setView('manual')} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2"><BookOpen className="w-4 h-4 text-slate-400" /> {lang === 'bn' ? 'ইউজার ম্যানুয়াল' : 'User Manual'}</span>
                  </div>
                </div>

                {/* Tools Dropdown */}
                <div className="relative group z-40">
                  <span className={cn(
                    "cursor-pointer transition-all py-5 border-b-2 flex items-center gap-1",
                    ['qna', 'sop', 'sor'].includes(view) ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400" : "hover:text-slate-900 dark:hover:text-white border-transparent"
                  )}>
                    {lang === 'bn' ? 'টুলস' : 'Tools'} <ChevronDown className="w-4 h-4" />
                  </span>
                  <div className="absolute top-[80%] right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
                    <span onClick={() => setView('qna')} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2"><MessageSquare className="w-4 h-4 text-slate-400" /> {lang === 'bn' ? 'টেন্ডার প্রশ্নোত্তর' : 'Tender Q&A'}</span>
                    <span onClick={() => setView('sop')} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-slate-400" /> {lang === 'bn' ? 'এসওপি জেনারেটর' : 'Tender SOP'}</span>
                    <span onClick={() => setView('sor')} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-2"><Calculator className="w-4 h-4 text-slate-400" /> {lang === 'bn' ? 'স্মার্ট এস্টিমেট' : 'Smart Estimates'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ForeignPartnerDrawer 
        isOpen={isForeignMode} 
        onClose={() => setIsForeignMode(false)} 
        lang={lang}
        insights={foreignInsights}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <LandingPage loginWithGoogle={() => { trackEvent('cta_click', { location: 'landing' }); loginWithGoogle(); }} lang={lang} setView={setView} />
          ) : view === 'sop' ? (
            <TenderSOP result={result} lang={lang} />
          ) : view === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Input Section */}
              <div className="lg:col-span-4 space-y-6">
                <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{lang === 'bn' ? 'টেন্ডারের বিবরণ' : 'Tender Details'}</h2>
                    </div>
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                      {scanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                      {lang === 'bn' ? 'নোটিশ স্ক্যান করুন' : 'Scan Notice PDF'}
                      <input type="file" className="hidden" accept="application/pdf,image/*" onChange={handleScanNotice} disabled={scanning} />
                    </label>
                  </div>

                  <form onSubmit={handleAnalyze} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {lang === 'bn' ? 'টেন্ডারের শিরোনাম' : 'Tender Title'}
                      </label>
                      <textarea 
                        required
                        placeholder={lang === 'bn' ? 'যেমন: অফিস স্টেশনারি সরবরাহ' : 'e.g. Supply of Office Stationery'}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm min-h-[80px] resize-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          {lang === 'bn' ? 'প্রকৃতি' : 'Nature'}
                        </label>
                        <select 
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm text-slate-900 dark:text-white transition-colors"
                          value={formData.nature}
                          onChange={e => setFormData({...formData, nature: e.target.value as any})}
                        >
                          <option value="Goods">{lang === 'bn' ? 'পণ্য (Goods)' : 'Goods'}</option>
                          <option value="Works">{lang === 'bn' ? 'পূর্ত কাজ (Works)' : 'Works'}</option>
                          <option value="Physical Services">{lang === 'bn' ? 'ভৌত সেবা (Physical Services)' : 'Physical Services'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          {lang === 'bn' ? 'পদ্ধতি' : 'Method'}
                        </label>
                        <select 
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm text-slate-900 dark:text-white transition-colors"
                          value={formData.method}
                          onChange={e => setFormData({...formData, method: e.target.value as any})}
                        >
                          <option value="OTM">OTM</option>
                          <option value="LTM">LTM</option>
                          <option value="RFQ">RFQ</option>
                          <option value="DPM">DPM</option>
                          <option value="Framework">Framework</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        {lang === 'bn' ? 'আনুমানিক মূল্য (টাকা)' : 'Estimated Value (BDT)'}
                      </label>
                      <input 
                        type="number"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm text-slate-900 dark:text-white transition-colors"
                        value={formData.value ?? ''}
                        onChange={e => setFormData({...formData, value: e.target.value === '' ? null : Number(e.target.value)})}
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ClipboardCheck className="w-5 h-5" />
                      )}
                      {lang === 'bn' ? 'যোগ্যতা বিশ্লেষণ করুন' : 'Analyze Eligibility'}
                    </button>
                  </form>
                </section>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50 transition-colors">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                      <p className="font-semibold mb-1">Analyst Tip</p>
                      Analysis is based on the latest **BPPA/PPR 2025** Standard Tender Documents. Ensure your Trade License and Tax Clearance are up to date.
                    </div>
                  </div>
                </div>
              </div>

              {/* Result Section */}
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {!result && !loading && !error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-full flex flex-col gap-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                         {/* Profile Snapshot Widget */}
                         <div 
                           onClick={() => setView('profile')}
                           className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                         >
                           <div className="flex items-center gap-3 mb-6">
                             <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                               <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                             </div>
                             <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                               {lang === 'bn' ? 'প্রোফাইল স্ন্যাপশট' : 'Profile Snapshot'}
                             </h3>
                           </div>
                           <div className="space-y-3 flex-1">
                             <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                               <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Liquid Assets</span>
                               <span className="font-bold text-slate-900 dark:text-white">৳{Number(companyProfile.liquidAssets || 0).toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                               <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Similar Exp.</span>
                               <span className="font-bold text-slate-900 dark:text-white">৳{Number(companyProfile.similarWorkExperience || 0).toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                               <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tender Cap.</span>
                               <span className="font-bold text-slate-900 dark:text-white">৳{Number(companyProfile.tenderCapacity || 0).toLocaleString()}</span>
                             </div>
                           </div>
                           <div className="mt-5 flex items-center justify-between text-sm font-bold text-blue-600 dark:text-blue-400">
                             <span>{lang === 'bn' ? 'আপডেট করুন' : 'Update Credentials'}</span>
                             <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                           </div>
                         </div>

                         {/* Quick SoR Calculation Widget */}
                         <div 
                           onClick={() => setView('sor')}
                           className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
                         >
                           {/* Decorative background element */}
                           <div className="absolute -right-6 -top-6 text-slate-700/30 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                             <Calculator className="w-40 h-40" />
                           </div>
                           
                           <div className="relative z-10">
                             <div className="flex items-center gap-3 mb-4">
                               <div className="p-3 bg-slate-800 rounded-xl border border-slate-600">
                                 <Calculator className="w-6 h-6 text-emerald-400" />
                               </div>
                               <h3 className="font-bold text-lg text-white">
                                {lang === 'bn' ? 'কুইক SoR ক্যালকুলেটর' : 'Quick SoR Calculator'}
                               </h3>
                             </div>
                             <p className="text-slate-400 text-sm leading-relaxed mb-6">
                               {lang === 'bn' ? 'PWD SoR 2022 এর সরকারি রেট ব্যবহার করে আপনার টেন্ডারের BoQ এবং এস্টিমেট জেনারেট করুন।' : 'Jump directly into the PWD rate calculator to generate a priced BoQ matrix instantly.'}
                             </p>
                           </div>
                           
                           <div className="relative z-10 mt-auto flex items-center justify-between text-sm font-bold text-emerald-400">
                             <span>{lang === 'bn' ? 'ক্যালকুলেট করুন' : 'Calculate Estimates'}</span>
                             <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                           </div>
                         </div>
                      </div>

                      {/* Recent Scans Widget */}
                      <div 
                        onClick={() => setView('history')}
                        className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-3">
                             <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                               <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                             </div>
                             <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {lang === 'bn' ? 'সাম্প্রতিক বিশ্লেষণ' : 'Recent Analyses'}
                             </h3>
                          </div>
                          <span className="text-sm font-bold text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center">
                            {lang === 'bn' ? 'সব দেখুন' : 'View All'} <ChevronRight className="w-4 h-4 ml-1" />
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           {/* Placeholder skeleton cards to represent past analyses */}
                           {[
                             { title: 'Supply of Networking Eq...', date: '2 days ago', score: 85 },
                             { title: 'Construction of 5-Story...', date: '1 week ago', score: 42 },
                             { title: 'Procurement of Medical...', date: '2 weeks ago', score: 91 }
                           ].map((item, i) => (
                             <div key={i} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 flex flex-col justify-between group/card hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                                <div>
                                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center mb-3">
                                    <ClipboardCheck className="w-4 h-4 text-slate-400 dark:text-slate-300" />
                                  </div>
                                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{item.title}</p>
                                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{item.date}</p>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                  <div className={cn("w-2 h-2 rounded-full", item.score >= 80 ? "bg-emerald-500" : "bg-amber-500")} />
                                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Score: {item.score}</span>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {loading && (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200"
                    >
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                      <p className="text-lg font-medium text-slate-900">Scanning STDs Library...</p>
                      <p className="text-sm text-slate-500">Comparing criteria against PPR 2025 clauses</p>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div 
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-800 flex gap-3"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="text-sm font-medium">{error}</p>
                    </motion.div>
                  )}

                  {result && !loading && (() => {
                    // Header fields render DIRECTLY from the same server-side Gemini extraction
                    // that populates the criterion cards (extractTenderData in tenderService.ts,
                    // stored on formData). No regex/label-scanning on raw text, and no invented
                    // fallback values.
                    const notStated = lang === 'bn' ? 'নথিতে উল্লেখ নেই' : 'Not stated in document';
                    const notCaptured = lang === 'bn' ? 'সংরক্ষিত হয়নি — পুনরায় বিশ্লেষণ করুন' : 'Not captured — re-run analysis to populate';

                    // A record saved BEFORE this fix never had these keys written to Firestore at
                    // all (they're `undefined`, not `null`) because the old code dropped them before
                    // saving. That's a different case from a fresh extraction that ran and genuinely
                    // found nothing (`null`): "Not stated in document" would falsely claim the source
                    // document lacked the data, when really this app just never captured it. Detect
                    // that legacy case and label it honestly instead — no Gemini call is triggered.
                    const isLegacyRecord = formData
                      && formData.tenderId === undefined
                      && formData.referenceNo === undefined
                      && formData.procuringEntity === undefined
                      && formData.closingDateTime === undefined
                      && formData.tenderSecurity === undefined;
                    const missingLabel = isLegacyRecord ? notCaptured : notStated;

                    const formatTenderSecurity = (sec: TenderData['tenderSecurity']): string => {
                      if (!sec) return missingLabel;
                      const parts: string[] = [];
                      if (sec.bdt != null) parts.push(`BDT ${sec.bdt.toLocaleString('en-US')}`);
                      if (sec.foreign && sec.foreign.currency && sec.foreign.amount != null) {
                        parts.push(`(${sec.foreign.currency} ${sec.foreign.amount.toLocaleString('en-US')})`);
                      }
                      if (parts.length > 0) return parts.join(' ');
                      if (sec.verbatim) return sec.verbatim;
                      return missingLabel;
                    };

                    const jv = formData?.jointVenture;
                    const jvLine = jv && jv.clausePresent
                      ? {
                          text: `Joint Venture${jv.clauseRef ? ` (${jv.clauseRef})` : ''}: ${
                            jv.allowed === true ? 'ALLOWED' : jv.allowed === false ? 'NOT ALLOWED' : notStated
                          }`,
                          textBn: `যৌথ উদ্যোগ${jv.clauseRef ? ` (${jv.clauseRef})` : ''}: ${
                            jv.allowed === true ? 'অনুমোদিত' : jv.allowed === false ? 'অনুমোদিত নয়' : notStated
                          }`,
                          allowed: jv.allowed,
                        }
                      : null;

                    const info = {
                      tenderId: formData?.tenderId || missingLabel,
                      refAndDate: formData?.referenceNo || missingLabel,
                      procuringEntity: formData?.procuringEntity || missingLabel,
                      brief: formData?.title || result?.tenderSubject || notStated,
                      closing: formData?.closingDateTime || missingLabel,
                      security: formatTenderSecurity(formData?.tenderSecurity),
                      jvLine
                    };

                    const isClauseSatisfied = (clauseText: string) => {
                      const lowerClause = clauseText.toLowerCase();
                      const failedItems = (result.companyMatch || []).filter((m: any) => m.met === false || m.met === 'data-needed');
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

                    const isEligible = result.eligibilityLabel
                      ? !result.eligibilityLabel.includes('Not Eligible')
                      : result.score >= 50;

                    return (
                      <motion.div 
                        key="result"
                        id="analysisReport"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6 print-container"
                      >
                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm no-print transition-colors duration-300">
                          <h2 className="text-xl font-bold dark:text-white">Analysis Report</h2>
                          <div className="flex gap-2">
                            <button onClick={async () => {
                              if (typeof document !== 'undefined' && 'fonts' in document) {
                                await document.fonts.ready;
                              }
                              window.print();
                            }} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-colors">
                              <Download className="w-4 h-4" />
                              {lang === 'bn' ? 'ডাউনলোড' : 'Download PDF'}
                            </button>
                            <button onClick={async () => {
                              if (typeof document !== 'undefined' && 'fonts' in document) {
                                await document.fonts.ready;
                              }
                              window.print();
                            }} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-slate-800 dark:hover:bg-white transition-colors">
                              <Printer className="w-4 h-4" />
                              {lang === 'bn' ? 'প্রিন্ট করুন' : 'Print Report'}
                            </button>
                          </div>
                        </div>

                        {/* Title & Light Info Box */}
                        <div className="space-y-4 print-avoid-break">
                          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                            <h1 className="text-2xl font-extrabold text-headings-navy dark:text-blue-400 tracking-tight">
                              {lang === 'bn' ? 'Tender Eligibility Analysis / দরপত্র যোগ্যতা विश्लेषण' : 'Tender Eligibility Analysis'}
                            </h1>
                            <p className="text-xs font-semibold text-accent-blue mt-1">
                              {lang === 'bn' ? 'পিপিআর ২০২৫ এবং এসটিডি গাইডলাইন পর্যালোচনা রিপোর্ট' : 'PPR 2025 & STD Clause-by-Clause Evaluation Report'}
                            </p>
                          </div>

                          <div className="bg-[#f2f7fa] dark:bg-slate-900/60 p-5 rounded-2xl border border-sky-100/60 dark:border-slate-800 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Tender ID / দরপত্র আইডি</span>
                                <p className="font-extrabold text-headings-navy dark:text-blue-300 text-sm">
                                  {info.tenderId === missingLabel ? info.tenderId : `#${info.tenderId}`}
                                </p>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Ref + Date / রেফারেন্স ও তারিখ</span>
                                <p className="font-extrabold text-headings-navy dark:text-slate-200 text-sm">
                                  {info.refAndDate}
                                </p>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Procuring Entity / ক্রয়কারী প্রতিষ্ঠান</span>
                                <p className="font-extrabold text-headings-navy dark:text-slate-200 text-sm">
                                  {info.procuringEntity}
                                </p>
                              </div>
                              <div className="space-y-0.5 lg:col-span-2">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Brief / সংক্ষিপ্ত তথ্য</span>
                                <p className="font-medium text-headings-navy dark:text-slate-200 text-sm">
                                  {info.brief}
                                </p>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Closing / বন্ধের সময়</span>
                                <p className="font-extrabold text-slate-705 dark:text-slate-200 text-sm">
                                  {info.closing}
                                </p>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Tender Security / দরপত্র জামানত</span>
                                <p className="font-semibold text-slate-705 dark:text-slate-200 text-sm">
                                  {info.security}
                                </p>
                              </div>
                            </div>
                            
                            {info.jvLine && (
                            <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={cn("w-1.5 h-1.5 rounded-full", info.jvLine.allowed === false ? "bg-fail-red" : "bg-emerald-500")} />
                                <span className={cn("text-xs font-black uppercase tracking-wider", info.jvLine.allowed === false ? "text-fail-red" : "text-emerald-600 dark:text-emerald-400")}>
                                  {lang === 'bn' ? info.jvLine.textBn : info.jvLine.text}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">PPR 2025 compliant</span>
                            </div>
                            )}
                          </div>
                        </div>

                        {/* Two Cards Side by Side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-avoid-break">
                          {/* Eligibility Score Card */}
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
                            <span className="text-[11px] font-black text-headings-navy dark:text-slate-400 uppercase tracking-widest mb-1.5 block">
                              {lang === 'bn' ? 'যোগ্যতার স্কোর' : 'ELIGIBILITY SCORE'}
                            </span>
                            
                            <div className="flex items-baseline justify-center">
                              <span className={cn(
                                "text-5xl font-black tracking-tight",
                                isEligible ? "text-pass-green" : "text-fail-red"
                              )}>
                                {result.score}
                              </span>
                              <span className="text-xl font-bold text-slate-400 dark:text-slate-500 ml-0.5">/100</span>
                            </div>

                            <div className={cn(
                              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm mt-3",
                              isEligible 
                                ? "bg-pass-green/10 text-pass-green border border-pass-green/20" 
                                : "bg-fail-red/10 text-fail-red border border-fail-red/20"
                            )}>
                              {isEligible ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-pass-green" />
                                  <span>{lang === 'bn' ? 'যোগ্য / Eligible' : 'Eligible'}</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-fail-red" />
                                  <span>
                                    {result.eligibilityLabel === 'Not Eligible (knock-out)'
                                      ? (lang === 'bn' ? 'যোগ্য নয় (বাধ্যতামূলক শর্ত পূরণ হয়নি) / Not Eligible (Knock-out)' : 'Not Eligible (Knock-out)')
                                      : (lang === 'bn' ? 'অযোগ্য / Not Eligible' : 'Not Eligible / অযোগ্য')}
                                  </span>
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
                                <p className="text-xl font-extrabold text-accent-blue tracking-tight">
                                  {result.stdUsed || "e-PW2A"}
                                </p>
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
                              <button onClick={() => setView('profile')} className="text-xs font-bold text-accent-blue hover:underline no-print">
                                {lang === 'bn' ? 'সম্পাদনা করুন' : 'Update Profile'}
                              </button>
                            </div>

                            {/* Bilingual Disclaimer: strategic self-evaluation aid, not the PE's official scoring scheme */}
                            <div className="bg-sky-50 dark:bg-sky-950/25 p-4 rounded-2xl border border-sky-100 dark:border-sky-900/50 flex items-start gap-3 print-avoid-break">
                              <span className="text-lg shrink-0 mt-0.5">🛡️</span>
                              <div className="space-y-1.5">
                                <h4 className="text-xs font-black text-sky-900 dark:text-sky-300 uppercase tracking-wider">
                                  Bidder-Facing Decision Guidance / বিডার-মুখী সিদ্ধান্ত নির্দেশিকা
                                </h4>
                                <p className="text-xs text-sky-750 dark:text-sky-400 leading-relaxed font-semibold">
                                  This 3-tier severity model (Critical / Important / Minor) is a strategic self-evaluation aid to help you assess bidding risk and plan gap-closing actions. It is NOT the procuring entity's official scoring or evaluation scheme.
                                </p>
                                <p className="text-xs text-sky-750 dark:text-sky-400 leading-relaxed font-semibold">
                                  এই ৩-স্তরের গুরুত্ব মডেল (গুরুত্বপূর্ণ / প্রয়োজনীয় / সাধারণ) আপনার দরপত্র ঝুঁকি মূল্যায়ন ও ঘাটতি পূরণের পরিকল্পনার জন্য একটি কৌশলগত স্ব-মূল্যায়ন সহায়ক। এটি ক্রয়কারী প্রতিষ্ঠানের আনুষ্ঠানিক মূল্যায়ন বা নম্বর প্রদান পদ্ধতি নয়।
                                </p>
                              </div>
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
                                      "flex flex-col md:flex-row md:items-stretch justify-between gap-6 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all print-avoid-break",
                                      isMet ? "border-l-4 border-l-pass-green" : "border-l-4 border-l-fail-red"
                                    )}
                                  >
                                    <div className="flex-1 flex flex-col justify-between space-y-2">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h4 className="font-extrabold text-headings-navy dark:text-gray-100 text-sm">
                                            {match.requirement}
                                          </h4>
                                          {isMet ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-pass-green/10 text-pass-green border border-pass-green/20">
                                              ✓ {lang === 'bn' ? 'মেলেছে' : 'MET'}
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-fail-red/10 text-fail-red border border-fail-red/20">
                                              ✗ {lang === 'bn' ? 'মেলেনি' : 'NOT MET'}
                                            </span>
                                          )}

                                          {/* Severity Tier Badge */}
                                          {match.severity && (
                                            <span className={cn(
                                              "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                                              match.severity === 'CRITICAL'
                                                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
                                                : match.severity === 'IMPORTANT'
                                                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                                                  : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                            )}>
                                              {match.severity === 'CRITICAL'
                                                ? (lang === 'bn' ? 'গুরুত্বপূর্ণ / Critical (Knock-out)' : 'Critical (Knock-out)')
                                                : match.severity === 'IMPORTANT'
                                                  ? (lang === 'bn' ? 'প্রয়োজনীয় / Important (Compensable)' : 'Important (Compensable)')
                                                  : (lang === 'bn' ? 'সাধারণ / Minor (Quality)' : 'Minor (Quality)')}
                                            </span>
                                          )}
                                        </div>

                                        {plainNote && (
                                          <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                                            {plainNote}
                                          </p>
                                        )}
                                      </div>

                                      {snippetText && (
                                        <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50 mt-1">
                                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">TDS Evidence Snippet</span>
                                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic font-mono leading-relaxed">
                                            "{snippetText}"
                                          </p>
                                        </div>
                                      )}

                                      {!isMet && match.howToClose && (
                                        <div className="bg-amber-500/5 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 mt-2">
                                          <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest block mb-1">
                                            💡 {lang === 'bn' ? 'এই ঘাটতি পূরণের উপায় / How to close this gap' : 'How to close this gap'}
                                          </span>
                                          <p className="text-xs text-amber-950 dark:text-amber-350 font-bold leading-relaxed">
                                            {match.howToClose}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Right Stacked Box Panel */}
                                    <div className="flex md:flex-col gap-2 min-w-full md:min-w-[140px] md:max-w-[170px] shrink-0 justify-end md:justify-center">
                                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 p-2.5 rounded-xl text-center flex-1 md:flex-initial">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">
                                          {lang === 'bn' ? 'প্রয়োজনীয়' : 'REQUIRED'}
                                        </span>
                                        <span className="font-extrabold text-[11px] text-slate-700 dark:text-slate-300 block break-words">
                                          {match.requiredValue}
                                        </span>
                                      </div>
                                      <div className={cn(
                                        "border p-2.5 rounded-xl text-center flex-1 md:flex-initial",
                                        isMet 
                                          ? "bg-pass-green/5 border-pass-green/20 text-pass-green" 
                                          : "bg-fail-red/5 border-fail-red/20 text-fail-red"
                                      )}>
                                        <span className="text-[9px] font-black uppercase tracking-wider block mb-0.5 opacity-85">
                                          {lang === 'bn' ? 'আপনার আছে' : 'YOU HAVE'}
                                        </span>
                                        <span className="font-black text-[11px] block break-words">
                                          {match.userValue}
                                        </span>
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
                            <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-semibold whitespace-pre-line">
                              {result.summary}
                            </p>
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
                                      "flex items-start gap-3 p-3.5 bg-white dark:bg-slate-900 rounded-xl border transition-all print-avoid-break",
                                      satisfied 
                                        ? "border-pass-green/25 hover:border-pass-green/35" 
                                        : "border-fail-red/25 hover:border-fail-red/35"
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
                                      "text-xs font-bold leading-normal",
                                      satisfied ? "text-slate-800 dark:text-slate-200" : "text-slate-600 dark:text-slate-300"
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
                              {lang === 'bn' ? 'জয়ী হওয়ার কর্মকৌশল' : 'Winning Strategy'}
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
                              <div className="prose dark:prose-invert prose-xs max-w-none text-slate-800 dark:text-slate-300 leading-relaxed font-semibold">
                                <ReactMarkdown>{result.winningStrategy}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : view === 'history' ? (
            <MyAnalyses user={user} lang={lang} setView={setView} setResult={setResult} setFormData={setFormData} />
          ) : view === 'pricing' ? (
            <PricingPage lang={lang} userData={userData} onUpgradeClick={(tier) => setPaymentModalTier(tier)} />
          ) : view === 'library' ? (
            <STDsLibrary />
          ) : view === 'guide' ? (
            <PPRGuide />
          ) : view === 'qna' ? (
            <TenderQnA 
              scannedText={scannedText}
              qnaMessages={qnaMessages}
              qnaLoading={qnaLoading}
              qnaInput={qnaInput}
              setQnaInput={setQnaInput}
              handleAskQuestion={handleAskQuestion}
              messagesEndRef={messagesEndRef}
              lang={lang}
              qnaImages={qnaImages}
              setQnaImages={setQnaImages}
              fileInputRef={fileInputRef}
              handleImageChange={handleImageChange}
            />
          ) : view === 'sor' ? (
            <SoRCopilot lang={lang} userData={userData} />
          ) : view === 'profile' ? (
            <>
              <AICreditWidget userData={userData} lang={lang} setView={setView} />
              <CompanyProfileSettings profile={companyProfile} onSave={saveCompanyProfile} lang={lang} />
            </>
          ) : view === 'manual' ? (
            <UserManual lang={lang} />
          ) : view === 'support' ? (
            <SupportDesk user={user} lang={lang} />
          ) : view === 'blog' ? (
            <Blog lang={lang} />
          ) : view === 'terms' ? (
            <TermsAndConditions lang={lang} />
          ) : view === 'noticeboard' ? (
            <NoticeBoard lang={lang} />
          ) : (
            <ManageSTDs 
              uploadData={uploadData}
              setUploadData={setUploadData}
              handleUpload={handleUpload}
              loading={loading}
              stds={stds}
              handleDeleteStd={handleDeleteStd}
              userData={userData}
              lang={lang}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Global Footer (Hide on Landing Page) */}
      {view !== 'landing' && (
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center pb-24 md:pb-12">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.2em] mb-4">
            Powered by eGPTenderHub Intelligence Engine • PPR 2025 Compliant
          </p>
          <div className="flex justify-center items-center gap-6 text-sm text-slate-500">
            <button onClick={() => setView('terms')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {lang === 'bn' ? 'শর্তাবলী' : 'Terms & Conditions'}
            </button>
            <span>•</span>
            <button onClick={() => setView('support')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {lang === 'bn' ? 'সাপোর্ট' : 'Support'}
            </button>
          </div>
        </footer>
      )}

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {lang === 'bn' ? 'স্ক্যান লিমিট শেষ!' : 'Scan Limit Reached!'}
                </h3>
                <p className="text-slate-500">
                  {lang === 'bn' 
                    ? 'আপনি এই মাসে আপনার ২টি ফ্রি স্ক্যান ব্যবহার করেছেন। আনলিমিটেড স্ক্যান এবং ফুল এআই বিশ্লেষণের জন্য প্রো প্ল্যানে আপগ্রেড করুন।' 
                    : 'You have used your 2 free scans for this month. Upgrade to the Pro plan for unlimited scans and full AI analysis.'}
                </p>
                <div className="pt-4 flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      setShowUpgradeModal(false);
                      setView('pricing');
                    }}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    {lang === 'bn' ? 'আপগ্রেড করুন' : 'Upgrade to Pro'}
                  </button>
                  <button 
                    onClick={() => setShowUpgradeModal(false)}
                    className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                  >
                    {lang === 'bn' ? 'পরে' : 'Maybe Later'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PaymentModal 
        isOpen={!!paymentModalTier}
        onClose={() => setPaymentModalTier(null)}
        tierContent={paymentModalTier}
        user={user}
        lang={lang}
      />


      {/* Mobile Bottom Navigation - 4 Core Tabs */}
      {view !== 'landing' && (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 px-2 py-2 flex items-center justify-around shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.3)] transition-colors duration-300">
        <button 
          onClick={() => { setView('dashboard'); setActiveMobileMenu(null); }}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors",
            view === 'dashboard' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <LayoutDashboard className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">{lang === 'bn' ? 'হোম' : 'Home'}</span>
        </button>
        <button 
          onClick={() => { setView('history'); setActiveMobileMenu(null); }}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors",
            view === 'history' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <History className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-semibold">{lang === 'bn' ? 'ইতিহাস' : 'History'}</span>
        </button>
        
        {/* Tools Menu Trigger for Mobile */}
        <div className="relative flex items-center justify-center z-50">
          <button 
            onClick={() => setActiveMobileMenu(prev => prev === 'tools' ? null : 'tools')}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors outline-none",
              ['qna', 'sop', 'sor', 'library', 'guide'].includes(view) || activeMobileMenu === 'tools' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Wrench className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-semibold">{lang === 'bn' ? 'টুলস' : 'Tools'}</span>
          </button>
          
          <div className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl transition-all flex flex-col overflow-hidden",
            activeMobileMenu === 'tools' ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          )}>
            <span onClick={() => { setView('noticeboard'); setActiveMobileMenu(null); }} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700 flex items-center gap-2 cursor-pointer"><Newspaper className="w-4 h-4"/> Notice Board</span>
            <span onClick={() => { setView('qna'); setActiveMobileMenu(null); }} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700 flex items-center gap-2 cursor-pointer"><MessageSquare className="w-4 h-4"/> Q&A</span>
            <span onClick={() => { setView('sop'); setActiveMobileMenu(null); }} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700 flex items-center gap-2 cursor-pointer"><ClipboardCheck className="w-4 h-4"/> SOP Gen</span>
            <span onClick={() => { setView('sor'); setActiveMobileMenu(null); }} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700 flex items-center gap-2 cursor-pointer"><Calculator className="w-4 h-4"/> Estimates</span>
            <span onClick={() => { setView('guide'); setActiveMobileMenu(null); }} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700 flex items-center gap-2 cursor-pointer"><BookOpen className="w-4 h-4"/> PPR Guide</span>
            <span onClick={() => { setView('library'); setActiveMobileMenu(null); }} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700 flex items-center gap-2 cursor-pointer"><Building2 className="w-4 h-4"/> Library</span>
            <span onClick={() => { setView('manual'); setActiveMobileMenu(null); }} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700 flex items-center gap-2 cursor-pointer"><BookOpen className="w-4 h-4"/> Manual</span>
          </div>
        </div>

        {/* Profile Menu Trigger for Mobile */}
        <div className="relative flex items-center justify-center z-50">
          <button 
            onClick={() => setActiveMobileMenu(prev => prev === 'profile' ? null : 'profile')}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors outline-none",
              ['profile', 'pricing', 'manage'].includes(view) || activeMobileMenu === 'profile' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            {user ? (
               <img src={user.photoURL || ''} alt="Profile" className="w-5 h-5 rounded-full mb-1 border border-slate-200 dark:border-slate-700" />
            ) : (
               <UserIcon className="w-5 h-5 mb-1" />
            )}
            <span className="text-[10px] font-semibold">{lang === 'bn' ? 'প্রোফাইল' : 'Profile'}</span>
          </button>
          
          <div className={cn(
            "absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl transition-all flex flex-col overflow-hidden",
            activeMobileMenu === 'profile' ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          )}>
            {user ? (
              <>
                <span onClick={() => { setView('profile'); setActiveMobileMenu(null); }} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700 flex items-center gap-2 cursor-pointer"><Building2 className="w-4 h-4"/> Profile</span>
                <span onClick={() => { setView('pricing'); setActiveMobileMenu(null); }} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700 flex items-center gap-2 cursor-pointer"><TrendingUp className="w-4 h-4"/> Pricing</span>
                <span onClick={() => { setView('manage'); setActiveMobileMenu(null); }} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700 flex items-center gap-2 cursor-pointer"><Settings className="w-4 h-4"/> STDs</span>
                <span onClick={() => { setView('support'); setActiveMobileMenu(null); }} className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700 flex items-center gap-2 cursor-pointer"><LifeBuoy className="w-4 h-4"/> Support</span>
                <span onClick={() => { logout(); setActiveMobileMenu(null); }} className="px-4 py-3 text-sm text-red-600 active:bg-red-50 dark:active:bg-red-900/20 flex items-center gap-2 cursor-pointer"><X className="w-4 h-4"/> Logout</span>
              </>
            ) : (
              <span onClick={() => { loginWithGoogle(); setActiveMobileMenu(null); }} className="px-4 py-3 text-sm text-blue-600 font-bold active:bg-blue-50 dark:active:bg-blue-900/20 flex items-center gap-2 cursor-pointer"><UserIcon className="w-4 h-4"/> Login</span>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
