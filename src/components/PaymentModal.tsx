import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from 'firebase/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tierContent: 'pro' | 'enterprise' | null;
  user: User | null;
  lang: 'en' | 'bn';
}

export const PaymentModal: React.FC<Props> = ({ isOpen, onClose, tierContent, user, lang }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !trxId) {
      setError(lang === 'bn' ? 'দয়া করে সমস্ত ফিল্ড পূরণ করুন' : 'Please fill in all fields');
      return;
    }

    if (!user) {
      setError(lang === 'bn' ? 'আপনাকে প্রথমে লগইন করতে হবে' : 'You must be logged in to upgrade');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'pending_payments'), {
        userId: user.uid,
        email: user.email,
        tierRequested: tierContent,
        amount: tierContent === 'pro' ? '999' : 'Custom',
        phoneNumber,
        trxId,
        status: 'pending',
        timestamp: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setPhoneNumber('');
        setTrxId('');
      }, 5000);
    } catch (err: any) {
      console.error('Payment tracking error:', err);
      setError(err.message || 'An error occurred while submitting payment details.');
    } finally {
      setLoading(false);
    }
  };

  const amount = tierContent === 'pro' ? '৳999' : 'Contact us for exact amount';
  const myBkVashNagad = "01711170767";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden my-auto"
        >
          {success ? (
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'ধন্যবাদ!' : 'Thank you!'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 pb-4">
                {lang === 'bn' 
                  ? 'আমরা আপনার পেমেন্ট যাচাই করছি এবং ১-২ ঘন্টার মধ্যে আপনার অ্যাকাউন্ট আপগ্রেড করে দেব।' 
                  : 'We are verifying your payment and will upgrade your account within 1-2 hours.'}
              </p>
              <button 
                onClick={onClose}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
              >
                {lang === 'bn' ? 'অপেক্ষা করুন' : 'Got it'}
              </button>
            </div>
          ) : (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'পেমেন্ট করুন' : 'Upgrade Account'}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none">&times;</button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-5 mb-6 text-sm text-blue-900 dark:text-blue-200">
                {tierContent === 'pro' && (
                  <div className="bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 px-3 py-1.5 rounded-lg font-bold text-xs inline-block mb-3">
                    🚀 {lang === 'bn' ? '৫০% আর্লি বার্ড ডিসকাউন্ট!' : '50% Early Bird Discount!'}
                  </div>
                )}
                <p className="mb-2">
                  {lang === 'bn' 
                    ? `আপগ্রেড করতে দয়া করে bKash বা Nagad এর মাধ্যমে "Send Money" করুন এই নাম্বারে:` 
                    : `To upgrade, please 'Send Money' via bKash or Nagad to this number:`}
                </p>
                <div className="text-2xl font-bold font-mono tracking-wider text-blue-700 dark:text-blue-400 mb-1">
                  {myBkVashNagad}
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300">
                  {lang === 'bn' ? `Payment Amount: ${amount}` : `Amount: ${amount}`}
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'আপনার বিকাশ/নগদ নাম্বার' : 'Your bKash/Nagad Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {lang === 'bn' ? 'ট্রানজ্যাকশন আইডি (TrxID)' : 'Transaction ID (TrxID)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="e.g. 8JL8H8..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all uppercase"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {lang === 'bn' ? 'পেমেন্ট ভেরিফাই করুন' : 'Verify Payment'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
