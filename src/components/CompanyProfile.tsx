import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Save, 
  BadgeCheck, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Award, 
  Wrench, 
  Briefcase, 
  ShieldAlert, 
  Boxes, 
  UserCheck,
  TrendingDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CompanyProfile, KeyPersonnelRow, EquipmentRow, LicenseStatus } from '../services/tenderService';

interface Props {
  profile: CompanyProfile;
  onSave: (p: CompanyProfile) => void;
  lang: 'en' | 'bn';
}

export const CompanyProfileSettings: React.FC<Props> = ({ profile, onSave, lang }) => {
  const [formData, setFormData] = useState<CompanyProfile>(() => {
    return {
      liquidAssets: profile.liquidAssets ?? 0,
      similarWorkExperience: profile.similarWorkExperience ?? 0,
      averageAnnualTurnover: profile.averageAnnualTurnover ?? 0,
      tenderCapacity: profile.tenderCapacity ?? 0,
      generalExperienceYears: profile.generalExperienceYears ?? '',
      similarContractsCount5Years: profile.similarContractsCount5Years ?? '',
      keyPersonnel: profile.keyPersonnel ?? [],
      equipment: profile.equipment ?? [],
      tradeLicense: profile.tradeLicense ?? { hasLicense: '', validityDate: '' },
      electricalLicense: profile.electricalLicense ?? { hasLicense: '', validityDate: '', category: '' },
      fireLicense: profile.fireLicense ?? { hasLicense: '', validityDate: '' },
      bercLicense: profile.bercLicense ?? { hasLicense: '', validityDate: '' },
      dlsLicense: profile.dlsLicense ?? { hasLicense: '', validityDate: '' },
      tinLicense: profile.tinLicense ?? { hasLicense: '', validityDate: '' },
      vatLicense: profile.vatLicense ?? { hasLicense: '', validityDate: '' },
      supplyCapacity: profile.supplyCapacity ?? '',
      manufacturerAuthorization: profile.manufacturerAuthorization ?? { hasAuth: '', items: '' },
      isJV: profile.isJV ?? false,
      existingCommitmentsValue: profile.existingCommitmentsValue ?? 0,
      committedLiquidAssets: profile.committedLiquidAssets ?? 0,
      committedManpower: profile.committedManpower ?? '',
      committedEquipment: profile.committedEquipment ?? '',
      foreignCurrency: profile.foreignCurrency ?? 'USD',
      foreignExchangeRate: profile.foreignExchangeRate ?? 118,
      foreignLiquidAssetsOriginal: profile.foreignLiquidAssetsOriginal ?? 0,
      foreignSimilarWorkExperienceOriginal: profile.foreignSimilarWorkExperienceOriginal ?? 0,
      foreignAverageAnnualTurnoverOriginal: profile.foreignAverageAnnualTurnoverOriginal ?? 0,
      foreignTenderCapacityOriginal: profile.foreignTenderCapacityOriginal ?? 0,
      foreignLiquidAssetsBDT: profile.foreignLiquidAssetsBDT ?? 0,
      foreignSimilarWorkExperienceBDT: profile.foreignSimilarWorkExperienceBDT ?? 0,
      foreignAverageAnnualTurnoverBDT: profile.foreignAverageAnnualTurnoverBDT ?? 0,
      foreignTenderCapacityBDT: profile.foreignTenderCapacityBDT ?? 0,
    };
  });

  const getDefaultRate = (currency: string) => {
    switch (currency) {
      case 'USD': return 118;
      case 'EUR': return 128;
      case 'GBP': return 150;
      case 'SGD': return 87;
      case 'AUD': return 78;
      case 'CAD': return 86;
      default: return 100;
    }
  };

  const [saved, setSaved] = useState(false);
  const [openSections, setOpenSections] = useState({
    financials: true,
    commitments: true,
    technical: true,
    licenses: true,
    goods: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // List management helpers
  const addPersonnelRow = () => {
    const updated = [...(formData.keyPersonnel || []), { position: 'Engineer', qualification: '', totalExperience: '', similarExperience: '' } as KeyPersonnelRow];
    setFormData({ ...formData, keyPersonnel: updated });
  };

  const removePersonnelRow = (idx: number) => {
    const updated = (formData.keyPersonnel || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, keyPersonnel: updated });
  };

  const updatePersonnelRow = (idx: number, field: keyof KeyPersonnelRow, val: any) => {
    const updated = (formData.keyPersonnel || []).map((row, i) => {
      if (i === idx) {
        return { ...row, [field]: val };
      }
      return row;
    });
    setFormData({ ...formData, keyPersonnel: updated });
  };

  const addEquipmentRow = () => {
    const updated = [...(formData.equipment || []), { type: '', quantity: '', availability: 'Owned' as const } as EquipmentRow];
    setFormData({ ...formData, equipment: updated });
  };

  const removeEquipmentRow = (idx: number) => {
    const updated = (formData.equipment || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, equipment: updated });
  };

  const updateEquipmentRow = (idx: number, field: keyof EquipmentRow, val: any) => {
    const updated = (formData.equipment || []).map((row, i) => {
      if (i === idx) {
        return { ...row, [field]: val };
      }
      return row;
    });
    setFormData({ ...formData, equipment: updated });
  };

  const updateLicense = (key: 'tradeLicense' | 'electricalLicense' | 'fireLicense' | 'bercLicense' | 'dlsLicense' | 'tinLicense' | 'vatLicense', updatedLic: LicenseStatus) => {
    setFormData({ ...formData, [key]: updatedLic });
  };

  // Toggle renderer for Licenses
  const renderLicenseToggle = (
    label: string, 
    bnLabel: string, 
    licenseKey: 'tradeLicense' | 'electricalLicense' | 'fireLicense' | 'bercLicense' | 'dlsLicense' | 'tinLicense' | 'vatLicense',
    hasCategory: boolean = false
  ) => {
    const lic = formData[licenseKey] || { hasLicense: '', validityDate: '' };
    
    return (
      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            {lang === 'bn' ? bnLabel : label}
          </span>
          <div className="flex bg-slate-200/50 dark:bg-slate-800 rounded-lg p-0.5 shrink-0 gap-0.5">
            <button
              type="button"
              onClick={() => updateLicense(licenseKey, { ...lic, hasLicense: true })}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md transition-all",
                lic.hasLicense === true 
                  ? "bg-emerald-600 text-white shadow-xs" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              {lang === 'bn' ? 'হ্যাঁ' : 'Yes'}
            </button>
            <button
              type="button"
              onClick={() => updateLicense(licenseKey, { ...lic, hasLicense: false })}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md transition-all",
                lic.hasLicense === false 
                  ? "bg-red-600 text-white shadow-xs" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              {lang === 'bn' ? 'না' : 'No'}
            </button>
            <button
              type="button"
              onClick={() => updateLicense(licenseKey, { ...lic, hasLicense: '' })}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-md transition-all",
                lic.hasLicense === '' 
                  ? "bg-slate-400 text-white shadow-xs" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              {lang === 'bn' ? 'অনির্ধারিত' : 'Unset'}
            </button>
          </div>
        </div>

        {lic.hasLicense === true && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                {lang === 'bn' ? 'মেয়াদ উত্তীর্ণের তারিখ (ঐচ্ছিক)' : 'Expiry Date (Optional)'}
              </label>
              <input
                type="date"
                value={lic.validityDate || ''}
                onChange={(e) => updateLicense(licenseKey, { ...lic, validityDate: e.target.value })}
                className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-semibold text-slate-700 dark:text-slate-300"
              />
            </div>
            {hasCategory && (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {lang === 'bn' ? 'লাইসেন্স ক্যাটাগরি' : 'License Category'}
                </label>
                <select
                  value={lic.category || ''}
                  onChange={(e) => updateLicense(licenseKey, { ...lic, category: e.target.value })}
                  className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-semibold text-slate-700 dark:text-slate-300"
                >
                  <option value="">{lang === 'bn' ? 'নির্বাচন করুন' : 'Select category'}</option>
                  <option value="ABC">A, B, C (Comprehensive)</option>
                  <option value="AB">A, B</option>
                  <option value="BC">B, C</option>
                  <option value="C">C only</option>
                  <option value="B">B only</option>
                  <option value="A">A only</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8 py-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-600 hover:scale-105 transition-transform" />
          {lang === 'bn' ? 'আমার কোম্পানি প্রোফাইল' : 'My Company Profile'}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
          {lang === 'bn' 
            ? 'আপনার কোম্পানির আর্থিক, কারিগরি এবং অভিজ্ঞতার তথ্য এখানে সেভ করুন। এরপর যখন আপনি টেন্ডার স্ক্যান করবেন, আমাদের AI স্বয়ংক্রিয়ভাবে একটি স্কোরকার্ড তৈরি করবে যা দেখাবে আপনি টেন্ডারের যোগ্য কি না।'
            : 'Save your company\'s financial, technical, and regulatory credentials here. Our AI analyzes and cross-references your profile to generate detailed Red/Green Eligibility outputs.'}
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
          {lang === 'bn' ? 'গোপনীয়তা নোট: এই তথ্য আপনার ব্রাউজারে ও সুরক্ষিত ডাটাবেজে সেভ থাকে এবং অন্য কারও সাথে শেয়ার করা হয় না।' : 'Privacy Note: This data is stored locally and securely synced inside your server-side database. It remains private to your account.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Accordion 1: Financials & Experience */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('financials')}
            className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-left cursor-pointer transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-850/60"
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'আর্থিক এবং পূর্ব অভিজ্ঞতা' : 'Financials & Past Experience'}
              </h3>
            </div>
            {openSections.financials ? (
              <ChevronUp className="w-5 h-5 text-slate-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-500" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {openSections.financials && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {/* JV Support Switch Card */}
                <div className="px-8 pt-6 pb-2">
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {lang === 'bn' ? 'যৌথ উদ্যোগ (JV) ও বিদেশী অংশীদার মোড' : 'Joint Venture (JV) & Foreign Partner Mode'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                        {lang === 'bn' 
                          ? 'আপনি যদি কোনো বিদেশী কোম্পানির সাথে যৌথ অংশীদারিত্বে অংশ নিয়ে থাকেন তবে এটি চালু করুন। এর ফলে বিদেশী কারেন্সি ব্যবহারের সুযোগ এবং দেশীয় কমপ্লায়েন্সের বিশেষ ছাড় হিসাব করা হবে।' 
                          : 'Toggle this on if bidding in partnership with a foreign firm. This enables dual-currency record-keeping, live conversions, and special local regulatory grace attribution.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newJV = !formData.isJV;
                        setFormData({
                          ...formData,
                          isJV: newJV
                        });
                      }}
                      className={cn(
                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shrink-0",
                        formData.isJV ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          formData.isJV ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {formData.isJV ? (
                  <div className="p-8 space-y-8">
                    {/* Currency Selector Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 dark:bg-blue-950/10 p-5 rounded-2xl border border-blue-100/50 dark:border-blue-900/30">
                      <div className="col-span-1 md:col-span-2">
                        <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">
                          {lang === 'bn' ? 'বিদেশী সহযোগী এক্সচেঞ্জ মূল্যায়ন' : 'Foreign Partner Currency & Exchange Valuation'}
                        </h4>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                          {lang === 'bn' ? 'কারেন্সি নির্বাচন করুন' : 'Select Foreign Currency'}
                        </label>
                        <select
                          value={formData.foreignCurrency || 'USD'}
                          onChange={e => {
                            const curr = e.target.value;
                            const rate = getDefaultRate(curr);
                            setFormData({
                              ...formData,
                              foreignCurrency: curr,
                              foreignExchangeRate: rate,
                              foreignLiquidAssetsBDT: (formData.foreignLiquidAssetsOriginal || 0) * rate,
                              foreignSimilarWorkExperienceBDT: (formData.foreignSimilarWorkExperienceOriginal || 0) * rate,
                              foreignAverageAnnualTurnoverBDT: (formData.foreignAverageAnnualTurnoverOriginal || 0) * rate,
                              foreignTenderCapacityBDT: (formData.foreignTenderCapacityOriginal || 0) * rate,
                            });
                          }}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="USD">USD (United States Dollar)</option>
                          <option value="EUR">EUR (Euro)</option>
                          <option value="GBP">GBP (British Pound)</option>
                          <option value="SGD">SGD (Singapore Dollar)</option>
                          <option value="AUD">AUD (Australian Dollar)</option>
                          <option value="CAD">CAD (Canadian Dollar)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
                          {lang === 'bn' ? `এক্সচেঞ্জ রেট (১ ${formData.foreignCurrency} = কত BDT)` : `Exchange Rate (1 ${formData.foreignCurrency} in BDT)`}
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          required
                          value={formData.foreignExchangeRate || 118}
                          onChange={e => {
                            const rate = parseFloat(e.target.value) || 1;
                            setFormData({
                              ...formData,
                              foreignExchangeRate: rate,
                              foreignLiquidAssetsBDT: (formData.foreignLiquidAssetsOriginal || 0) * rate,
                              foreignSimilarWorkExperienceBDT: (formData.foreignSimilarWorkExperienceOriginal || 0) * rate,
                              foreignAverageAnnualTurnoverBDT: (formData.foreignAverageAnnualTurnoverOriginal || 0) * rate,
                              foreignTenderCapacityBDT: (formData.foreignTenderCapacityOriginal || 0) * rate,
                            });
                          }}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-slate-100 dark:border-slate-800/80 pt-6">
                      {/* Local Lead Row BDT */}
                      <div className="space-y-5">
                        <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                          {lang === 'bn' ? '১. স্থানীয় অংশীদার (BDT Taka)' : '1. Local Lead Partner (BDT Taka)'}
                        </h5>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 align-middle">
                            Liquid Assets (BDT Taka)
                          </label>
                          <div className="relative">
                            <input 
                              type="number"
                              min="0"
                              step="1"
                              required
                              value={formData.liquidAssets || ''}
                              onChange={e => setFormData({...formData, liquidAssets: parseFloat(e.target.value) || 0})}
                              className="w-full pl-4 pr-16 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">BDT</div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                            Single Similar Work Experience
                          </label>
                          <div className="relative">
                            <input 
                              type="number"
                              min="0"
                              step="1"
                              required
                              value={formData.similarWorkExperience || ''}
                              onChange={e => setFormData({...formData, similarWorkExperience: parseFloat(e.target.value) || 0})}
                              className="w-full pl-4 pr-16 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">BDT</div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                            Average Annual Turnover (AACT)
                          </label>
                          <div className="relative">
                            <input 
                              type="number"
                              min="0"
                              step="1"
                              required
                              value={formData.averageAnnualTurnover || ''}
                              onChange={e => setFormData({...formData, averageAnnualTurnover: parseFloat(e.target.value) || 0})}
                              className="w-full pl-4 pr-16 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">BDT</div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                            Tender Capacity
                          </label>
                          <div className="relative">
                            <input 
                              type="number"
                              min="0"
                              step="1"
                              required
                              value={formData.tenderCapacity || ''}
                              onChange={e => setFormData({...formData, tenderCapacity: parseFloat(e.target.value) || 0})}
                              className="w-full pl-4 pr-16 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">BDT</div>
                          </div>
                        </div>
                      </div>

                      {/* Foreign Partner Column */}
                      <div className="space-y-5">
                        <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-650" />
                          {lang === 'bn' ? `২. বিদেশী সহযোগী অংশীদার (${formData.foreignCurrency})` : `2. Foreign Partner (${formData.foreignCurrency})`}
                        </h5>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                            Liquid Assets ({formData.foreignCurrency})
                          </label>
                          <div className="relative">
                            <input 
                              type="number"
                              min="0"
                              value={formData.foreignLiquidAssetsOriginal || ''}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0;
                                setFormData({
                                  ...formData,
                                  foreignLiquidAssetsOriginal: val,
                                  foreignLiquidAssetsBDT: val * (formData.foreignExchangeRate || 118)
                                });
                              }}
                              className="w-full pl-4 pr-16 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{formData.foreignCurrency}</div>
                          </div>
                          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                            BDT Equiv: ৳{Math.round(formData.foreignLiquidAssetsBDT || 0).toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                            Similar Work Experience ({formData.foreignCurrency})
                          </label>
                          <div className="relative">
                            <input 
                              type="number"
                              min="0"
                              value={formData.foreignSimilarWorkExperienceOriginal || ''}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0;
                                setFormData({
                                  ...formData,
                                  foreignSimilarWorkExperienceOriginal: val,
                                  foreignSimilarWorkExperienceBDT: val * (formData.foreignExchangeRate || 118)
                                });
                              }}
                              className="w-full pl-4 pr-16 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{formData.foreignCurrency}</div>
                          </div>
                          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                            BDT Equiv: ৳{Math.round(formData.foreignSimilarWorkExperienceBDT || 0).toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                            Average Annual Turnover (AACT) ({formData.foreignCurrency})
                          </label>
                          <div className="relative">
                            <input 
                              type="number"
                              min="0"
                              value={formData.foreignAverageAnnualTurnoverOriginal || ''}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0;
                                setFormData({
                                  ...formData,
                                  foreignAverageAnnualTurnoverOriginal: val,
                                  foreignAverageAnnualTurnoverBDT: val * (formData.foreignExchangeRate || 118)
                                });
                              }}
                              className="w-full pl-4 pr-16 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{formData.foreignCurrency}</div>
                          </div>
                          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                            BDT Equiv: ৳{Math.round(formData.foreignAverageAnnualTurnoverBDT || 0).toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                            Tender Capacity ({formData.foreignCurrency})
                          </label>
                          <div className="relative">
                            <input 
                              type="number"
                              min="0"
                              value={formData.foreignTenderCapacityOriginal || ''}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 0;
                                setFormData({
                                  ...formData,
                                  foreignTenderCapacityOriginal: val,
                                  foreignTenderCapacityBDT: val * (formData.foreignExchangeRate || 118)
                                });
                              }}
                              className="w-full pl-4 pr-16 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 font-semibold"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{formData.foreignCurrency}</div>
                          </div>
                          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-semibold">
                            BDT Equiv: ৳{Math.round(formData.foreignTenderCapacityBDT || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Combined Years in general experience */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          {lang === 'bn' ? 'সাধারণ কাজের অভিজ্ঞতা (যৌথ সমন্বিত বছর)' : 'General Experience (Combined Years)'}
                        </label>
                        <input 
                          type="number"
                          min="0"
                          placeholder={lang === 'bn' ? 'যেমন: ১০' : 'e.g., 10'}
                          value={formData.generalExperienceYears !== undefined ? formData.generalExperienceYears : ''}
                          onChange={e => setFormData({...formData, generalExperienceYears: e.target.value === '' ? '' : parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          {lang === 'bn' ? 'গত ৫ বছরে সম্পন্ন অনুরূপ চুক্তির সংখ্যা (যৌথ)' : 'No. of Similar Contracts (Last 5 Years) - Combined'}
                        </label>
                        <input 
                          type="number"
                          min="0"
                          placeholder={lang === 'bn' ? 'যেমন: ৩' : 'e.g., 3'}
                          value={formData.similarContractsCount5Years !== undefined ? formData.similarContractsCount5Years : ''}
                          onChange={e => setFormData({...formData, similarContractsCount5Years: e.target.value === '' ? '' : parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {lang === 'bn' ? 'সর্বোচ্চ লিকুইড সম্পদ (Liquid Assets) - BDT (Taka)' : 'Max Liquid Assets - BDT (Taka)'}
                      </label>
                      <div className="relative">
                        <input 
                          type="number"
                          min="0"
                          step="1"
                          required
                          placeholder={lang === 'bn' ? 'যেমন: ১২৫০০০০ (BDT Taka)' : 'e.g., 1250000 (BDT Taka)'}
                          value={formData.liquidAssets || ''}
                          onChange={e => setFormData({...formData, liquidAssets: parseFloat(e.target.value) || 0})}
                          className="w-full pl-4 pr-16 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 font-semibold"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">BDT</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {lang === 'bn' ? 'অনুরূপ কাজের অভিজ্ঞতা (Single Largest Contract) - BDT (Taka)' : 'Single Similar Work Experience - BDT (Taka)'}
                      </label>
                      <div className="relative">
                        <input 
                          type="number"
                          min="0"
                          step="1"
                          required
                          placeholder={lang === 'bn' ? 'যেমন: ৫000000 (BDT Taka)' : 'e.g., 5000000 (BDT Taka)'}
                          value={formData.similarWorkExperience || ''}
                          onChange={e => setFormData({...formData, similarWorkExperience: parseFloat(e.target.value) || 0})}
                          className="w-full pl-4 pr-16 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 font-semibold"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">BDT</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {lang === 'bn' ? 'গড় বার্ষিক টার্নওভার (AACT) - BDT (Taka)' : 'Average Annual Turnover (AACT) - BDT (Taka)'}
                      </label>
                      <div className="relative">
                        <input 
                          type="number"
                          min="0"
                          step="1"
                          required
                          placeholder={lang === 'bn' ? 'যেমন: ৮000000 (BDT Taka)' : 'e.g., 8000000 (BDT Taka)'}
                          value={formData.averageAnnualTurnover || ''}
                          onChange={e => setFormData({...formData, averageAnnualTurnover: parseFloat(e.target.value) || 0})}
                          className="w-full pl-4 pr-16 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 font-semibold"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">BDT</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {lang === 'bn' ? 'টেন্ডার ক্যাপাসিটি (Tender Capacity) - BDT (Taka)' : 'Tender Capacity - BDT (Taka)'}
                      </label>
                      <div className="relative">
                        <input 
                          type="number"
                          min="0"
                          step="1"
                          required
                          placeholder={lang === 'bn' ? 'যেমন: ১0000000 (BDT Taka)' : 'e.g., 10000000 (BDT Taka)'}
                          value={formData.tenderCapacity || ''}
                          onChange={e => setFormData({...formData, tenderCapacity: parseFloat(e.target.value) || 0})}
                          className="w-full pl-4 pr-16 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 font-semibold"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">BDT</div>
                      </div>
                    </div>

                    {/* General Experience (Years) */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {lang === 'bn' ? 'সাধারণ কাজের অভিজ্ঞতা (বছর)' : 'General Experience (Years)'}
                      </label>
                      <input 
                        type="number"
                        min="0"
                        placeholder={lang === 'bn' ? 'যেমন: ৫' : 'e.g., 5'}
                        value={formData.generalExperienceYears !== undefined ? formData.generalExperienceYears : ''}
                        onChange={e => setFormData({...formData, generalExperienceYears: e.target.value === '' ? '' : parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 font-semibold"
                      />
                    </div>

                    {/* Similar Contracts Count in last 5 years */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {lang === 'bn' ? 'গত ৫ বছরে সম্পন্ন অনুরূপ চুক্তির সংখ্যা' : 'No. of Similar Contracts (Last 5 Years)'}
                      </label>
                      <input 
                        type="number"
                        min="0"
                        placeholder={lang === 'bn' ? 'যেমন: ২' : 'e.g., 2'}
                        value={formData.similarContractsCount5Years !== undefined ? formData.similarContractsCount5Years : ''}
                        onChange={e => setFormData({...formData, similarContractsCount5Years: e.target.value === '' ? '' : parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 font-semibold"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 1b: Existing & Ongoing Commitments — Sarkar saab improvement */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-amber-200 dark:border-amber-900/50 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('commitments')}
            className="w-full flex items-center justify-between p-6 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30 text-left cursor-pointer transition-colors hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
          >
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'চলমান কাজ ও প্রতিশ্রুতি' : 'Existing & Ongoing Commitments'}
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 font-medium">
                  {lang === 'bn'
                    ? 'এই তথ্য থেকে নেট আভেইলেবল ক্যাপাসিটি হিসাব হবে — Sarkar saab-এর পরামর্শ'
                    : 'Used to compute net available capacity — expert reviewer advice'}
                </p>
              </div>
            </div>
            {openSections.commitments ? (
              <ChevronUp className="w-5 h-5 text-amber-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-amber-500" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {openSections.commitments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8 space-y-6">

                  {/* Info banner */}
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 flex gap-3 items-start">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                      {lang === 'bn'
                        ? 'একটি ফার্মের কাগজে যা আছে তা নয়, বরং কত টুকু আসলে ফ্রি — সেটাই যোগ্যতার আসল মাপকাঠি। এখানে চলমান কাজের তথ্য দিলে AI নেট ক্যাপাসিটি হিসাব করবে।'
                        : 'What matters is not what a firm owns on paper, but what is actually free for this contract. Entering your ongoing commitments here lets the AI calculate your net available capacity.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Existing Commitments Value — the B term */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {lang === 'bn' ? 'চলমান কাজের মোট মূল্য (BDT Taka)' : 'Total Value of Works Currently in Hand (BDT Taka)'}
                      </label>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                        {lang === 'bn'
                          ? 'Tender Capacity formula-র "B" term হিসেবে ব্যবহৃত হবে।'
                          : 'Used as the "B" term (value of existing commitments) in the Tender Capacity formula.'}
                      </p>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder={lang === 'bn' ? 'যেমন: ৫০০০০০০' : 'e.g., 5000000'}
                          value={formData.existingCommitmentsValue || ''}
                          onChange={e => setFormData({ ...formData, existingCommitmentsValue: parseFloat(e.target.value) || 0 })}
                          className="w-full pl-4 pr-16 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-800 dark:text-slate-200 font-semibold"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">BDT</div>
                      </div>
                    </div>

                    {/* Committed Liquid Assets */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {lang === 'bn' ? 'চলমান কাজে ব্যবহৃত লিকুইড অ্যাসেট (BDT Taka)' : 'Portion of Liquid Assets Committed to Ongoing Work (BDT Taka)'}
                      </label>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                        {lang === 'bn'
                          ? 'এই পরিমাণ Gross থেকে বাদ দিয়ে Net Available দেখানো হবে।'
                          : 'Subtracted from your Gross Liquid Assets to show Net Available.'}
                      </p>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder={lang === 'bn' ? 'যেমন: ১৫০০০০০' : 'e.g., 1500000'}
                          value={formData.committedLiquidAssets || ''}
                          onChange={e => setFormData({ ...formData, committedLiquidAssets: parseFloat(e.target.value) || 0 })}
                          className="w-full pl-4 pr-16 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-800 dark:text-slate-200 font-semibold"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">BDT</div>
                      </div>
                      {(formData.committedLiquidAssets ?? 0) > 0 && (formData.liquidAssets ?? 0) > 0 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-semibold">
                          {lang === 'bn' ? 'নেট আভেইলেবল: ' : 'Net Available: '}
                          ৳{((formData.liquidAssets ?? 0) - (formData.committedLiquidAssets ?? 0)).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Committed Manpower */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {lang === 'bn' ? 'চলমান কাজে নিযুক্ত জনবল (ঐচ্ছিক)' : 'Manpower Committed to Ongoing Work (Optional)'}
                      </label>
                      <textarea
                        rows={2}
                        placeholder={lang === 'bn' ? 'যেমন: ২ PM এবং ৪ Engineer Site-X এ কর্মরত' : 'e.g. 2 PMs and 4 Engineers deployed on active site...'}
                        value={formData.committedManpower || ''}
                        onChange={e => setFormData({ ...formData, committedManpower: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-800 dark:text-slate-200 text-sm resize-none"
                      />
                    </div>

                    {/* Committed Equipment */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {lang === 'bn' ? 'চলমান কাজে ব্যবহৃত সরঞ্জাম (ঐচ্ছিক)' : 'Equipment Committed to Ongoing Work (Optional)'}
                      </label>
                      <textarea
                        rows={2}
                        placeholder={lang === 'bn' ? 'যেমন: ২ Mixer এবং ১ Crane Project-Y তে নিযুক্ত' : 'e.g. 2 Mixers and 1 Crane deployed on Project X...'}
                        value={formData.committedEquipment || ''}
                        onChange={e => setFormData({ ...formData, committedEquipment: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-800 dark:text-slate-200 text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 2: Technical Capacity */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('technical')}
            className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-left cursor-pointer transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-850/60"
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'কারিগরি সক্ষমতা (জনবল ও সরঞ্জাম)' : 'Technical Capacity (Personnel & Equipment)'}
              </h3>
            </div>
            {openSections.technical ? (
              <ChevronUp className="w-5 h-5 text-slate-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-500" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {openSections.technical && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8 space-y-8">
                  {/* Key Personnel */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Award className="w-4 h-4 text-slate-400" />
                        {lang === 'bn' ? 'প্রধান জনবল তালিকা' : 'Key Personnel List'}
                      </h4>
                      <button
                        type="button"
                        onClick={addPersonnelRow}
                        className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {lang === 'bn' ? 'জনবল যোগ করুন' : 'Add Personnel'}
                      </button>
                    </div>

                    {(formData.keyPersonnel || []).length === 0 ? (
                      <p className="text-sm text-slate-400 dark:text-slate-500 italic p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        {lang === 'bn' ? 'কোনো জনবল যোগ করা হয়নি।' : 'No key personnel added yet. Click Add Personnel.'}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {(formData.keyPersonnel || []).map((p, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-4 rounded-xl relative group grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                            <div className="sm:col-span-3">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Position</label>
                              <select
                                value={p.position}
                                onChange={e => updatePersonnelRow(idx, 'position', e.target.value)}
                                className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-semibold text-slate-800 dark:text-slate-200"
                              >
                                <option value="Project Manager">Project Manager</option>
                                <option value="Engineer">Engineer</option>
                                <option value="Site Supervisor">Site Supervisor</option>
                                <option value="Electrician">Electrician</option>
                                <option value="Quality Specialist">Quality Specialist</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Qualification</label>
                              <input
                                type="text"
                                placeholder="B.Sc. / Diploma etc"
                                value={p.qualification}
                                onChange={e => updatePersonnelRow(idx, 'qualification', e.target.value)}
                                className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-semibold text-slate-800 dark:text-slate-200"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Total Exp (Yrs)</label>
                              <input
                                type="number"
                                min="0"
                                value={p.totalExperience}
                                onChange={e => updatePersonnelRow(idx, 'totalExperience', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                                className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-semibold text-slate-800 dark:text-slate-200"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Similar Exp (Yrs)</label>
                              <input
                                type="number"
                                min="0"
                                value={p.similarExperience}
                                onChange={e => updatePersonnelRow(idx, 'similarExperience', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                                className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-semibold text-slate-800 dark:text-slate-200"
                              />
                            </div>
                            <div className="sm:col-span-1 flex justify-center">
                              <button
                                type="button"
                                onClick={() => removePersonnelRow(idx)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-550/10 p-2 rounded-lg transition-all cursor-pointer inline-flex items-center"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Equipment */}
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-slate-400" />
                        {lang === 'bn' ? 'প্রয়োজনীয় যন্ত্রপাতি ও সরঞ্জাম' : 'Required Equipment & Tools'}
                      </h4>
                      <button
                        type="button"
                        onClick={addEquipmentRow}
                        className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {lang === 'bn' ? 'সরঞ্জাম যোগ করুন' : 'Add Equipment'}
                      </button>
                    </div>

                    {(formData.equipment || []).length === 0 ? (
                      <p className="text-sm text-slate-400 dark:text-slate-500 italic p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        {lang === 'bn' ? 'কোনো সরঞ্জাম যোগ করা হয়নি।' : 'No equipment added yet. Click Add Equipment.'}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {(formData.equipment || []).map((eq, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-4 rounded-xl relative group grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                            <div className="sm:col-span-5">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Equipment Type / Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Concrete Mixer, Total Station, Tester"
                                value={eq.type}
                                onChange={e => updateEquipmentRow(idx, 'type', e.target.value)}
                                className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-semibold text-slate-800 dark:text-slate-200"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Quantity</label>
                              <input
                                type="number"
                                min="1"
                                value={eq.quantity}
                                onChange={e => updateEquipmentRow(idx, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                                className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-semibold text-slate-800 dark:text-slate-200"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-xs font-bold text-slate-500 mb-1">Availability</label>
                              <select
                                value={eq.availability}
                                onChange={e => updateEquipmentRow(idx, 'availability', e.target.value)}
                                className="w-full text-sm p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-semibold text-slate-800 dark:text-slate-200"
                              >
                                <option value="Owned">Owned</option>
                                <option value="Hired">Hired</option>
                                <option value="Leased">Leased</option>
                              </select>
                            </div>
                            <div className="sm:col-span-1 flex justify-center">
                              <button
                                type="button"
                                onClick={() => removeEquipmentRow(idx)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-550/10 p-2 rounded-lg transition-all cursor-pointer inline-flex items-center"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 3: Licenses & Certifications */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('licenses')}
            className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-left cursor-pointer transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-850/60"
          >
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'লাইসেন্স ও সার্টিফিকেশন' : 'Licenses & Certifications'}
              </h3>
            </div>
            {openSections.licenses ? (
              <ChevronUp className="w-5 h-5 text-slate-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-500" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {openSections.licenses && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderLicenseToggle('Trade License (ট্রেড লাইসেন্স)', 'ট্রেড লাইসেন্স (Trade License)', 'tradeLicense')}
                  {renderLicenseToggle('Electrical Supervisory License (ABC)', 'বৈদ্যুতিক সুপারভাইজরি লাইসেন্স (ABC)', 'electricalLicense', true)}
                  {renderLicenseToggle('Fire License (ফায়ার লাইসেন্স)', 'ফায়ার লাইসেন্স (Fire License)', 'fireLicense')}
                  {renderLicenseToggle('BERC License (LPG)', 'বিইআরসি লাইসেন্স (LPG)', 'bercLicense')}
                  {renderLicenseToggle('DLS Category (Animal Feed)', 'প্রাণিসম্পদ অধিদপ্তর ডিলএস লাইসেন্স', 'dlsLicense')}
                  {renderLicenseToggle('TIN (করদাতা সনাক্তকরণ নম্বর)', 'করদাতা সার্টিফিকেট (TIN)', 'tinLicense')}
                  {renderLicenseToggle('VAT/BIN Registration', 'ভ্যাট/বিন নিবন্ধন সনদ (VAT/BIN)', 'vatLicense')}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 4: Goods-specific */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('goods')}
            className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-left cursor-pointer transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-850/60"
          >
            <div className="flex items-center gap-3">
              <Boxes className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'পণ্য সরবরাহ সংক্রান্ত প্রোফাইল' : 'Goods Supply-Specific Profile'}
              </h3>
            </div>
            {openSections.goods ? (
              <ChevronUp className="w-5 h-5 text-slate-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-500" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {openSections.goods && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-8 space-y-6">
                  {/* Supply / Production Capacity */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      {lang === 'bn' ? 'বার্ষিক সরবরাহ/উৎপাদন ক্ষমতা (ইউনিট/বছর)' : 'Annual Supply / Production Capacity (Units/Year)'}
                    </label>
                    <input 
                      type="number"
                      min="0"
                      placeholder={lang === 'bn' ? 'যেমন: ১০০০০' : 'e.g. 10000'}
                      value={formData.supplyCapacity !== undefined ? formData.supplyCapacity : ''}
                      onChange={e => setFormData({...formData, supplyCapacity: e.target.value === '' ? '' : parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 font-semibold"
                    />
                  </div>

                  {/* Manufacturer / Distributor Authorization Status */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-sm">
                          {lang === 'bn' ? 'প্রস্তুতকারক বা ডিস্ট্রিবিউটর অথরাইজেশন' : 'Manufacturer or Distributor Authorization'}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">
                          {lang === 'bn' ? 'নির্দিষ্ট পণ্য সরবরাহের জন্য প্রস্তুতকারকের অনুমোদনপত্র রয়েছে কি না।' : 'Whether you hold valid authorization letters for goods delivery.'}
                        </span>
                      </div>
                      <div className="flex bg-slate-200/50 dark:bg-slate-800 rounded-lg p-0.5 shrink-0 gap-0.5">
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData, 
                            manufacturerAuthorization: { 
                              hasAuth: true, 
                              items: formData.manufacturerAuthorization?.items || '' 
                            }
                          })}
                          className={cn(
                            "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                            formData.manufacturerAuthorization?.hasAuth === true 
                              ? "bg-emerald-600 text-white shadow-xs" 
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                          )}
                        >
                          {lang === 'bn' ? 'হ্যাঁ' : 'Yes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData, 
                            manufacturerAuthorization: { 
                              hasAuth: false, 
                              items: formData.manufacturerAuthorization?.items || '' 
                            }
                          })}
                          className={cn(
                            "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                            formData.manufacturerAuthorization?.hasAuth === false 
                              ? "bg-red-600 text-white shadow-xs" 
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                          )}
                        >
                          {lang === 'bn' ? 'না' : 'No'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData, 
                            manufacturerAuthorization: { 
                              hasAuth: '', 
                              items: formData.manufacturerAuthorization?.items || '' 
                            }
                          })}
                          className={cn(
                            "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                            formData.manufacturerAuthorization?.hasAuth === '' 
                              ? "bg-slate-400 text-white shadow-xs" 
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                          )}
                        >
                          {lang === 'bn' ? 'অনির্ধারিত' : 'Unset'}
                        </button>
                      </div>
                    </div>

                    {formData.manufacturerAuthorization?.hasAuth === true && (
                      <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                          {lang === 'bn' ? 'কোন পণ্যগুলোর জন্য অনুমোদনপত্র রয়েছে? (কমা দিয়ে লিখুন)' : 'For which items do you hold authorization? (Comma separated)'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. LPG Cylinder, Smart Meter, Fire Extinguisher"
                          value={formData.manufacturerAuthorization?.items || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            manufacturerAuthorization: {
                              hasAuth: true,
                              items: e.target.value
                            }
                          })}
                          className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-semibold text-slate-700 dark:text-slate-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Button Segment */}
        <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {saved ? (
              <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold">
                <BadgeCheck className="w-5 h-5 animate-bounce" />
                {lang === 'bn' ? 'সফলভাবে সেভ হয়েছে!' : 'Profile saved securely!'}
              </span>
            ) : (
              lang === 'bn' ? 'পরবর্তী স্ক্যানে এই ডাটা ব্যবহার করা হবে।' : 'Ready to use on your next scan.'
            )}
          </div>
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-200 dark:shadow-none flex items-center gap-2 cursor-pointer scale-100 hover:scale-102"
          >
            <Save className="w-5 h-5" />
            {lang === 'bn' ? 'সেভ করুন' : 'Save Profile'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
