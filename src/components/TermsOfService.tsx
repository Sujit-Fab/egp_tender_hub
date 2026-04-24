import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, FileText, Ban, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

export const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to eGPTenderHub</span>
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden"
        >
          <div className="bg-indigo-600/20 border-b border-indigo-500/20 p-8 sm:p-12">
            <div className="flex items-center gap-4 mb-4">
              <Scale className="w-12 h-12 text-indigo-400" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Terms of Service</h1>
            </div>
            <p className="text-indigo-200">Last Updated: April 2026</p>
          </div>
          
          <div className="p-8 sm:p-12 space-y-10">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="text-indigo-400" size={24} />
                1. Acceptance of Terms
              </h2>
              <p className="text-slate-300 leading-relaxed">
                By accessing and using eGPTenderHub, you accept and agree to be bound by the terms and provision of this agreement. Our services are designed specifically for e-GP contractors and engineering firms operating in Bangladesh under the Public Procurement Rules (PPR).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Ban className="text-indigo-400" size={24} />
                2. Disclaimers and AI Limitations
              </h2>
              <ul className="list-disc pl-6 text-slate-300 space-y-2 leading-relaxed">
                <li><strong>No Legal or Financial Warranty:</strong> eGPTenderHub utilizes artificial intelligence processors to evaluate standard tender documents. While we strive for absolute accuracy, the outputs—including compliance scores, SoR calculations, and eligibility metrics—do not constitute professional legal or financial advice.</li>
                <li><strong>Verification Requirement:</strong> You must independently verify all findings (specifically missing documents, liquid asset calculations, and deadlines) directly against the official e-GP portal before submitting your final bid.</li>
                <li>eGPTenderHub is not responsible for rejected bids or financial losses incurred due to discrepancies in AI analysis.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="text-indigo-400" size={24} />
                3. Subscriptions & Refunds
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Certain features of the service are billed on a subscription basis. You will be billed in advance on a recurring schedule (monthly or annually). 
              </p>
              <p className="text-slate-300 leading-relaxed">
                Since our platform offers a free tier allowing you to evaluate the software before purchase, all upgrade payments are generally non-refundable unless resulting from an unauthorized transaction or payment gateway error.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">
                4. Account Security
              </h2>
              <p className="text-slate-300 leading-relaxed">
                You are strictly responsible for safeguarding the credentials associated with your eGPTenderHub account. Sharing your account credentials to bypass our subscription limits is prohibited and will result in the immediate suspension of your account without a refund.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
