import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';

export interface QuestionReference {
  questionId: string;
  subjectId: string;
  subjectName: string;
  createdAt?: string;
}

export interface ResolvedQuestion {
  id: string;
  subjectId: string;
  subjectName: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface UserCustomModule {
  id: string;
  name: string;
  questionRefs: QuestionReference[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// BOOKMARKS (users/{userId}/bookmarks/{questionId})
// ============================================================================

export function subscribeToUserBookmarks(
  userId: string,
  onUpdate: (bookmarks: QuestionReference[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, 'users', userId, 'bookmarks');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: QuestionReference[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          questionId: (data.questionId as string) || d.id,
          subjectId: (data.subjectId as string) || '',
          subjectName: (data.subjectName as string) || 'General',
          createdAt: data.createdAt as string | undefined
        };
      });
      onUpdate(list);
    },
    (error) => {
      console.error('Error subscribing to user bookmarks:', error);
      if (onError) onError(error);
    }
  );
}

export async function addUserBookmark(
  userId: string,
  ref: Omit<QuestionReference, 'createdAt'>
): Promise<void> {
  // Using questionId as document ID prevents duplicate bookmarks
  const docRef = doc(db, 'users', userId, 'bookmarks', ref.questionId);
  await setDoc(docRef, {
    questionId: ref.questionId,
    subjectId: ref.subjectId,
    subjectName: ref.subjectName,
    createdAt: new Date().toISOString()
  });
}

export async function removeUserBookmark(
  userId: string,
  questionId: string
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'bookmarks', questionId);
  await deleteDoc(docRef);
}

export async function toggleUserBookmark(
  userId: string,
  ref: Omit<QuestionReference, 'createdAt'>,
  isCurrentlyBookmarked: boolean
): Promise<boolean> {
  if (isCurrentlyBookmarked) {
    await removeUserBookmark(userId, ref.questionId);
    return false;
  } else {
    await addUserBookmark(userId, ref);
    return true;
  }
}

// ============================================================================
// SUBJECT BOOKMARKS (users/{userId}/subjectBookmarks/{subjectId})
// ============================================================================

export function subscribeToUserSubjectBookmarks(
  userId: string,
  onData: (subjectIds: string[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, 'users', userId, 'subjectBookmarks');
  return onSnapshot(
    colRef,
    (snapshot) => {
      onData(snapshot.docs.map((d) => d.id));
    },
    (err) => {
      console.error('Error subscribing to subject bookmarks:', err);
      if (onError) onError(err);
    }
  );
}

export async function toggleUserSubjectBookmark(
  userId: string,
  subjectId: string,
  isCurrentlyBookmarked: boolean
): Promise<boolean> {
  const docRef = doc(db, 'users', userId, 'subjectBookmarks', subjectId);
  if (isCurrentlyBookmarked) {
    await deleteDoc(docRef);
    return false;
  } else {
    await setDoc(docRef, {
      subjectId,
      createdAt: new Date().toISOString(),
    });
    return true;
  }
}

// ============================================================================
// CUSTOM MODULES (users/{userId}/customModules/{moduleId})
// ============================================================================

export function subscribeToUserCustomModules(
  userId: string,
  onUpdate: (modules: UserCustomModule[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, 'users', userId, 'customModules');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: UserCustomModule[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: (data.name as string) || 'Untitled Module',
          questionRefs: Array.isArray(data.questionRefs) ? data.questionRefs : [],
          createdAt: (data.createdAt as string) || new Date().toISOString(),
          updatedAt: (data.updatedAt as string) || new Date().toISOString()
        };
      });
      onUpdate(list);
    },
    (error) => {
      console.error('Error subscribing to user custom modules:', error);
      if (onError) onError(error);
    }
  );
}

export async function createUserCustomModule(
  userId: string,
  name: string,
  questionRefs: QuestionReference[]
): Promise<string> {
  const now = new Date().toISOString();
  const colRef = collection(db, 'users', userId, 'customModules');
  const docRef = await addDoc(colRef, {
    name: name.trim(),
    questionRefs: questionRefs.map((r) => ({
      questionId: r.questionId,
      subjectId: r.subjectId,
      subjectName: r.subjectName
    })),
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
}

export async function updateUserCustomModule(
  userId: string,
  moduleId: string,
  name: string,
  questionRefs: QuestionReference[]
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'customModules', moduleId);
  await updateDoc(docRef, {
    name: name.trim(),
    questionRefs: questionRefs.map((r) => ({
      questionId: r.questionId,
      subjectId: r.subjectId,
      subjectName: r.subjectName
    })),
    updatedAt: new Date().toISOString()
  });
}

export async function deleteUserCustomModule(
  userId: string,
  moduleId: string
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'customModules', moduleId);
  await deleteDoc(docRef);
}

// ============================================================================
// QUESTION REFERENCE RESOLUTION
// ============================================================================

export async function resolveQuestionReferences(
  refs: QuestionReference[]
): Promise<ResolvedQuestion[]> {
  if (!refs || refs.length === 0) return [];

  // Group by subjectId to fetch each subject's questions once
  const bySubject = new Map<string, QuestionReference[]>();
  refs.forEach((r) => {
    const list = bySubject.get(r.subjectId) || [];
    list.push(r);
    bySubject.set(r.subjectId, list);
  });

  const resolvedMap = new Map<string, ResolvedQuestion>();

  await Promise.all(
    Array.from(bySubject.entries()).map(async ([subjectId, subjRefs]) => {
      if (!subjectId) return;
      const subjectName = subjRefs[0]?.subjectName || subjectId;
      const subjectQuestions = new Map<string, ResolvedQuestion>();

      try {
        const snap = await getDocs(collection(db, `questionBank/${subjectId}/questions`));
        snap.docs.forEach((d) => {
          const data = d.data();
          subjectQuestions.set(d.id, {
            id: d.id,
            subjectId,
            subjectName,
            text: (data.text as string) || '',
            options: Array.isArray(data.options) ? data.options : [],
            correctAnswer: typeof data.correctAnswer === 'number' ? data.correctAnswer : 0,
            explanation: (data.explanation as string) || '',
            imageUrl: data.imageUrl as string | undefined,
            createdAt: data.createdAt as string | undefined
          });
        });
      } catch (err) {
        // Fallback to localStorage if Firestore read fails
        try {
          const raw = localStorage.getItem(`local_questions_${subjectId}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach((q: any) => {
                subjectQuestions.set(q.id, {
                  id: q.id,
                  subjectId,
                  subjectName,
                  text: q.text || '',
                  options: Array.isArray(q.options) ? q.options : [],
                  correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
                  explanation: q.explanation || '',
                  imageUrl: q.imageUrl,
                  createdAt: q.createdAt
                });
              });
            }
          }
        } catch (_) {}
      }

      subjRefs.forEach((r) => {
        const found = subjectQuestions.get(r.questionId);
        if (found) {
          resolvedMap.set(r.questionId, found);
        }
      });
    })
  );

  // Preserve original reference order
  return refs
    .map((r) => resolvedMap.get(r.questionId))
    .filter((q): q is ResolvedQuestion => Boolean(q));
}
