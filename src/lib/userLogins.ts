import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  deleteDoc,
  increment,
  query,
  orderBy 
} from 'firebase/firestore';

export interface CandidateLoginRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  examPreparingFor: string;
  loginCount: number;
  lastLoginAt: string;
  createdAt: string;
  source?: string;
  lastMockTestTitle?: string;
  isDemo?: boolean;
}

export const EXAM_OPTIONS = [
  { value: 'DHA (Dubai Health Authority)', label: 'DHA - Dubai Health Authority (General Practice / Specialist)' },
  { value: 'HAAD / DOH (Abu Dhabi Health Authority)', label: 'HAAD / DOH - Abu Dhabi Department of Health' },
  { value: 'MOHAP (UAE Ministry of Health)', label: 'MOHAP - Ministry of Health & Prevention UAE' },
  { value: 'SMLE (Saudi Medical Licensing Exam)', label: 'SMLE - Saudi Commission for Health Specialties (SCFHS)' },
  { value: 'OMSB (Oman Medical Specialty Board)', label: 'OMSB - Oman Medical Specialty Board' },
  { value: 'QCHP (Qatar Prometric Exam)', label: 'QCHP / DHP - Qatar Council for Healthcare Practitioners' },
  { value: 'NHRA (Bahrain Health Regulatory Authority)', label: 'NHRA - Bahrain National Health Regulatory Authority' },
  { value: 'GP Prometric (General Practice)', label: 'Prometric GP - General Practitioner Licensing' },
  { value: 'Nursing Prometric', label: 'Nursing Prometric - Registered Nurse Licensure' },
  { value: 'Dental Prometric', label: 'Dental Prometric - General & Specialist Dental' },
  { value: 'Other', label: 'Other (Please specify your exam)' },
];

// Helper to make a deterministic Firestore document key from email
function getDocKeyForEmail(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Record a user login or mock test start entry.
 * Increments loginCount if the user already exists, or creates a new entry with loginCount = 1.
 * Writes to both Firestore and localStorage.
 */
export async function recordCandidateLogin(payload: {
  name: string;
  phone: string;
  email: string;
  examPreparingFor: string;
  source?: string;
  testTitle?: string;
}): Promise<CandidateLoginRecord> {
  const email = (payload.email || '').trim().toLowerCase();
  const name = (payload.name || '').trim() || 'Candidate';
  const phone = (payload.phone || '').trim();
  const examPreparingFor = (payload.examPreparingFor || 'DHA (Dubai Health Authority)').trim();
  const source = payload.source || 'Mock Test Start';
  const testTitle = payload.testTitle || '';
  const now = new Date().toISOString();

  const docKey = getDocKeyForEmail(email || phone || `anon_${Date.now()}`);

  let record: CandidateLoginRecord = {
    id: docKey,
    name,
    phone,
    email,
    examPreparingFor,
    loginCount: 1,
    lastLoginAt: now,
    createdAt: now,
    source,
    lastMockTestTitle: testTitle
  };

  // 1. Update in Local Storage first for immediate availability
  try {
    const rawLocal = localStorage.getItem('promedo_user_logins');
    let localList: CandidateLoginRecord[] = rawLocal ? JSON.parse(rawLocal) : [];
    const existingIdx = localList.findIndex(
      item => (item.email && item.email.toLowerCase() === email) || (item.phone && phone && item.phone === phone)
    );

    if (existingIdx >= 0) {
      const existing = localList[existingIdx];
      record = {
        ...existing,
        name: name || existing.name,
        phone: phone || existing.phone,
        email: email || existing.email,
        examPreparingFor: examPreparingFor || existing.examPreparingFor,
        loginCount: (existing.loginCount || 1) + 1,
        lastLoginAt: now,
        lastMockTestTitle: testTitle || existing.lastMockTestTitle,
        source: source || existing.source
      };
      localList[existingIdx] = record;
    } else {
      localList.unshift(record);
    }

    localStorage.setItem('promedo_user_logins', JSON.stringify(localList));
  } catch (err) {
    console.warn("Failed saving user login to localStorage:", err);
  }

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, 'userLogins', docKey);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      const newCount = (existingData.loginCount || 1) + 1;
      await updateDoc(docRef, {
        name: name || existingData.name || 'Candidate',
        phone: phone || existingData.phone || '',
        email: email || existingData.email || '',
        examPreparingFor: examPreparingFor || existingData.examPreparingFor || 'DHA (Dubai Health Authority)',
        loginCount: newCount,
        lastLoginAt: now,
        source: source || existingData.source || 'Mock Test Start',
        ...(testTitle ? { lastMockTestTitle: testTitle } : {})
      });
      record.loginCount = newCount;
    } else {
      await setDoc(docRef, {
        id: docKey,
        name,
        phone,
        email,
        examPreparingFor,
        loginCount: 1,
        lastLoginAt: now,
        createdAt: now,
        source,
        lastMockTestTitle: testTitle
      });
    }
  } catch (err) {
    console.warn("Firestore recordCandidateLogin warning (using offline fallback):", err);
  }

  // Dispatch local notification event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('promedo_user_login_updated', { detail: record }));
  }

  return record;
}

