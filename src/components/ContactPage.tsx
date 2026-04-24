import React from 'react';
import { MessageSquare, TrendingUp, ChevronLeft } from 'lucide-react';

interface ContactPageProps {
  setView: (view: any) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row border border-slate-100">
          <div className="bg-blue-600 p-12 text-white md:w-2/5">
            <h2 className="text-4xl font-black tracking-tighter mb-6 leading-none">Let's talk business.</h2>
            <p className="font-medium opacity-80 mb-12">Have questions about our Enterprise plans or custom AI training?</p>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><MessageSquare className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Email Us</p>
                  <p className="font-bold">hello@tenderreadybd.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Dhaka Office</p>
                  <p className="font-bold">Gulshan 2, Dhaka 1212</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-12 md:w-3/5">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent! Our team will contact you shortly.'); setView('landing'); }}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                  <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company Name</label>
                  <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                <input type="email" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message</label>
                <textarea rows={4} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold resize-none"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                Send Message
              </button>
            </form>
          </div>
        </div>
        <button onClick={() => setView('landing')} className="mt-12 text-slate-400 font-bold flex items-center justify-center gap-2 mx-auto hover:text-blue-600 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back to Home
        </button>
      </div>
    </div>
  );
};
