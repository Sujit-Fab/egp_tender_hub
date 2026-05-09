import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Newspaper, Loader2, ExternalLink, Calendar, Bell, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

export const NoticeBoard = ({ lang }: { lang: 'en' | 'bn' }) => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'bppa' | 'egp'>('all');

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch('/api/notices');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setNotices(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(lang === 'bn' ? 'নোটিশ লোড করতে সমস্যা হয়েছে।' : 'Failed to load notices.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [lang]);

  const filteredNotices = notices.filter(notice => {
    if (filter === 'all') return true;
    if (filter === 'bppa') return notice.source.includes('BPPA');
    if (filter === 'egp') return notice.source.includes('e-GP');
    return true;
  });

  return (
    <motion.div 
      key="noticeboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            {lang === 'bn' ? 'সেন্ট্রাল নোটিশ বোর্ড' : 'Central Notice Board'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            {lang === 'bn' 
              ? 'ই-জিপি এবং ওপেন টেন্ডারের সর্বশেষ আপডেট এবং নিউজ। (স্বয়ংক্রিয়ভাবে আপডেট হয়)' 
              : 'Live updates from e-GP and BPPA portals. (Updated automatically)'}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors",
              filter === 'all' 
                ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            )}
          >
            {lang === 'bn' ? 'সব' : 'All'}
          </button>
          <button 
            onClick={() => setFilter('bppa')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors",
              filter === 'bppa'
                ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white shadow-md shadow-blue-500/20"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
            )}
          >
            <ShieldAlert className="w-4 h-4" /> BPPA
          </button>
          <button 
            onClick={() => setFilter('egp')}
            className={cn(
               "px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors",
               filter === 'egp'
                 ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white shadow-md shadow-emerald-500/20"
                 : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
            )}
          >
            <Bell className="w-4 h-4" /> e-GP Live
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">
            {lang === 'bn' ? 'সরকারি পোর্টাল থেকে স্ক্যান করা হচ্ছে...' : 'Scanning government portals and RSS feeds...'}
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-200 dark:border-red-900/50">
          <ShieldAlert className="w-10 h-10 text-red-500 mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Newspaper className="w-10 h-10 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">
            {lang === 'bn' ? 'কোনো নোটিশ পাওয়া যায়নি।' : 'No notices found.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {filteredNotices.map((notice, idx) => (
            <motion.a
              key={notice.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              href={notice.link}
              target="_blank"
              rel="noreferrer"
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <span className={cn(
                  "px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md",
                  notice.source.includes('e-GP') ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                )}>
                  {notice.source}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(notice.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {notice.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-auto mb-4">
                {notice.snippet}
              </p>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-blue-600 dark:text-blue-500 font-semibold text-sm">
                <span>{lang === 'bn' ? 'বিস্তারিত দেখুন' : 'Read more'}</span>
                <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </motion.div>
  );
};
