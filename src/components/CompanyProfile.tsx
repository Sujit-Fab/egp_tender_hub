import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Save, BadgeCheck, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { CompanyProfile } from '../services/tenderService';

interface Props {
  profile: CompanyProfile;
  onSave: (p: CompanyProfile) => void;
  lang: 'en' | 'bn';
}

export const CompanyProfileSettings: React.FC<Props> = ({ profile, onSave, lang }) => {
  const [formData, setFormData] = useState<CompanyProfile>(profile);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8 py-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          {lang === 'bn' ? 'আমার কোম্পানি প্রোফাইল' : 'My Company Profile'}
        </h2>
        <p className="text-slate-600 max-w-2xl">
          {lang === 'bn' 
            ? 'আপনার কোম্পানির আর্থিক এবং অভিজ্ঞতার তথ্য এখানে সেভ করুন। এরপর যখন আপনি টেন্ডার স্ক্যান করবেন, আমাদের AI স্বয়ংক্রিয়ভাবে একটি স্কোরকার্ড তৈরি করবে যা দেখাবে আপনি টেন্ডারের যোগ্য কি না।'
            : 'Save your company\'s financial and technical credentials here. When you analyze a tender, our AI will automatically cross-reference your profile to generate a Red/Green Eligibility Scorecard.'}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 font-medium">
          {lang === 'bn' ? 'গোপনীয়তা নোট: এই তথ্য শুধুমাত্র আপনার ব্রাউজারে সেভ থাকে এবং অন্য কোথাও শেয়ার করা হয় না।' : 'Privacy Note: This data is stored locally in your browser to power the AI Auto-Matching feature. It is not shared publicly.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* Financials & Experience */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              {lang === 'bn' ? 'আর্থিক এবং অভিজ্ঞতা (লক্ষ টাকায়)' : 'Financials & Experience (Value in Lakhs BDT)'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {lang === 'bn' ? 'সর্বোচ্চ লিকুইড সম্পদ (Liquid Assets)' : 'Max Liquid Assets'}
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.liquidAssets}
                    onChange={e => setFormData({...formData, liquidAssets: parseFloat(e.target.value) || 0})}
                    className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Lakhs</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {lang === 'bn' ? 'অনুরূপ কাজের অভিজ্ঞতা (Single Largest Work)' : 'Single Similar Work Experience'}
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.similarWorkExperience}
                    onChange={e => setFormData({...formData, similarWorkExperience: parseFloat(e.target.value) || 0})}
                    className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Lakhs</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {lang === 'bn' ? 'গড় বার্ষিক টার্নওভার (Avg. Annual Turnover)' : 'Average Annual Turnover'}
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.averageAnnualTurnover}
                    onChange={e => setFormData({...formData, averageAnnualTurnover: parseFloat(e.target.value) || 0})}
                    className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Lakhs</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {lang === 'bn' ? 'টেন্ডার ক্যাপাসিটি (Tender Capacity)' : 'Tender Capacity'}
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.tenderCapacity}
                    onChange={e => setFormData({...formData, tenderCapacity: parseFloat(e.target.value) || 0})}
                    className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Lakhs</div>
                </div>
              </div>
            </div>
          </div>

        </div>
        
        <div className="bg-slate-50 border-t border-slate-100 p-6 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-500">
            {saved ? (
              <span className="flex items-center gap-2 text-green-600 font-bold">
                <BadgeCheck className="w-5 h-5" />
                {lang === 'bn' ? 'সফলভাবে সেভ হয়েছে!' : 'Profile saved securely!'}
              </span>
            ) : (
              lang === 'bn' ? 'পরবর্তী স্ক্যানে এই ডাটা ব্যবহার করা হবে।' : 'Ready to use on your next scan.'
            )}
          </div>
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-200 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {lang === 'bn' ? 'সেভ করুন' : 'Save Profile'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
