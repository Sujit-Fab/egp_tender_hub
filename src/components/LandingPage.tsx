import React from 'react';
import { motion } from 'motion/react';
import { Gavel, Search, ShieldCheck, ListChecks, MessageSquare, BookOpen, TrendingUp, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  setView: (view: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Gavel className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight"><span className="text-blue-600">eGP</span>TenderHub</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setView('landing')} className="text-sm font-bold text-blue-600">Home</button>
            <button onClick={() => setView('pricing')} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Pricing</button>
            <button onClick={() => setView('contact')} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Contact</button>
          </div>
          <button 
            onClick={() => setView('dashboard')}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-sm"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 mb-8 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black tracking-[0.2em] uppercase"
          >
            The Future of Bangladesh Procurement
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.85]"
          >
            Stop Guessing. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Start Winning.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          >
            eGPTenderHub uses advanced AI to analyze e-GP notices against PPR 2025 regulations. Get eligibility scores and winning strategies in seconds.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => setView('dashboard')}
              className="w-full sm:w-auto bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-blue-200 hover:scale-105 transition-transform"
            >
              Analyze Your First Tender
            </button>
            <button 
              onClick={() => setView('pricing')}
              className="w-full sm:w-auto bg-white text-slate-900 border-2 border-slate-200 px-12 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-colors"
            >
              View Plans
            </button>
          </motion.div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "PPR Compliance", val: "2025" },
            { label: "Analysis Speed", val: "< 10s" },
            { label: "Accuracy Rate", val: "99%" },
            { label: "Support", val: "24/7" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-5xl font-black text-blue-600 mb-2 tracking-tighter">{stat.val}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Everything you need to bid.</h2>
            <p className="text-slate-500 font-medium">Built specifically for the Bangladesh construction and supply industry.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Search, title: "Notice Scanning", desc: "Upload PDF or Image notices. Our AI extracts Title, Value, Method, and Dates automatically." },
              { icon: ShieldCheck, title: "Eligibility Audit", desc: "Instantly check if your firm meets the turnover and experience requirements of PPR 2025." },
              { icon: ListChecks, title: "SOP Generation", desc: "Get a step-by-step Standard Operating Procedure for every tender you want to participate in." },
              { icon: MessageSquare, title: "AI Consultant", desc: "Chat with our virtual procurement expert to clarify complex clauses or document requirements." },
              { icon: BookOpen, title: "STD Library", desc: "Access a curated library of Standard Tender Documents (e-PG3, e-PW3, etc.) for reference." },
              { icon: TrendingUp, title: "Winning Strategy", desc: "Receive AI-generated tips on how to improve your technical and financial offer for each specific bid." }
            ].map((f, i) => (
              <div key={i} className="group">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-3 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-24 bg-blue-600 text-white px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-tight">Built on Trust. <br/>Secured for Business.</h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Military-Grade Privacy</h4>
                    <p className="text-blue-100 font-medium">Your tender documents are encrypted and never shared. We delete processed files automatically to ensure your competitive edge remains yours.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">PPR 2025 Verified</h4>
                    <p className="text-blue-100 font-medium">Our logic engine is updated weekly to reflect the latest circulars from BPPA and CPTU, ensuring you never bid with outdated information.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[3rem] border border-white/20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-slate-900 font-black">99%</div>
                <p className="font-bold text-lg">Accuracy in Eligibility Threshold Calculations</p>
              </div>
              <p className="text-blue-50 italic mb-8">"eGPTenderHub has reduced our tender evaluation time from 6 hours to 15 minutes. It's an essential tool for any serious contractor in Bangladesh."</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div>
                  <p className="font-bold">Managing Director</p>
                  <p className="text-xs text-blue-200 font-bold uppercase tracking-widest">Top-Tier Construction Firm, Dhaka</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-slate-50 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black tracking-tighter mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "Is this officially affiliated with BPPA?", a: "No, eGPTenderHub is an independent AI-powered tool designed to help contractors navigate BPPA/PPR 2025 regulations more efficiently." },
              { q: "How accurate is the AI analysis?", a: "Our AI is configured with the latest PPR 2025 thresholds and logic. While highly accurate, we always recommend a final human review for high-value bids." },
              { q: "Can I use this for e-GP tenders?", a: "Yes! Simply copy the text from the e-GP notice or upload the PDF notice, and the AI will analyze it instantly." },
              { q: "Does it support Bangla language?", a: "Absolutely. You can switch the entire interface and analysis results to Bangla with a single click." }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200">
                <h4 className="font-black mb-2 tracking-tight">{faq.q}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Gavel className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tight"><span className="text-blue-500">eGP</span>TenderHub</span>
              </div>
              <p className="text-slate-400 max-w-sm font-medium leading-relaxed">
                Empowering Bangladeshi contractors with AI-driven procurement intelligence. Built for the 2025 regulatory landscape.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase text-[10px] tracking-[0.2em] text-slate-500">Product</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-300">
                <li><button onClick={() => setView('dashboard')} className="hover:text-white transition-colors">Dashboard</button></li>
                <li><button onClick={() => setView('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => setView('guide')} className="hover:text-white transition-colors">PPR Guide</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase text-[10px] tracking-[0.2em] text-slate-500">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-300">
                <li><button onClick={() => setView('contact')} className="hover:text-white transition-colors">Contact Us</button></li>
                <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">© 2026 eGPTenderHub.com. All rights reserved.</p>
            <div className="flex gap-6">
              <button className="text-slate-500 hover:text-white transition-colors"><TrendingUp className="w-5 h-5" /></button>
              <button className="text-slate-500 hover:text-white transition-colors"><ShieldCheck className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
