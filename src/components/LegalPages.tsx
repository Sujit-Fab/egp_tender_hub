import React from 'react';
import { motion } from 'motion/react';
import { Shield, Scale, FileText, ChevronLeft } from 'lucide-react';

interface LegalPageProps {
  setView: (view: any) => void;
}

export const TermsOfService: React.FC<LegalPageProps> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-4 mb-4">
            <Scale className="w-10 h-10" />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-blue-100">Last Updated: March 26, 2026</p>
        </div>
        
        <div className="p-8 prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600">By accessing eGPTenderHub, you agree to be bound by these Terms of Service and all applicable laws and regulations in Bangladesh.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. AI Disclaimer & Liability</h2>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
              <p className="text-amber-800 font-medium">eGPTenderHub provides AI-generated analysis for guidance only. We do not guarantee 100% accuracy. Users MUST verify all results against official PPR 2025 documents and CPTU circulars.</p>
            </div>
            <p className="text-slate-600">eGPTenderHub shall not be liable for any financial loss, tender disqualification, or legal issues arising from the use of our automated analysis.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Subscription & Usage Limits</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>Free Tier: Limited to 3 analyses per month.</li>
              <li>Pro Tier: Subject to fair usage policies (max 100 analyses/month).</li>
              <li>Accounts are for individual or single-company use only. Sharing credentials is prohibited.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Compliance with PPR 2025</h2>
            <p className="text-slate-600">Our logic is updated periodically to reflect PPR 2025. However, in case of conflict, the official Government of Bangladesh Gazette shall prevail.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicy: React.FC<LegalPageProps> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-10 h-10 text-blue-400" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-slate-400">Your data security is our priority.</p>
        </div>
        
        <div className="p-8 prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Document Handling</h2>
            <p className="text-slate-600">When you upload a Tender PDF or Image:</p>
            <ul className="list-disc pl-5 text-slate-600 mt-2 space-y-2">
              <li>The file is processed securely via encrypted channels.</li>
              <li>Text extraction is performed in-memory.</li>
              <li>We do NOT store your raw PDF files on our servers permanently unless you explicitly save them to your "Tender Library".</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Data Usage</h2>
            <p className="text-slate-600">We do NOT use your private tender documents to train our AI models. Your business intelligence remains yours alone.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Information We Collect</h2>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>Profile Info: Name and email for account management.</li>
              <li>Analysis History: Metadata of tenders you've analyzed (if logged in).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Security</h2>
            <p className="text-slate-600">We use industry-standard SSL encryption and secure Firestore databases to protect your analysis history.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
