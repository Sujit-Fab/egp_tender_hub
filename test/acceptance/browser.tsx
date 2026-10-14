import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import TenderRadarAdminUpload from '../../src/components/TenderRadarAdminUpload';
import { signIn, logout, directWrite, auth, anonymous, createProfile } from './firebase-browser';

// Production admin component, real Firebase SDK and real HTTP endpoints; only
// Firebase initialization is aliased to a fail-closed emulator bootstrap.
function AcceptancePage() {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  return <><nav>
    {(['admin', 'ordinary', 'other'] as const).map(account =>
      <button key={account} onClick={() => { void signIn(account); }}>Sign in {account}</button>)}
    <button onClick={() => { void logout(); }}>Sign out</button>
    <button onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}>Switch language</button>
  </nav><TenderRadarAdminUpload lang={lang} /></>;
}
Object.assign(window, { acceptance: { directWrite, auth, anonymous, createProfile } });
createRoot(document.getElementById('root')!).render(<AcceptancePage />);
