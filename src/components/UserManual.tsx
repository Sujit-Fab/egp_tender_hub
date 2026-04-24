import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Upload, FileCheck, Search, Calculator, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const UserManual = ({ lang }: { lang: 'en' | 'bn' }) => {
  const manuals = [
    {
      icon: <Upload className="w-6 h-6 text-blue-500" />,
      title: lang === 'bn' ? 'কীভাবে টেন্ডার নোটিশ স্ক্যান করবেন' : 'How to Scan a Tender Notice',
      description: lang === 'bn' ? 'ড্যাশবোর্ড থেকে "Scan Notice PDF" বাটনে ক্লিক করে ই-জিপি থেকে ডাউনলোড করা e-PW2A PDF আপলোড করুন।' : 'Click the "Scan Notice PDF" button from the dashboard to upload the e-PW2A PDF document downloaded from the e-GP portal.'
    },
    {
      icon: <FileCheck className="w-6 h-6 text-emerald-500" />,
      title: lang === 'bn' ? 'কোম্পানি প্রোফাইল সেটআপ' : 'Setting up your Company Profile',
      description: lang === 'bn' ? 'প্রোফাইল মেনুতে গিয়ে আপনার কোম্পানির টার্নওভার, তরল সম্পদ এবং অভিজ্ঞতা আপডেট করুন। এটি স্বয়ংক্রিয় যোগ্যতার জন্য প্রয়োজনীয়।' : 'Navigate to the Profile menu to update your company turnover, liquid assets, and prior experience. This is required for automatic eligibility matching.'
    },
    {
      icon: <Calculator className="w-6 h-6 text-indigo-500" />,
      title: lang === 'bn' ? 'স্মার্ট এস্টিমেট ব্যবহার' : 'Using Smart Estimates',
      description: lang === 'bn' ? 'টুলস মেনু থেকে "Smart Estimates" নির্বাচন করুন। PWD রেট অনুযায়ী উপাদানের পরিমাণ দিন এবং স্বয়ংক্রিয় খরচ বের করুন।' : 'Select "Smart Estimates" from the Tools menu. Input material quantities mapped to PWD rates to instantly generate overhead and profit baselines.'
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-rose-500" />,
      title: lang === 'bn' ? 'যোগ্যতার রায় বোঝা' : 'Understanding the Eligibility Verdict',
      description: lang === 'bn' ? 'লাল মানে আপনি যোগ্য নন, হলুদ মানে আংশিক যোগ্য, এবং সবুজ মানে আপনি টেন্ডারে অংশগ্রহণ করতে পারেন। সব রিপোর্ট পিডিএফ আকারে ডাউনলোড করা যায়।' : 'Red means you lack the requirements, Yellow indicates a partial match requiring joint ventures, and Green means you are fully eligible. All reports are downloadable.'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          {lang === 'bn' ? 'ব্যবহারবিধি ও ম্যানুয়াল' : 'Interactive User Manual'}
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {lang === 'bn' 
            ? 'প্লাটফর্মটি সহজে ব্যবহার করার জন্য নিচের নির্দেশিকাগুলো পড়ুন।' 
            : 'Read through these quick guides to master the eGPTenderHub intelligence platform.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {manuals.map((manual, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {manual.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{manual.title}</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {manual.description}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              {lang === 'bn' ? 'পিপিআর ২০২৫ আপডেটেড' : 'PPR 2025 Updated'}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
