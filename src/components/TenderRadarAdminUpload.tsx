import { useEffect, useRef, useState } from 'react';
import { auth, onAuthStateChanged } from '../firebase';
import { createAdminUploadSession, type UploadState } from '../lib/tender-radar/admin-upload';

const labels = {
  en: ['Admin: import e-GP tender PDF', 'Validate the PDF first, then confirm the import. Email delivery remains disabled.',
    'e-GP All Tenders PDF (maximum 10 MiB)', 'Expected tender rows (1–400)',
    'Count the actual exported table rows. The portal pagination total may differ.', 'Validate and preview',
    'Validating PDF…', 'Importing tenders…', 'Confirm import', 'PDF verified', 'Verified rows', 'New tenders',
    'Identical existing tenders', 'Conflicting tender IDs', 'Warnings', 'Informational diagnostics',
    'An existing tender ID has different content. Import is blocked; existing tenders will not be overwritten.',
    'This PDF was already imported. Confirming it will not create duplicates.',
    'The request failed. Check administrator access, the PDF layout, size and row count, then validate again.',
    'Import complete. New tenders saved:', 'Identical tenders skipped:', 'This PDF was already imported. No tenders were added.',
    'Preview does not save tenders. Confirmation verifies the same PDF again before saving.'],
  bn: ['অ্যাডমিন: e-GP টেন্ডার PDF আমদানি', 'আগে PDF যাচাই করুন, তারপর আমদানি নিশ্চিত করুন। ইমেইল পাঠানো বন্ধ আছে।',
    'e-GP All Tenders PDF (সর্বোচ্চ ১০ MiB)', 'প্রত্যাশিত টেন্ডার সারি (১–৪০০)',
    'রপ্তানি করা টেবিলের প্রকৃত সারি গুনুন। পোর্টালের মোট সংখ্যা ভিন্ন হতে পারে।', 'যাচাই ও প্রিভিউ',
    'PDF যাচাই হচ্ছে…', 'টেন্ডার আমদানি হচ্ছে…', 'আমদানি নিশ্চিত করুন', 'PDF যাচাই সফল', 'যাচাইকৃত সারি', 'নতুন টেন্ডার',
    'আগে সংরক্ষিত একই টেন্ডার', 'বিরোধপূর্ণ টেন্ডার আইডি', 'সতর্কতা', 'তথ্যমূলক যাচাই বার্তা',
    'আগে সংরক্ষিত টেন্ডার আইডির তথ্য ভিন্ন। এই আমদানি বন্ধ রাখা হয়েছে; আগের তথ্য পরিবর্তন হবে না।',
    'এই PDF আগে আমদানি করা হয়েছে। আবার নিশ্চিত করলে নকল টেন্ডার তৈরি হবে না।',
    'অনুরোধ ব্যর্থ হয়েছে। অ্যাডমিন অনুমতি, PDF-এর বিন্যাস, আকার ও সারির সংখ্যা পরীক্ষা করে আবার যাচাই করুন।',
    'আমদানি সম্পন্ন। নতুন টেন্ডার সংরক্ষিত:', 'একই টেন্ডার বাদ দেওয়া হয়েছে:', 'এই PDF আগে আমদানি করা হয়েছে। নতুন টেন্ডার যোগ হয়নি।',
    'প্রিভিউতে টেন্ডার সংরক্ষিত হয় না। নিশ্চিত করার সময় একই PDF আবার যাচাই করে সংরক্ষণ করা হয়।'],
};

