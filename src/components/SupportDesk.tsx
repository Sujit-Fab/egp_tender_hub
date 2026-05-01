import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LifeBuoy, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { User, db, collection, addDoc, serverTimestamp } from '../firebase';

export const SupportDesk = ({ user, lang }: { user: User | null; lang: 'en' | 'bn' }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    setError(null);
    try {
      // 1. Save to Firebase
      await addDoc(collection(db, 'support_tickets'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        subject,
        message,
        status: 'open',
        createdAt: serverTimestamp()
      });

      // 2. Send email via Backend (Nodemailer)
      const res = await fetch('/api/support/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.displayName,
          subject,
          message
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send email notification');
      }

      setSuccess(true);
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">{lang === 'bn' ? 'লগইন প্রয়োজন' : 'Login Required'}</h2>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-8 py-8"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <LifeBuoy className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          {lang === 'bn' ? 'সাহায্য এবং কমপ্লেন সেল' : 'Help & Support Desk'}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {lang === 'bn' 
            ? 'প্লাটফর্মে কোনো সমস্যা হলে আমাদের সাপোর্ট টিমের কাছে টিকিট জমা দিন।' 
            : 'Having an issue? Submit a ticket and our engineering team will get back to you shortly.'}
        </p>
      </div>

      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-8 rounded-3xl text-center space-y-4"
        >
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {lang === 'bn' ? 'টিকিট জমা হয়েছে!' : 'Ticket Submitted!'}
          </h3>
          <p className="text-emerald-600 dark:text-emerald-500">
            {lang === 'bn' ? 'আমাদের প্রতিনিধি শীঘ্রই আপনার ইমেইলে যোগাযোগ করবে।' : 'Our support representative will contact you via email shortly.'}
          </p>
          <button 
            onClick={() => setSuccess(false)}
            className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium"
          >
            {lang === 'bn' ? 'আরেকটি কমপ্লেন করুন' : 'Submit Another Request'}
          </button>
        </motion.div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {lang === 'bn' ? 'বিষয়' : 'Subject'}
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: পিডিএফ আপলোডে সমস্যা' : 'e.g., PDF Upload Issue'}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {lang === 'bn' ? 'বিস্তারিত বর্ণনা' : 'Detailed Description'}
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder={lang === 'bn' ? 'আপনার সমস্যাটি বিস্তারিত লিখুন...' : 'Describe your issue in detail...'}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (lang === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...') : (lang === 'bn' ? 'জমা দিন' : 'Submit Ticket')}
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
};
