import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, onAuthStateChanged, signInWithEmailAndPassword, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

if (location.origin !== 'http://127.0.0.1:4178') throw new Error('Acceptance browser must run on the isolated loopback origin.');
const app = initializeApp({ projectId: 'demo-tender-radar', apiKey: 'demo-only-key', appId: 'demo-only-app' });
export const auth = getAuth(app);
connectAuthEmulator(auth, 'http://127.0.0.1:9098');
export const db = getFirestore(app, 'ai-studio-7e6a1daf-95b8-46d0-a6ba-7cf295cd1701');
connectFirestoreEmulator(db, '127.0.0.1', 8085);
export { onAuthStateChanged };

export async function signIn(account: 'admin' | 'ordinary' | 'other') {
  return signInWithEmailAndPassword(auth, `${account}@example.invalid`, 'Emulator-only-password-2026');
}
export const logout = () => signOut(auth);
export const anonymous = () => signInAnonymously(auth);
export async function createProfile() {
  const user = auth.currentUser!;
  await setDoc(doc(db, 'users', user.uid), { uid: user.uid, email: user.email ?? '', role: 'user',
    subscriptionTier: 'free', scansThisMonth: 0 });
}
export async function directWrite(collection: string, operation: 'create' | 'update' | 'delete') {
  const reference = doc(db, collection, operation === 'create' ? 'direct-client-new' : 'direct-client-test');
  try {
    if (operation === 'delete') await deleteDoc(reference);
    else if (operation === 'update') await updateDoc(reference, { unexpected: true });
    else await setDoc(reference, { unexpected: true });
    return 'allowed';
  } catch (error: any) { return error.code; }
}
