import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Mail, Lock, Database, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export const PrivacyPolicy = () => {
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
              <ShieldCheck className="w-12 h-12 text-indigo-400" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
            </div>
            <p className="text-indigo-200">Last Updated: April 2026</p>
          </div>
          
          <div className="p-8 sm:p-12 space-y-10">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="text-indigo-400" size={24} />
                1. Introduction
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Welcome to eGPTenderHub. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="text-indigo-400" size={24} />
                2. Data We Collect
              </h2>
              <ul className="list-disc pl-6 text-slate-300 space-y-2 leading-relaxed">
                <li><strong>Identity Data:</strong> includes first name, last name, username, and Google profile information when you authenticate via Google Sign-In.</li>
                <li><strong>Contact Data:</strong> includes email address.</li>
                <li><strong>Proprietary Business Data:</strong> includes your standard tender documents (STDs) uploaded in PDF format, Schedule of Rates (SoR), and company profile metrics. We acknowledge this data is highly confidential.</li>
                <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="text-indigo-400" size={24} />
                3. How We Use & Protect Your Data
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We use your data exclusively to provide our secure tender analysis services. Specifically:
              </p>
              <ul className="list-disc pl-6 text-slate-300 space-y-2 leading-relaxed">
                <li><strong>Zero-Trust Architecture:</strong> Your uploaded STDs and generated analyses are cryptographically bound to your specific User ID using Firebase Security Rules. No other contractor or business can access your documents.</li>
                <li><strong>AI Processing:</strong> Your tender text is processed via Google's Gemini AI to provide you with insights. We do not use your proprietary STDs to broadly train AI models for public consumption.</li>
                <li>We process identity and contact data to manage your account, subscription, and to provide customer support.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Mail className="text-indigo-400" size={24} />
                4. Contact Us
              </h2>
              <p className="text-slate-300 leading-relaxed">
                If you have any questions about this privacy policy or our privacy practices, please contact us via our Support Desk within the application or email us directly at support@egptenderhub.com.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
