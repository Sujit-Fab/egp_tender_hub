import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Newspaper, ChevronRight, ArrowLeft, Calendar, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getBlogPosts } from '../content/blogPosts';

export const Blog = ({ lang }: { lang: 'en' | 'bn' }) => {
  const [activePostIdx, setActivePostIdx] = useState<number | null>(null);

  const posts = getBlogPosts(lang);

  if (activePostIdx !== null) {
    const activePost = posts[activePostIdx];
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-3xl mx-auto py-12 px-4 space-y-8"
      >
        <button
          onClick={() => setActivePostIdx(null)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg w-auto hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {lang === 'bn' ? 'ফিরে যান' : 'Back to Articles'}
        </button>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
              <Tag className="w-4 h-4" />
              {activePost.category}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {activePost.date}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {activePost.title}
          </h1>

          <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-8"></div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
            <style>{`
              .prose h2 { color: var(--tw-prose-headings); font-size: 1.5rem; font-weight: 800; margin-top: 2em; margin-bottom: 1em; }
              .prose h3 { color: var(--tw-prose-headings); font-size: 1.25rem; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
              .prose p { margin-top: 1.25em; margin-bottom: 1.25em; line-height: 1.75; }
              .prose ul { margin-top: 1.25em; margin-bottom: 1.25em; padding-left: 1.625em; list-style-type: disc; }
              .prose li { margin-top: 0.5em; margin-bottom: 0.5em; }
              .prose strong { color: var(--tw-prose-bold); font-weight: 700; }
              .prose blockquote { border-left-width: 4px; border-left-color: #3b82f6; padding-left: 1rem; font-style: italic; color: #64748b; background-color: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-top: 1.5rem; margin-bottom: 1.5rem; }
              .dark .prose blockquote { background-color: #1e293b; color: #94a3b8; border-left-color: #60a5fa; }
              .dark .prose h2, .dark .prose h3 { color: #f8fafc; }
              .dark .prose strong { color: #f8fafc; }
            `}</style>
            <div className="markdown-body">
              <ReactMarkdown>{lang === 'bn' ? activePost.contentBn : activePost.contentEn}</ReactMarkdown>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 py-12 px-4 shadow-[0_0_0_1px_transparent]"
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4 border border-blue-100 dark:border-blue-800">
          <Newspaper className="w-4 h-4" />
          <span>News & Insights</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {lang === 'bn' ? 'উন্নয়ন ও দরপত্র বিষয়ক ব্লগ' : 'eGPTenderHub Insights'}
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {lang === 'bn'
            ? 'পিপিআর আপডেট, ই-জিপি টিপস এবং ঠিকাদারি ব্যবসার প্রসারের জন্য প্রবন্ধ।'
            : 'Stay updated with the latest in Bangladesh procurement rules, e-GP strategies, and AI innovations.'}
        </p>
      </div>

      <div className="space-y-6">
        {posts.map((post, idx) => (
          <div
            key={idx}
            onClick={() => setActivePostIdx(idx)}
            className="group flex flex-col md:flex-row gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="w-full md:w-1/4 aspect-video md:aspect-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                <Newspaper className="w-10 h-10 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors mb-2" />
                <span className="text-xs font-bold text-slate-400 group-hover:text-blue-500 transition-colors uppercase tracking-wider">{post.category}</span>
            </div>
            <div className="w-full md:w-3/4 flex flex-col justify-center space-y-3">
              <div className="flex items-center gap-4 text-xs font-semibold tracking-wider text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {post.date}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="pt-2 flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                {lang === 'bn' ? 'বিস্তারিত পড়ুন' : 'Read Article'} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-8">
         <button className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold transition-colors shadow-sm">
            {lang === 'bn' ? 'আরও দেখুন' : 'Load More Posts'}
         </button>
      </div>
    </motion.div>
  );
};
