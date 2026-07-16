import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { ServiceAccount } from 'firebase-admin';

function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey } as ServiceAccount),
    });
  }

  return null;
}

export function getWhitelistDb() {
  const app = getFirebaseApp();
  if (!app) return null;
  return getFirestore(app).collection('whitelist');
}

export async function getWhitelistedUser(email: string): Promise<{ email: string; role: string } | null> {
  const col = getWhitelistDb();
  if (!col) return null;
  const doc = await col.doc(email.toLowerCase()).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return { email: data.email, role: data.role };
}

export async function getAllWhitelistedUsers(): Promise<{ id: string; email: string; role: string; createdAt: string }[]> {
  const col = getWhitelistDb();
  if (!col) return [];
  const snapshot = await col.orderBy('createdAt', 'asc').get();
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));
}

export async function addWhitelistUser(email: string, role: string): Promise<void> {
  const col = getWhitelistDb();
  if (!col) throw new Error('Firebase not configured');
  await col.doc(email.toLowerCase()).set({ email: email.toLowerCase(), role, createdAt: new Date().toISOString() });
}

export async function removeWhitelistUser(email: string): Promise<void> {
  const col = getWhitelistDb();
  if (!col) throw new Error('Firebase not configured');
  await col.doc(email.toLowerCase()).delete();
}

export async function seedWhitelist(): Promise<void> {
  const col = getWhitelistDb();
  if (!col) return;

  const defaultUsers = [
    { email: 'lollino066@gmail.com', role: 'admin' },
    { email: 'lolloepicg@gmail.com', role: 'user' },
    { email: 'giuliettoutente@gmail.com', role: 'user' },
    { email: 'Davidcappelletti@gmail.com', role: 'user' },
  ];

  for (const u of defaultUsers) {
    const doc = col.doc(u.email.toLowerCase());
    const snap = await doc.get();
    if (!snap.exists) {
      await doc.set({ email: u.email.toLowerCase(), role: u.role, createdAt: new Date().toISOString() });
    }
  }
}

export function isFirebaseConfigured(): boolean {
  return !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}
