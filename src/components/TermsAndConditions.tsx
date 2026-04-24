import React from 'react';
import { motion } from 'motion/react';
import { Scale, ShieldCheck, AlertTriangle, ScrollText } from 'lucide-react';

interface Props {
  lang: 'en' | 'bn';
}

export const TermsAndConditions: React.FC<Props> = ({ lang }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8 py-8 px-4 sm:px-6"
    >
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-2xl">
          <Scale className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'শর্তাবলী ও নীতিমালা' : 'Terms and Conditions'}
          </h2>
          <p className="text-slate-500 mt-1">
            {lang === 'bn' ? 'সর্বশেষ আপডেট: এপ্রিল ২০২৬' : 'Last Updated: April 2026'}
          </p>
        </div>
      </div>

      <div className="space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed">
        
        {/* Section 1 */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            1. {lang === 'bn' ? 'শর্তাবলীর সম্মতি' : 'Acceptance of Terms'}
          </h3>
          <p>
            {lang === 'bn' 
              ? 'eGPTenderHub ব্যবহার করার মাধ্যমে আপনি নিম্নলিখিত শর্তাবলী মেনে নিতে সম্মত হচ্ছেন। আপনি যদি এই শর্তাবলীর কোনো অংশের সাথে দ্বিমত পোষণ করেন, তবে অনুগ্রহ করে আমাদের পরিষেবা ব্যবহার করা থেকে বিরত থাকুন।' 
              : 'By accessing and using eGPTenderHub, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use our service.'}
          </p>
        </section>

        {/* Section 2: The Core FUP Logic */}
        <section className="bg-blue-50 dark:bg-slate-900 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/30 shadow-sm">
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            2. {lang === 'bn' ? 'ন্যায্য ব্যবহার নীতি (FUP) এবং AI কোটা' : 'Fair Usage Policy (FUP) & AI Compute Quotas'}
          </h3>
          <div className="space-y-4">
            <p>
              <strong>2.1 AI Processing Limitations:</strong> {lang === 'bn' 
                ? 'eGPTenderHub জটিল টেন্ডার ডকুমেন্ট বিশ্লেষণের জন্য উন্নত AI মডেল ব্যবহার করে। সকল ব্যবহারকারীর জন্য উচ্চ গতির পারফরম্যান্স নিশ্চিত করতে, প্রতিটি সাবস্ক্রিপশন টিয়ার (Free, Pro, Enterprise) একটি মাসিক "AI কম্পিউটিং ক্রেডিট (Token)" লিমিটের অধীনে পরিচালিত হয়।' 
                : 'eGPTenderHub utilizes advanced AI models to analyze complex tender documents. To ensure high-speed performance for all users, every subscription tier (Free, Pro, Enterprise) is governed by a monthly "AI Computing Credit (Token)" limit.'}
            </p>
            <p>
              <strong>2.2 Quota Exhaustion:</strong> {lang === 'bn' 
                ? 'যদি কোনো ব্যবহারকারী একটি বিলিং চক্রের মধ্যে তার বরাদ্দকৃত AI টোকেন শেষ করে ফেলেন, তবে তার AI বিশ্লেষণ বৈশিষ্ট্যগুলি সাময়িকভাবে পজ হয়ে যাবে। বিশ্লেষণ চালিয়ে যেতে ব্যবহারকারীকে "কোটা টপ-আপ" কিনতে হবে অথবা উচ্চতর টিয়ারে আপগ্রেড করতে হবে।' 
                : 'If a user exhausts their allocated AI tokens within a billing cycle, their AI analysis features will be temporarily paused. The user will be required to either purchase a "Quota Top-up" or upgrade to a higher tier to resume regular analysis.'}
            </p>
            <p>
              <strong>2.3 Protection Against Abuse:</strong> {lang === 'bn' 
                ? 'সাবস্ক্রিপশন শুধুমাত্র একটি কোম্পানির ব্যবহারের জন্য। যদি আমাদের স্বয়ংক্রিয় সিস্টেম অস্বাভাবিক, স্বয়ংক্রিয়, বা শোষণমূলক ব্যবহারের ধরণ সনাক্ত করে—যেমন একাধিক অনিবন্ধিত সত্তার মধ্যে অ্যাকাউন্ট শেয়ার করা বা প্ল্যাটফর্ম থেকে ডেটা স্ক্র্যাপ করতে বট ব্যবহার করা—তাহলে eGPTenderHub কোনো পূর্ব নোটিশ ছাড়াই প্রসেসিং স্পিড কমানোর, সাময়িকভাবে অ্যাকাউন্ট স্থগিত করার, বা ব্যবহারকারীকে একটি কাস্টম এন্টারপ্রাইজ API প্ল্যানে আপগ্রেড করতে বাধ্য করার অধিকার সংরক্ষণ করে।' 
                : 'Subscriptions are strictly for single-company use. If our automated systems detect abnormal, automated, or exploitative usage patterns—such as account sharing across multiple unregistered entities or using bots to aggressively scrape the platform—eGPTenderHub reserves the right to throttle processing speeds, temporarily suspend the account, or legally require the user to upgrade to a Custom Enterprise API Plan without prior notice.'}
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-purple-500" />
            3. {lang === 'bn' ? 'দায়বদ্ধতার সীমাবদ্ধতা' : 'Limitation of Liability'}
          </h3>
          <p>
            {lang === 'bn'
              ? 'eGPTenderHub একটি এআই-সহায়ক টুল। আমরা ৯৯% সঠিক ও নির্ভুল ফলাফল দেওয়ার চেষ্টা করি, কিন্তু টেন্ডারের কোনো আর্থিক ক্ষতি বা আইনি ভুলের জন্য eGPTenderHub দায়ী থাকবে না। বিড জমা দেওয়ার আগে সর্বদা ম্যানুয়ালি যাচাই করার পরামর্শ দেওয়া হচ্ছে।'
              : 'eGPTenderHub is an AI-assisted support tool. While we strive for absolute accuracy in data extraction and procurement guidance, eGPTenderHub shall not be held legally or financially liable for any direct, indirect, incidental, or consequential damages resulting from bidding errors, losses, or rejected tenders. Users are advised to manually verify critical figures before final submission.'}
          </p>
        </section>

      </div>
    </motion.div>
  );
};
