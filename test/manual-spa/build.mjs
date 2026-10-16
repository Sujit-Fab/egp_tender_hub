import path from 'node:path';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

export const output = path.resolve('.cache/tender-radar/manual-spa/build');
export function assertLoopbackLinks(links) {
  if (!Array.isArray(links) || links.length !== 1 || links[0].ifname !== 'lo' ||
      !Array.isArray(links[0].flags) || !links[0].flags.includes('LOOPBACK') || !links[0].flags.includes('UP')) {
    throw new Error('An active loopback-only network namespace is required.');
  }
}
export function assertLoopbackNamespace() {
  // Query the current network namespace directly. A mounted sysfs can retain
  // the host namespace's interface inventory after unshare --net.
  assertLoopbackLinks(JSON.parse(execFileSync('ip', ['-j', 'link', 'show'], { encoding: 'utf8' })));
}
export function demoBootstrap(source) {
  const replacements = [
    ["import firebaseConfig from '../firebase-applet-config.json';", `import { connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';
if (location.origin !== 'http://127.0.0.1:4179') throw new Error('Manual SPA requires its dedicated loopback origin.');
const firebaseConfig = { projectId: 'demo-tender-radar', apiKey: 'demo-only-key', appId: 'demo-only-app',
  authDomain: 'demo-tender-radar.firebaseapp.com', storageBucket: 'demo-tender-radar.appspot.com',
  firestoreDatabaseId: 'ai-studio-7e6a1daf-95b8-46d0-a6ba-7cf295cd1701' };`],
    ['export const auth = getAuth(app);', "export const auth = getAuth(app);\nconnectAuthEmulator(auth, 'http://127.0.0.1:9098');"],
    ['export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);', "export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);\nconnectFirestoreEmulator(db, '127.0.0.1', 8085);"],
    ['export const storage = getStorage(app);', "export const storage = getStorage(app);\nconnectStorageEmulator(storage, '127.0.0.1', 9198);"],
    ['return await signInWithPopup(auth, googleProvider);', `const account = window.prompt('DEMO ONLY: enter admin, ordinary, or other', 'admin');
    if (!['admin', 'ordinary', 'other'].includes(account ?? '')) throw new Error('Choose a demo account.');
    return await signInWithEmailAndPassword(auth, account + '@example.invalid', 'Emulator-only-password-2026');`],
  ];
  for (const [before, after] of replacements) {
    if (source.split(before).length !== 2) throw new Error('Firebase bootstrap changed; manual substitution must be reviewed.');
    source = source.replace(before, after);
  }
  return source;
}

export async function buildManualSpa() {
  // Never import the production Vite config: it loads .env and embeds a live key.
  const [{ build }, { default: react }, { default: tailwind }, { VitePWA }] = await Promise.all([
    import('vite'), import('@vitejs/plugin-react'), import('@tailwindcss/vite'), import('vite-plugin-pwa'),
  ]);
  const firebase = path.resolve('src/firebase.ts').replaceAll('\\', '/');
  const modules = new Map();
  await build({ configFile: false, envFile: false, envDir: false, publicDir: false,
    define: { 'process.env.GEMINI_API_KEY': JSON.stringify('') },
    resolve: { alias: { '@': process.cwd() } },
    build: { outDir: output, emptyOutDir: true, target: 'esnext' },
    plugins: [{ name: 'manual-demo-only', enforce: 'pre',
      resolveId(id) {
        if (id.includes('firebase-applet-config')) throw new Error('Production Firebase configuration forbidden.');
      },
      async load(id) {
        if (id.replaceAll('\\', '/') === firebase) return demoBootstrap(await readFile(id, 'utf8'));
      },
      transform(code, id) {
        if (id.replaceAll('\\', '/').endsWith('/src/App.tsx')) {
          code = code.replace(/https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/gen-lang-client-0089421810[^"'\s]*/g, '/manual-icon.svg');
        }
        if (!id.includes('node_modules')) modules.set(id, createHash('sha256').update(code).digest('hex'));
        return { code, map: null };
      },
      generateBundle(options, bundle) {
        for (const item of Object.values(bundle)) {
          if (item.type === 'chunk' && item.code.includes('gen-lang-client-0089421810')) {
            throw new Error('Production project reference in manual browser bundle.');
          }
        }
        this.emitFile({ type: 'asset', fileName: 'manual-icon.svg', source: '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="80" fill="#2563eb"/><text x="256" y="285" text-anchor="middle" font-size="100" fill="white">DEMO</text></svg>' });
      },
      transformIndexHtml(html) {
        return html.replace(/<script\b[^>]*src="https:[^>]*><\/script>/g, '')
          .replace(/<script>\s*window\.dataLayer[\s\S]*?<\/script>/, '')
          .replace(/<link[^>]*(?:rel="manifest"|rel="apple-touch-icon")[^>]*>/g, '');
      },
    }, react(), tailwind(), VitePWA({ registerType: 'autoUpdate',
      workbox: { maximumFileSizeToCacheInBytes: 4 * 1024 * 1024 },
      manifest: { name: 'eGPTenderHub DEMO acceptance', short_name: 'Tender DEMO', start_url: '/',
        display: 'standalone', theme_color: '#2563eb', background_color: '#ffffff',
        icons: [{ src: '/manual-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }] },
    })],
  });
  const sourceRevision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(path.join(path.dirname(output), 'build.json'), JSON.stringify({ sourceRevision,
    builtAt: new Date().toISOString(), modules: Object.fromEntries(modules), manualAcceptanceComplete: false }, null, 2));
}
