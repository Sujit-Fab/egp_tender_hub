import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, onAuthStateChanged } from "../firebase";
import { normalizeTenderCategories, TENDER_CATEGORIES, type TenderCategory } from "../lib/tender-radar/categorizer";

export interface PreferencesState {
  uid: string | null;
  tier: unknown;
  selected: TenderCategory[];
  loading: boolean;
  saving: boolean;
  saved: boolean;
  loaded: boolean;
  error: string | null;
}

interface PreferencesStore {
  currentUid(): string | null;
  read(uid: string): Promise<{ subscriptionTier?: unknown; tenderCategories?: unknown }>;
  write(uid: string, categories: TenderCategory[]): Promise<void>;
}

const isPaidTier = (tier: unknown) => tier === "pro" || tier === "enterprise";

// Capture Auth identity, never a caller-provided user ID. Disposed sessions
// cannot publish old account responses into a new account's state.
export function createTenderRadarSession(store: PreferencesStore, publish: (state: PreferencesState) => void) {
  const uid = store.currentUid();
  let active = true;
  let reading = false;
  let writing = false;
  let state: PreferencesState = {
    uid, tier: null, selected: [], loading: false, saving: false, saved: false, loaded: false, error: null,
  };
  const current = () => active && uid !== null && store.currentUid() === uid;
  const update = (changes: Partial<PreferencesState>) => {
    state = { ...state, ...changes };
    if (current()) publish({ ...state, selected: [...state.selected] });
  };
  return {
    snapshot: () => ({ ...state, selected: [...state.selected] }),
    dispose: () => { active = false; },
    select(values: unknown) {
      if (!current() || !state.loaded || !isPaidTier(state.tier) || reading || writing) return;
      update({ selected: normalizeTenderCategories(values), saved: false, error: null });
    },
    async load() {
      if (!current() || reading || writing) return;
      reading = true;
      update({ loading: true, loaded: false, selected: [], tier: null, saved: false, error: null });
      try {
        if (!current()) return;
        const data = await store.read(uid!);
        if (current()) update({
          tier: data.subscriptionTier, selected: normalizeTenderCategories(data.tenderCategories), loaded: true,
        });
      } catch {
        if (current()) update({ error: "Could not load your preferences. Please try again." });
      } finally {
        reading = false;
        update({ loading: false });
      }
    },
    async save() {
      if (!current() || reading || writing || !state.loaded || !isPaidTier(state.tier)) return;
      writing = true;
      const categories = [...state.selected];
      update({ saving: true, saved: false, error: null });
      try {
        // No await occurs between identity validation and starting the write.
        if (!current()) return;
        await store.write(uid!, categories);
        if (current()) update({ saved: true });
      } catch {
        if (current()) update({ error: "Could not save your preferences. Please try again." });
      } finally {
        writing = false;
        update({ saving: false });
      }
    },
  };
}

interface ViewProps {
  state: PreferencesState;
  select(values: TenderCategory[]): void;
  save(): void;
  reload(): void;
  onUpgrade?: () => void;
}

export function TenderRadarPreferencesView({ state, select, save, reload, onUpgrade }: ViewProps) {
  const { selected, loading, saving, saved, loaded, error } = state;
  return (
    <section aria-labelledby="tender-radar-heading" className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <h2 id="tender-radar-heading" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
        <Bell size={20} aria-hidden="true" /> Tender Radar
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Save category preferences for future Tender Radar notifications. Email delivery is not enabled.
      </p>
      {error && <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
      {loading && <p role="status" className="mt-3 text-sm">Loading your preferences…</p>}
      {!loading && !loaded && <button type="button" onClick={reload} className="mt-3 rounded border px-4 py-2">Retry loading preferences</button>}
      {loaded && !isPaidTier(state.tier) && (
        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-amber-900">
          <p>Category preferences are available on Pro and Enterprise plans.</p>
          {onUpgrade && <button type="button" onClick={onUpgrade} className="mt-2 rounded border px-4 py-2">View plans</button>}
          <button type="button" onClick={reload} className="ml-2 mt-2 rounded border px-4 py-2">Refresh plan</button>
        </div>
      )}
      {loaded && isPaidTier(state.tier) && (
        <form onSubmit={event => { event.preventDefault(); save(); }}>
          <fieldset disabled={loading || saving} className="mt-5">
            <legend className="text-sm font-semibold text-slate-900 dark:text-white">Tender categories</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {TENDER_CATEGORIES.map((category, index) => {
                const id = `tender-radar-category-${index}`;
                const checked = selected.includes(category.id);
                return (
                  <div key={category.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-600">
                    <input id={id} name="tenderCategories" value={category.id} type="checkbox" checked={checked} aria-describedby={`${id}-description`}
                      className="mt-1 h-4 w-4" onChange={() => select(checked ? selected.filter(value => value !== category.id) : [...selected, category.id])} />
                    <label htmlFor={id} className="cursor-pointer text-sm text-slate-900 dark:text-white">
                      <span className="font-semibold">{category.id}</span>
                      <span id={`${id}-description`} className="mt-1 block text-xs text-slate-600 dark:text-slate-300">{category.desc}</span>
                    </label>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              {selected.length === 0 ? "No categories selected. Save to opt out of future notifications." : `${selected.length} categories selected.`}
            </p>
            <div className="mt-4 flex gap-3">
              <button type="submit" className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save preferences"}</button>
              <button type="button" onClick={() => select([])} disabled={selected.length === 0} className="rounded-lg border px-4 py-2 text-sm">Clear all</button>
            </div>
          </fieldset>
          {saving && <p role="status" className="mt-3 text-sm">Saving your preferences…</p>}
          {saved && <p role="status" className="mt-3 text-sm text-green-700 dark:text-green-300">Preferences saved. Email delivery is not enabled.</p>}
        </form>
      )}
    </section>
  );
}

export default function TenderRadarSettings({ onUpgrade }: { onUpgrade?: () => void }) {
  const [state, setState] = useState<PreferencesState | null>(null);
  const session = useRef<ReturnType<typeof createTenderRadarSession> | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      session.current?.dispose();
      session.current = null;
      setState(null);
      if (!currentUser) return;
      const next = createTenderRadarSession({
        currentUid: () => auth.currentUser?.uid ?? null,
        async read(uid) {
          const snapshot = await getDoc(doc(db, "users", uid));
          if (!snapshot.exists()) throw new Error("Preferences document unavailable");
          return snapshot.data();
        },
        async write(uid, categories) {
          await updateDoc(doc(db, "users", uid), { tenderCategories: categories });
        },
      }, setState);
      session.current = next;
      void next.load();
    });
    return () => { unsubscribe(); session.current?.dispose(); session.current = null; };
  }, []);

  if (!auth.currentUser) return <p role="status">Sign in to manage your Tender Radar preferences.</p>;
  if (!state || state.uid !== auth.currentUser.uid) return <p role="status">Loading your preferences…</p>;
  return <TenderRadarPreferencesView state={state} onUpgrade={onUpgrade}
    select={values => session.current?.select(values)} save={() => { void session.current?.save(); }}
    reload={() => { void session.current?.load(); }} />;
}