const RESET_LEGACY_KEY = 'promedo_user_logins_reset_v4';

/**
 * Clear all candidate login records from both Firestore and localStorage.
 * Does NOT delete anything from the users collection.
 */
export async function clearAllUserLogins(): Promise<void> {
  try {
    localStorage.removeItem('promedo_user_logins');
  } catch (_) {}

  try {
    const snap = await getDocs(collection(db, 'userLogins'));
    for (const d of snap.docs) {
      await deleteDoc(doc(db, 'userLogins', d.id));
    }
  } catch (err) {
    console.warn("Could not delete from Firestore userLogins:", err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('promedo_user_login_updated', { detail: null }));
  }
}

/**
 * Fetch candidate logins entered directly by users.
 * Automatically clears out any old pre-existing/demo data on first run so the section starts fresh.
 * Only genuine data entered by users (via mock test registration or login) is shown.
 * Preserves the users collection completely untouched.
 */
export async function fetchUserLogins(): Promise<CandidateLoginRecord[]> {
  // If user requested clearing existing data, perform the initial wipe once
  try {
    if (typeof window !== 'undefined' && localStorage.getItem(RESET_LEGACY_KEY) !== 'cleared') {
      localStorage.removeItem('promedo_user_logins');
      localStorage.setItem(RESET_LEGACY_KEY, 'cleared');
      // Also clean up any legacy userLogins documents in Firestore
      try {
        const snap = await getDocs(collection(db, 'userLogins'));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, 'userLogins', d.id));
        }
      } catch (_) {}
      return [];
    }
  } catch (e) {
    console.warn("Error during userLogins reset check:", e);
  }

  const mergedMap = new Map<string, CandidateLoginRecord>();

  // 1. Read localStorage logins (only genuine records)
  try {
    const rawLocal = localStorage.getItem('promedo_user_logins');
    if (rawLocal) {
      const localList: CandidateLoginRecord[] = JSON.parse(rawLocal);
      const cleanList = localList.filter(item => !item.isDemo && !item.id?.startsWith('seed_login_'));
      
      if (cleanList.length !== localList.length) {
        localStorage.setItem('promedo_user_logins', JSON.stringify(cleanList));
      }

      cleanList.forEach(item => {
        const key = (item.email || item.phone || item.id).toLowerCase();
        mergedMap.set(key, item);
      });
    }
  } catch (err) {
    console.warn("Error reading localStorage logins:", err);
  }

  // 2. Read live Firestore userLogins data
  try {
    const snap = await getDocs(collection(db, 'userLogins'));
    for (const d of snap.docs) {
      const data = d.data() as CandidateLoginRecord;
      if (data.isDemo || d.id.startsWith('seed_login_')) {
        try {
          await deleteDoc(doc(db, 'userLogins', d.id));
        } catch (_) {}
        continue;
      }

      const key = (data.email || data.phone || d.id).toLowerCase();
      mergedMap.set(key, { ...data, id: d.id });
    }
  } catch (err) {
    console.warn("Could not query Firestore userLogins:", err);
  }

  const allLogins = Array.from(mergedMap.values());

  // Sort by most recent first by default
  allLogins.sort((a, b) => {
    const timeA = new Date(a.lastLoginAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.lastLoginAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return allLogins;
}
