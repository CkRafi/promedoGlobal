import { doc, getDoc, updateDoc, setDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface UserStats {
  mockTestsTaken: number;
  questionsAttempted: number;
  averageScore: number;
  bestScore: number;
}

export interface MockAttemptRecord {
  id?: string;
  userId: string;
  testId: string;
  testTitle: string;
  score: number;
  questionsAttempted: number;
  totalQuestions: number;
  completedAt: string;
}

const STATS_STORAGE_KEY_PREFIX = 'promedo_stats_';
const ATTEMPTS_STORAGE_KEY_PREFIX = 'promedo_attempts_';

export const INITIAL_USER_STATS: UserStats = {
  mockTestsTaken: 0,
  questionsAttempted: 0,
  averageScore: 0,
  bestScore: 0
};

/**
 * Retrieves the candidate's real mock test stats.
 * Defaults to all zeros for newly created accounts.
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  if (!userId) return { ...INITIAL_USER_STATS };

  try {
    // 1. Try to read stored stats from local storage for instant responsiveness
    const localStatsRaw = localStorage.getItem(`${STATS_STORAGE_KEY_PREFIX}${userId}`);
    let localStats: UserStats | null = null;
    if (localStatsRaw) {
      try {
        localStats = JSON.parse(localStatsRaw);
      } catch (e) {
        // ignore JSON parse error
      }
    }

    // 2. Fetch from Firestore user document
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data?.mockTestsTaken !== undefined) {
        const firestoreStats: UserStats = {
          mockTestsTaken: Number(data.mockTestsTaken) || 0,
          questionsAttempted: Number(data.questionsAttempted) || 0,
          averageScore: Number(data.averageScore) || 0,
          bestScore: Number(data.bestScore) || 0
        };

        // If local has newer/higher attempts, prioritize it, otherwise sync with firestore
        if (localStats && (localStats.mockTestsTaken || 0) > firestoreStats.mockTestsTaken) {
          return localStats;
        }

        // Cache firestore stats to local storage
        try {
          localStorage.setItem(`${STATS_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(firestoreStats));
        } catch (e) {}

        return firestoreStats;
      }
    }

    if (localStats) {
      return localStats;
    }

    return { ...INITIAL_USER_STATS };
  } catch (err) {
    console.warn('Error fetching user stats from Firestore, falling back to local storage:', err);
    const localStatsRaw = localStorage.getItem(`${STATS_STORAGE_KEY_PREFIX}${userId}`);
    if (localStatsRaw) {
      try {
        return JSON.parse(localStatsRaw);
      } catch (e) {}
    }
    return { ...INITIAL_USER_STATS };
  }
}

/**
 * Records a completed mock test attempt and updates aggregate stats.
 */
export async function recordMockAttempt(
  userId: string,
  attempt: {
    testId: string;
    testTitle: string;
    score: number;
    questionsAttempted: number;
    totalQuestions: number;
  }
): Promise<UserStats> {
  const attemptRecord: MockAttemptRecord = {
    userId,
    testId: attempt.testId,
    testTitle: attempt.testTitle,
    score: Math.max(0, Math.min(100, Math.round(attempt.score))),
    questionsAttempted: Math.max(0, attempt.questionsAttempted),
    totalQuestions: Math.max(1, attempt.totalQuestions),
    completedAt: new Date().toISOString()
  };

  // 1. Append attempt to local attempts history
  const attemptsKey = `${ATTEMPTS_STORAGE_KEY_PREFIX}${userId}`;
  let attempts: MockAttemptRecord[] = [];
  try {
    const raw = localStorage.getItem(attemptsKey);
    if (raw) attempts = JSON.parse(raw);
  } catch (e) {}
  attempts.push(attemptRecord);
  try {
    localStorage.setItem(attemptsKey, JSON.stringify(attempts));
  } catch (e) {}

  // 2. Calculate updated aggregate stats
  const mockTestsTaken = attempts.length;
  const questionsAttempted = attempts.reduce((sum, item) => sum + (item.questionsAttempted || 0), 0);
  const totalScoreSum = attempts.reduce((sum, item) => sum + (item.score || 0), 0);
  const averageScore = mockTestsTaken > 0 ? Math.round(totalScoreSum / mockTestsTaken) : 0;
  const bestScore = attempts.reduce((max, item) => Math.max(max, item.score || 0), 0);

  const updatedStats: UserStats = {
    mockTestsTaken,
    questionsAttempted,
    averageScore,
    bestScore
  };

  // 3. Save to local storage
  try {
    localStorage.setItem(`${STATS_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updatedStats));
  } catch (e) {}

  // 4. Update Firestore user document
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      mockTestsTaken: updatedStats.mockTestsTaken,
      questionsAttempted: updatedStats.questionsAttempted,
      averageScore: updatedStats.averageScore,
      bestScore: updatedStats.bestScore,
      lastActiveAt: new Date().toISOString()
    });
  } catch (err) {
    // If updateDoc fails (e.g. document structure), try setDoc with merge
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        mockTestsTaken: updatedStats.mockTestsTaken,
        questionsAttempted: updatedStats.questionsAttempted,
        averageScore: updatedStats.averageScore,
        bestScore: updatedStats.bestScore
      }, { merge: true });
    } catch (mergeErr) {
      console.warn('Could not persist stats to Firestore user document:', mergeErr);
    }
  }

  // 5. Save attempt record to Firestore mockAttempts collection
  try {
    await addDoc(collection(db, 'mockAttempts'), attemptRecord);
  } catch (err) {
    console.warn('Could not save to mockAttempts collection:', err);
  }

  // 6. Broadcast event so open dashboard tabs/windows immediately update the display
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('promedo:stats_updated', { detail: updatedStats }));
    window.dispatchEvent(new CustomEvent('promedo:attempt_added', { detail: attemptRecord }));
  }

  return updatedStats;
}

/**
 * Retrieves the list of mock test attempts taken by the user.
 */
export async function getUserAttempts(userId: string): Promise<MockAttemptRecord[]> {
  if (!userId) return [];

  const attemptsKey = `${ATTEMPTS_STORAGE_KEY_PREFIX}${userId}`;
  let localAttempts: MockAttemptRecord[] = [];
  try {
    const raw = localStorage.getItem(attemptsKey);
    if (raw) {
      localAttempts = JSON.parse(raw);
    }
  } catch (e) {}

  try {
    const q = query(collection(db, 'mockAttempts'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const firestoreAttempts: MockAttemptRecord[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any)
      }));

      // If firestore has records and differs from local, merge or pick the more complete set
      if (firestoreAttempts.length >= localAttempts.length) {
        return firestoreAttempts.sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());
      }
    }
  } catch (err) {
    // Graceful fallback to local attempts
  }

  return (localAttempts || []).sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());
}