export function AdminUploadView({ state, select, preview, confirm, lang = 'en' }: {
  state: UploadState; select(file: File | null, count: string): void; preview(): void; confirm(): void; lang?: 'en' | 'bn';
}) {
  const t = labels[lang];
  const valid = !!state.file && /^[1-9]\d{0,2}$/.test(state.count) && Number(state.count) <= 400 && state.file.size <= 10 * 1024 * 1024;
  return <section aria-labelledby="radar-admin-heading" className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
    <h2 id="radar-admin-heading" className="text-lg font-bold">{t[0]}</h2>
    <p className="mt-2 text-sm">{t[1]}</p>
    <form onSubmit={event => { event.preventDefault(); preview(); }} className="mt-4 space-y-3">
      <fieldset disabled={!!state.busy} className="space-y-3">
        <label htmlFor="radar-admin-file" className="block text-sm font-semibold">{t[2]}</label>
        <input id="radar-admin-file" type="file" accept="application/pdf,.pdf" onChange={event => select(event.target.files?.[0] ?? null, state.count)} className="block w-full text-sm" />
        <label htmlFor="radar-admin-count" className="block text-sm font-semibold">{t[3]}</label>
        <input id="radar-admin-count" type="number" min="1" max="400" step="1" required value={state.count}
          aria-describedby="radar-admin-count-help" onChange={event => select(state.file, event.target.value)} className="rounded border bg-transparent p-2" />
        <p id="radar-admin-count-help" className="text-sm">{t[4]}</p>
        <button type="submit" disabled={!valid || !!state.busy} className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50">{t[5]}</button>
      </fieldset>
    </form>
    <p className="mt-3 text-sm">{t[22]}</p>
    {state.busy && <p role="status" className="mt-3">{state.busy === 'preview' ? t[6] : t[7]}</p>}
    {state.error && <p role="alert" className="mt-3 text-red-700 dark:text-red-300">{t[18]}</p>}
    {state.preview && <div className="mt-5 space-y-3">
      <h3 className="font-semibold">{t[9]}</h3>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {[state.preview.totalCount, state.preview.newCount, state.preview.duplicateCount, state.preview.conflictCount,
          state.preview.warningCount, state.preview.infoCount].map((value, index) =>
          <div key={index}><dt>{t[index + 10]}</dt><dd className="font-semibold">{value}</dd></div>)}
      </dl>
      <ul className="text-sm">{Object.entries(state.preview.byCategory).map(([category, count]) => <li key={category}>{category}: {count}</li>)}</ul>
      {state.preview.alreadyImported && <p role="status">{t[17]}</p>}
      {state.preview.conflictCount > 0 && <p role="alert" className="text-red-700 dark:text-red-300">{t[16]}</p>}
      <button type="button" disabled={!!state.busy || state.preview.conflictCount > 0} onClick={confirm}
        className="rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50">{t[8]}</button>
    </div>}
    {state.result && <p role="status" className="mt-4">{state.result.status === 'already_imported' ? t[21] :
      `${t[19]} ${state.result.createdCount}. ${t[20]} ${state.result.duplicateCount}.`}</p>}
  </section>;
}

export default function TenderRadarAdminUpload({ lang = 'en' }: { lang?: 'en' | 'bn' }) {
  const [state, setState] = useState<UploadState | null>(null);
  const session = useRef<ReturnType<typeof createAdminUploadSession> | null>(null);
  useEffect(() => {
    let generation = 0;
    const unsubscribe = onAuthStateChanged(auth, async user => {
      const currentGeneration = ++generation;
      session.current?.dispose(); session.current = null; setState(null);
      if (!user || user.isAnonymous) return;
      try {
        const token = await user.getIdTokenResult(true);
        if (generation !== currentGeneration || auth.currentUser?.uid !== user.uid || token.claims.admin !== true) return;
        const next = createAdminUploadSession(user.uid, {
          currentUid: () => auth.currentUser?.uid ?? null,
          async request(action, file, count, previewHash, signal) {
            const bearer = await user.getIdToken(true);
            if (auth.currentUser?.uid !== user.uid || signal.aborted) throw new Error('Session changed');
            const headers: Record<string, string> = { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/pdf',
              'X-Tender-Radar-Expected-Count': count };
            if (previewHash) headers['X-Tender-Radar-Preview-Hash'] = previewHash;
            const response = await fetch(`/api/tender-radar/${action}`, { method: 'POST', headers, body: file, signal });
            if (!response.ok) throw new Error('Import request failed');
            return response.json();
          },
        }, setState);
        session.current = next;
        setState(next.snapshot());
      } catch { /* No upload UI until a current admin token is available. */ }
    });
    return () => { generation++; unsubscribe(); session.current?.dispose(); session.current = null; };
  }, []);
  if (!state) return null;
  return <AdminUploadView state={state} lang={lang} select={(file, count) => session.current?.select(file, count)}
    preview={() => { void session.current?.preview(); }} confirm={() => { void session.current?.confirm(); }} />;
}
