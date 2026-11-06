import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  Bookmark, 
  BookmarkCheck, 
  Sliders, 
  PlayCircle, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Search, 
  Filter, 
  RotateCcw, 
  HelpCircle, 
  Check, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Award, 
  BookOpen, 
  FileText, 
  Layers, 
  ListOrdered, 
  Share2,
  AlertCircle,
  Plus,
  Star,
  Folder,
  FolderPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, query, orderBy } from 'firebase/firestore';
import { usePortalSections } from '../lib/portalSections';
import {
  QuestionReference,
  ResolvedQuestion,
  UserCustomModule,
  subscribeToUserBookmarks,
  toggleUserBookmark,
  removeUserBookmark,
  subscribeToUserSubjectBookmarks,
  toggleUserSubjectBookmark,
  subscribeToUserCustomModules,
  createUserCustomModule,
  updateUserCustomModule,
  deleteUserCustomModule,
  resolveQuestionReferences
} from '../lib/userQuestionService';
import {
  QuestionFolder,
  subscribeToQuestionFolders,
  subscribeToUserFolderBookmarks,
  toggleUserFolderBookmark
} from '../lib/questionFolders';

export interface MCQQuestion {
  id: string;
  subject: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  clinicalPearl?: string;
  isBookmarked?: boolean;
}

export interface CustomModuleConfig {
  title: string;
  subjects: string[];
  mode: 'tutor' | 'exam';
  questionCount: number;
  questionPool: 'all' | 'bookmarked' | 'high_yield';
  timePerQuestionSeconds: number;
}

export interface SavedModuleRecord {
  id: string;
  title: string;
  date: string;
  score: number;
  totalQuestions: number;
  mode: 'tutor' | 'exam';
  subjects: string[];
}

// Initial high-yield Prometric recall questions curated for Gulf licensing exams
const DEFAULT_QUESTION_POOL: MCQQuestion[] = [
  {
    id: 'q-im-1',
    subject: 'Internal Medicine',
    text: 'A 58-year-old male with type 2 diabetes presents with crushing substernal chest pain radiating to his left jaw for 45 minutes. ECG reveals ST-segment elevation in leads II, III, and aVF with reciprocal ST depression in I and aVL. Blood pressure is 92/60 mmHg, heart rate is 50 bpm, and clear lung fields on auscultation. Which of the following medications is strictly contraindicated in this patient’s initial management?',
    options: [
      'Aspirin 300 mg chewed',
      'Intravenous Nitroglycerin infusion',
      'Unfractionated Heparin intravenous bolus',
      'Ticagrelor 180 mg loading dose'
    ],
    correctAnswer: 1,
    explanation: 'Nitroglycerin and other nitrates are strictly contraindicated in acute inferior STEMI with right ventricular involvement or hypotension, as right ventricular output is strictly preload-dependent. Vasodilators cause severe refractory hypotension and cardiogenic shock.',
    clinicalPearl: 'Inferior MI (leads II, III, aVF) frequently involves the right coronary artery and RV. Always obtain right-sided lead V4R before administering nitrates or beta-blockers.',
    isBookmarked: true
  },
  {
    id: 'q-surg-1',
    subject: 'General Surgery',
    text: 'A 28-year-old unrestrained driver is brought to the trauma bay following a high-speed collision. He is severely tachypneic (RR 36/min), cyanotic, with absent left-sided breath sounds and marked tracheal deviation to the right. Blood pressure is 75/40 mmHg and heart rate is 135 bpm. What is the immediate next step in management?',
    options: [
      'Stat portable upright chest X-ray',
      'Immediate needle decompression in 2nd intercostal space mid-clavicular line',
      'Urgent Focused Assessment with Sonography for Trauma (FAST) scan',
      'Endotracheal intubation with rapid sequence induction'
    ],
    correctAnswer: 1,
    explanation: 'Tension pneumothorax is a clinical diagnosis characterized by hemodynamic collapse, ipsilateral absent breath sounds, hyperresonance, and contralateral tracheal shift. Immediate needle decompression (or finger thoracostomy) must be performed without awaiting radiologic confirmation.',
    clinicalPearl: 'ATLS 10th edition recommends needle thoracostomy using a 5-8 cm 14-gauge catheter at the 2nd ICS midclavicular line or 4th/5th ICS anterior axillary line.',
    isBookmarked: true
  },
  {
    id: 'q-obg-1',
    subject: 'Obstetrics & Gynaecology',
    text: 'A 32-year-old primigravida at 34 weeks gestation presents with persistent severe frontal headache, blurred vision, and right upper quadrant epigastric pain. Blood pressure is 172/112 mmHg on repeated checks. Urinalysis demonstrates 3+ protein. What is the drug of choice for the prevention of maternal seizures?',
    options: [
      'Intravenous Diazepam bolus',
      'Intravenous Magnesium Sulphate',
      'Intravenous Phenytoin loading dose',
      'Oral Labetalol 200 mg'
    ],
    correctAnswer: 1,
    explanation: 'Intravenous Magnesium Sulphate (loading dose 4-6 g over 15-20 min followed by 1-2 g/hr continuous infusion) is the undisputed gold-standard anticonvulsant for seizure prophylaxis in severe pre-eclampsia and eclampsia (Magpie Trial). Antihypertensives control BP but do not prevent seizures.',
    clinicalPearl: 'Monitor patellar reflexes, respiratory rate (>12/min), and urine output (>30 mL/hr) during magnesium sulphate infusion. Calcium gluconate 10% is the immediate antidote for toxicity.',
    isBookmarked: true
  },
  {
    id: 'q-paed-1',
    subject: 'Paediatrics',
    text: 'A 2-year-old toddler is brought to the emergency department at 2:00 AM with sudden onset of a barking seal-like cough, hoarseness, and inspiratory stridor audible at rest with suprasternal retractions. He has a mild coryzal prodrome. What is the most appropriate first-line pharmacotherapy?',
    options: [
      'Oral Amoxicillin-Clavulanic acid for 7 days',
      'Single dose oral Dexamethasone (0.15–0.6 mg/kg) or nebulized Budesonide',
      'Intravenous Ceftriaxone 100 mg/kg',
      'Inhaled Salbutamol nebulization every 20 minutes'
    ],
    correctAnswer: 1,
    explanation: 'Viral croup (laryngotracheobronchitis, most commonly parainfluenza virus) is treated with a single dose of oral dexamethasone (0.15–0.6 mg/kg). For moderate to severe stridor at rest, nebulized epinephrine (adrenaline 1:1000) provides rapid mucosal vasoconstriction and airway relief.',
    clinicalPearl: 'Antibiotics have no role in acute viral croup. The classic AP neck radiograph finding is the "steeple sign" due to subglottic narrowing.',
    isBookmarked: false
  },
  {
    id: 'q-pharm-1',
    subject: 'Pharmacology & Dosing',
    text: 'A 64-year-old male on chronic Warfarin therapy for mechanical mitral valve replacement presents with an international normalized ratio (INR) of 9.2 during routine monitoring. He has no bleeding symptoms, no headache, and normal vitals. Which of the following is the standard evidence-based management according to international guidelines?',
    options: [
      'Administer 4 units of Fresh Frozen Plasma (FFP)',
      'Hold Warfarin and administer oral Vitamin K (1 to 2.5 mg)',
      'Give Intravenous Vitamin K 10 mg as a rapid IV bolus',
      'Continue current dose and re-test INR in 48 hours'
    ],
    correctAnswer: 1,
    explanation: 'For asymptomatic patients on warfarin with an INR between 4.5 and 10.0, guidelines recommend withholding 1-2 doses of warfarin and/or administering low-dose oral vitamin K (1.0 to 2.5 mg). Oral vitamin K produces predictable gradual INR reduction without triggering warfarin resistance.',
    clinicalPearl: 'Intravenous Vitamin K carries a risk of anaphylaxis and should be reserved strictly for major life-threatening bleeding alongside Prothrombin Complex Concentrate (PCC).',
    isBookmarked: true
  },
  {
    id: 'q-eth-1',
    subject: 'Medical Ethics & Law',
    text: 'A competent, alert 68-year-old patient with newly diagnosed operable adenocarcinoma of the stomach refuses recommended gastrectomy despite extensive counselling regarding risks, alternatives, and anticipated mortality. The patient’s adult children strongly insist that the surgeon operate anyway. In accordance with Prometric and Gulf health authority ethical codes, what is the physician required to do?',
    options: [
      'Perform the surgery based on the adult children’s substitute family consent',
      'Respect the competent patient’s autonomous decision to decline surgery',
      'Obtain an emergency court order declaring the patient legally incapacitated',
      'Administer mild sedation and proceed under implied emergency consent'
    ],
    correctAnswer: 1,
    explanation: 'The ethical principle of Respect for Autonomy dictates that a competent adult possessing decision-making capacity has the absolute legal and ethical right to refuse any medical or surgical intervention, even if that refusal results in avoidable death.',
    clinicalPearl: 'Competence is presumed in adults unless evidence demonstrates lack of capacity to understand, retain, weigh information, and communicate a decision.',
    isBookmarked: false
  },
  {
    id: 'q-im-2',
    subject: 'Internal Medicine',
    text: 'A 45-year-old woman presents with persistent fatigue, cold intolerance, weight gain, constipation, and menorrhagia. Examination reveals dry skin, periorbital puffiness, and delayed relaxation phase of deep tendon reflexes. Laboratory investigations show Serum TSH of 28 mIU/L (normal: 0.4–4.0) and Free T4 of 4.2 pmol/L (normal: 9.0–25.0). What is the definitive first-line replacement therapy?',
    options: [
      'Oral Levothyroxine sodium (L-T4) administered fasting in the morning',
      'Oral Liothyronine (T3) monotherapy',
      'Desiccated thyroid extract (porcine)',
      'Propylthiouracil 100 mg three times daily'
    ],
    correctAnswer: 0,
    explanation: 'Primary hypothyroidism is definitively treated with oral Levothyroxine sodium (L-T4) monotherapy, typically initiated at 1.6 mcg/kg/day in young healthy patients (or 25-50 mcg in elderly/cardiac patients), taken with water 30-60 minutes before breakfast.',
    clinicalPearl: 'Recheck serum TSH after 6 to 8 weeks to adjust levothyroxine dosage. Calcium and iron supplements interfere with absorption and should be spaced by at least 4 hours.',
    isBookmarked: true
  },
  {
    id: 'q-surg-2',
    subject: 'General Surgery',
    text: 'A 24-year-old male presents with 14 hours of worsening periumbilical abdominal pain that has migrated to the right lower quadrant, accompanied by anorexia, low-grade fever (38.1°C), and nausea. On examination, there is marked tenderness at McBurney’s point with rebound tenderness and positive Rovsing’s sign. Which diagnostic modality is the gold standard imaging in adult non-pregnant patients when diagnosis is clinically equivocal?',
    options: [
      'Plain abdominal radiography (AXR)',
      'Contrast-enhanced Computed Tomography (CECT) of the abdomen and pelvis',
      'Transabdominal Ultrasound',
      'Diagnostic Laparoscopy'
    ],
    correctAnswer: 1,
    explanation: 'Contrast-enhanced CT of the abdomen and pelvis is the imaging gold standard in adult non-pregnant patients for suspected acute appendicitis, with sensitivity and specificity exceeding 95%. Ultrasound is preferred in children and pregnant women to avoid ionizing radiation.',
    clinicalPearl: 'A normal appendix diameter is <= 6 mm. An enlarged, non-compressible, blind-ended tubular structure > 6 mm with appendicolith or periappendiceal fat stranding confirms acute appendicitis.',
    isBookmarked: false
  }
];

const FALLBACK_SUBJECTS = [
  'Internal Medicine',
  'General Surgery',
  'Obstetrics & Gynaecology',
  'Paediatrics',
  'Pharmacology & Dosing',
  'Medical Ethics & Law'
];

interface QuestionBankSectionProps {
  isStudent?: boolean;
  isAdmin?: boolean;
}

export default function QuestionBankSection({ isStudent = false, isAdmin = false }: QuestionBankSectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeSections: activeQbankSections } = usePortalSections('qbank');
  const availableSubjects = activeQbankSections.length > 0 
    ? activeQbankSections.map(s => s.name) 
    : FALLBACK_SUBJECTS;

  // Navigation tab inside Question Bank: 'all' | 'bookmarked' | 'custom'
  const [activeSection, setActiveSection] = useState<'all' | 'bookmarked' | 'custom'>('all');
  const [bookmarkedSubjectIds, setBookmarkedSubjectIds] = useState<string[]>([]);
  const [firestoreSubjects, setFirestoreSubjects] = useState<any[]>([]);
  const [loadingFirestoreSubjects, setLoadingFirestoreSubjects] = useState<boolean>(true);

  // Student Portal Subject Folders state & real-time synchronization
  const [questionFolders, setQuestionFolders] = useState<QuestionFolder[]>([]);
  const [loadingQuestionFolders, setLoadingQuestionFolders] = useState<boolean>(true);
  const [bookmarkedFolderIds, setBookmarkedFolderIds] = useState<string[]>([]);
  const [folderSearchQuery, setFolderSearchQuery] = useState<string>('');

  useEffect(() => {
    setLoadingQuestionFolders(true);
    const unsub = subscribeToQuestionFolders(
      (folders) => {
        setQuestionFolders(folders);
        setLoadingQuestionFolders(false);
      },
      () => {
        setLoadingQuestionFolders(false);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setBookmarkedFolderIds([]);
      return;
    }
    const unsub = subscribeToUserFolderBookmarks(user.uid, (ids) => {
      setBookmarkedFolderIds(ids);
    });
    return () => unsub();
  }, [user?.uid]);

  const activeQuestionFolders = questionFolders.filter(f => f.isActive !== false);
  const filteredQuestionFolders = activeQuestionFolders.filter(f => {
    if (!folderSearchQuery.trim()) return true;
    const query = folderSearchQuery.toLowerCase();
    const nameMatch = f.name.toLowerCase().includes(query);
    const codeMatch = f.code.toLowerCase().includes(query);
    const descMatch = (f.description || '').toLowerCase().includes(query);
    const subjMatch = (f.subjectNames || []).some(s => s.toLowerCase().includes(query));
    return nameMatch || codeMatch || descMatch || subjMatch;
  });

  const handleOpenFolderPractice = (folder: QuestionFolder) => {
    let questionsToPractice: any[] = [];
    if (folder.selectedQuestions && folder.selectedQuestions.length > 0) {
      questionsToPractice = folder.selectedQuestions.map(q => ({
        id: q.id,
        subjectId: q.subjectId || folder.id,
        text: q.text,
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || '',
        imageUrl: q.imageUrl,
      }));
    } else if (folder.selectedQuestionIds && folder.selectedQuestionIds.length > 0) {
      questionsToPractice = allQuestions
        .filter(q => folder.selectedQuestionIds.includes(q.id))
        .map(q => ({
          id: q.id,
          subjectId: folder.id,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        }));
    }

    if (questionsToPractice.length === 0) {
      questionsToPractice = DEFAULT_QUESTION_POOL.slice(0, 3).map(q => ({
        id: q.id,
        subjectId: folder.id,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));
    }

    navigate(`/practice/${folder.id}`, {
      state: {
        folderId: folder.id,
        folderName: folder.name,
        folderDesc: folder.description,
        folderQuestions: questionsToPractice
      }
    });
  };

  const handleToggleFolderBookmark = async (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    if (!user?.uid) return;
    const isCurrentlyBookmarked = bookmarkedFolderIds.includes(folderId);
    setBookmarkedFolderIds(prev => 
      isCurrentlyBookmarked ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
    try {
      await toggleUserFolderBookmark(user.uid, folderId, isCurrentlyBookmarked);
    } catch {
      setBookmarkedFolderIds(prev => 
        isCurrentlyBookmarked ? [...prev, folderId] : prev.filter(id => id !== folderId)
      );
    }
  };

  useEffect(() => {
    setLoadingFirestoreSubjects(true);
    let unsub: (() => void) | undefined;
    import('../lib/lmsService').then(({ subscribeToSubjects }) => {
      unsub = subscribeToSubjects(
        (list) => {
          setFirestoreSubjects(list);
          setLoadingFirestoreSubjects(false);
        },
        () => {
          setLoadingFirestoreSubjects(false);
        }
      );
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setBookmarkedSubjectIds([]);
      return;
    }
    const unsub = subscribeToUserSubjectBookmarks(user.uid, (ids) => {
      setBookmarkedSubjectIds(ids);
    });
    return () => unsub();
  }, [user?.uid]);

  // Question Pool & Bookmarks
  const [allQuestions, setAllQuestions] = useState<MCQQuestion[]>(() => {
    const saved = localStorage.getItem('prometric_all_mcqs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_QUESTION_POOL;
      }
    }
    return DEFAULT_QUESTION_POOL;
  });

  const [bookmarkedList, setBookmarkedList] = useState<MCQQuestion[]>(() => {
    const saved = localStorage.getItem('prometric_bookmarked_mcqs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_QUESTION_POOL.filter(q => q.isBookmarked);
      }
    }
    return DEFAULT_QUESTION_POOL.filter(q => q.isBookmarked);
  });

  // Filter & Search states for Bookmarked MCQs
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [bookmarkSubjectFilter, setBookmarkSubjectFilter] = useState('All');
  const [expandedBookmarkId, setExpandedBookmarkId] = useState<string | null>(null);

  // Firestore-persisted User Bookmarks
  const [firestoreBookmarkRefs, setFirestoreBookmarkRefs] = useState<QuestionReference[]>([]);
  const [resolvedBookmarks, setResolvedBookmarks] = useState<ResolvedQuestion[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [bookmarksError, setBookmarksError] = useState<string | null>(null);

  // Firestore-persisted User Custom Modules
  const [userCustomModules, setUserCustomModules] = useState<UserCustomModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [modulesError, setModulesError] = useState<string | null>(null);

  // Custom Module Builder & Viewer state
  const [builderSubjects, setBuilderSubjects] = useState<{ id: string; name: string; details?: string }[]>([]);
  const [loadingBuilderSubjects, setLoadingBuilderSubjects] = useState(false);
  const [selectedBuilderSubject, setSelectedBuilderSubject] = useState<{ id: string; name: string } | null>(null);
  const [builderSubjectQuestions, setBuilderSubjectQuestions] = useState<ResolvedQuestion[]>([]);
  const [loadingBuilderQuestions, setLoadingBuilderQuestions] = useState(false);
  const [selectedQuestionRefs, setSelectedQuestionRefs] = useState<QuestionReference[]>([]);
  const [newModuleName, setNewModuleName] = useState('');
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [savingModule, setSavingModule] = useState(false);
  const [moduleActionMessage, setModuleActionMessage] = useState<string | null>(null);
  const [activeViewedModule, setActiveViewedModule] = useState<UserCustomModule | null>(null);
  const [activeViewedModuleQuestions, setActiveViewedModuleQuestions] = useState<ResolvedQuestion[]>([]);
  const [loadingViewedModule, setLoadingViewedModule] = useState(false);

  // Custom Module Config state
  const [customConfig, setCustomConfig] = useState<CustomModuleConfig>({
    title: 'Prometric High-Yield Custom Drill',
    subjects: ['Internal Medicine', 'General Surgery', 'Pharmacology & Dosing'],
    mode: 'tutor',
    questionCount: 5,
    questionPool: 'all',
    timePerQuestionSeconds: 90
  });

  // Custom Module Runner state
  const [isModuleRunning, setIsModuleRunning] = useState(false);
  const [moduleQuestions, setModuleQuestions] = useState<MCQQuestion[]>([]);
  const [moduleCurrentIdx, setModuleCurrentIdx] = useState(0);
  const [moduleUserAnswers, setModuleUserAnswers] = useState<Record<number, number>>({});
  const [moduleRevealed, setModuleRevealed] = useState<Record<number, boolean>>({});
  const [moduleTimeLeft, setModuleTimeLeft] = useState(0);
  const [moduleFinished, setModuleFinished] = useState(false);
  const [moduleScore, setModuleScore] = useState(0);
  const [quitConfirmModal, setQuitConfirmModal] = useState(false);

  // Saved Custom Modules
  const [savedModules, setSavedModules] = useState<SavedModuleRecord[]>(() => {
    const saved = localStorage.getItem('prometric_saved_custom_modules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'module-rec-1',
        title: 'Emergency & Surgery Recall Blitz',
        date: 'Recent Practice',
        score: 80,
        totalQuestions: 5,
        mode: 'tutor',
        subjects: ['General Surgery', 'Internal Medicine']
      }
    ];
  });

  // Persist bookmarks whenever changed
  useEffect(() => {
    localStorage.setItem('prometric_bookmarked_mcqs', JSON.stringify(bookmarkedList));
    localStorage.setItem('prometric_all_mcqs', JSON.stringify(allQuestions));
  }, [bookmarkedList, allQuestions]);

  // Subscribe to Firestore User Bookmarks & Custom Modules
  useEffect(() => {
    if (!user?.uid) {
      setFirestoreBookmarkRefs([]);
      setResolvedBookmarks([]);
      setUserCustomModules([]);
      return;
    }

    setLoadingBookmarks(true);
    setBookmarksError(null);
    const unsubBookmarks = subscribeToUserBookmarks(
      user.uid,
      async (refs) => {
        setFirestoreBookmarkRefs(refs);
        try {
          const resolved = await resolveQuestionReferences(refs);
          // Also check DEFAULT_QUESTION_POOL for any matching IDs
          const resolvedIds = new Set(resolved.map((q) => q.id));
          const fallbackMatches: ResolvedQuestion[] = refs
            .filter((r) => !resolvedIds.has(r.questionId))
            .map((r) => {
              const found = DEFAULT_QUESTION_POOL.find((dq) => dq.id === r.questionId);
              if (!found) return null;
              return {
                id: found.id,
                subjectId: r.subjectId || found.subject.toLowerCase().replace(/\s+/g, '-'),
                subjectName: r.subjectName || found.subject,
                text: found.text,
                options: found.options,
                correctAnswer: found.correctAnswer,
                explanation: found.explanation
              };
            })
            .filter((q): q is ResolvedQuestion => Boolean(q));

          setResolvedBookmarks([...resolved, ...fallbackMatches]);
        } catch (err) {
          setBookmarksError('Failed to load bookmarked question details.');
        } finally {
          setLoadingBookmarks(false);
        }
      },
      () => {
        setBookmarksError('Unable to sync bookmarks from Firestore.');
        setLoadingBookmarks(false);
      }
    );

    setLoadingModules(true);
    setModulesError(null);
    const unsubModules = subscribeToUserCustomModules(
      user.uid,
      (mods) => {
        setUserCustomModules(mods);
        setLoadingModules(false);
      },
      () => {
        setModulesError('Unable to load custom modules from Firestore.');
        setLoadingModules(false);
      }
    );

    return () => {
      unsubBookmarks();
      unsubModules();
    };
  }, [user?.uid]);

  // Sync Custom Module Builder subjects with real-time firestoreSubjects
  useEffect(() => {
    setBuilderSubjects(
      firestoreSubjects.map((s) => ({
        id: s.id,
        name: s.name || s.id,
        details: s.details || s.description || '',
      }))
    );
    setLoadingBuilderSubjects(loadingFirestoreSubjects);
  }, [firestoreSubjects, loadingFirestoreSubjects]);

  // Real-time listener for selected subject's questions in Custom Module Builder
  useEffect(() => {
    if (!selectedBuilderSubject?.id) return;
    setLoadingBuilderQuestions(true);
    let unsub: (() => void) | undefined;
    import('../lib/lmsService').then(({ subscribeToSubjectQuestions }) => {
      unsub = subscribeToSubjectQuestions(
        selectedBuilderSubject.id,
        (list) => {
          setBuilderSubjectQuestions(
            list.map((q: any) => ({
              id: q.id,
              subjectId: selectedBuilderSubject.id,
              subjectName: selectedBuilderSubject.name,
              text: q.text || q.question || '',
              options: Array.isArray(q.options) ? q.options : [],
              correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : (typeof q.correctIndex === 'number' ? q.correctIndex : 0),
              explanation: q.explanation || '',
              imageUrl: q.imageUrl || undefined,
            }))
          );
          setLoadingBuilderQuestions(false);
        },
        () => {
          setLoadingBuilderQuestions(false);
        }
      );
    });
    return () => {
      if (unsub) unsub();
    };
  }, [selectedBuilderSubject?.id, selectedBuilderSubject?.name]);

  // Open a subject in Custom Module Builder to view & select its questions
  const handleSelectBuilderSubject = (subj: { id: string; name: string }) => {
    setSelectedBuilderSubject(subj);
    setLoadingBuilderQuestions(true);
  };

  // Toggle question selection in Custom Module Builder
  const handleToggleQuestionRef = (q: ResolvedQuestion) => {
    setSelectedQuestionRefs((prev) => {
      const exists = prev.some((r) => r.questionId === q.id);
      if (exists) {
        return prev.filter((r) => r.questionId !== q.id);
      }
      return [
        ...prev,
        {
          questionId: q.id,
          subjectId: q.subjectId,
          subjectName: q.subjectName
        }
      ];
    });
  };

  // Create or Update Custom Module in Firestore
  const handleSaveCustomModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      navigate('/login');
      return;
    }
    if (!newModuleName.trim()) {
      setModulesError('Please enter a custom module name.');
      return;
    }
    if (selectedQuestionRefs.length === 0) {
      setModulesError('Please select at least one question.');
      return;
    }

    setSavingModule(true);
    setModulesError(null);
    try {
      if (editingModuleId) {
        await updateUserCustomModule(user.uid, editingModuleId, newModuleName, selectedQuestionRefs);
        setModuleActionMessage(`Module "${newModuleName.trim()}" updated!`);
      } else {
        await createUserCustomModule(user.uid, newModuleName, selectedQuestionRefs);
        setModuleActionMessage(`Module "${newModuleName.trim()}" created with ${selectedQuestionRefs.length} questions!`);
      }
      setNewModuleName('');
      setSelectedQuestionRefs([]);
      setEditingModuleId(null);
      setTimeout(() => setModuleActionMessage(null), 3500);
    } catch (err) {
      setModulesError('Failed to save custom module. Please try again.');
    } finally {
      setSavingModule(false);
    }
  };

  // Open a saved Custom Module to view its questions
  const handleOpenSavedModule = async (mod: UserCustomModule) => {
    setActiveViewedModule(mod);
    setLoadingViewedModule(true);
    try {
      const resolved = await resolveQuestionReferences(mod.questionRefs);
      setActiveViewedModuleQuestions(resolved);
    } catch (_) {
      setActiveViewedModuleQuestions([]);
    } finally {
      setLoadingViewedModule(false);
    }
  };

  // Edit an existing Custom Module
  const handleStartEditModule = (mod: UserCustomModule) => {
    setEditingModuleId(mod.id);
    setNewModuleName(mod.name);
    setSelectedQuestionRefs(mod.questionRefs);
    setActiveViewedModule(null);
  };

  // Delete an existing Custom Module
  const handleDeleteSavedModule = async (mod: UserCustomModule) => {
    if (!user?.uid) return;
    try {
      await deleteUserCustomModule(user.uid, mod.id);
      if (activeViewedModule?.id === mod.id) {
        setActiveViewedModule(null);
      }
      setModuleActionMessage(`Module "${mod.name}" deleted.`);
      setTimeout(() => setModuleActionMessage(null), 3000);
    } catch (_) {
      setModulesError('Failed to delete module.');
    }
  };

  // Toggle bookmark for any question
  const toggleBookmark = async (question: MCQQuestion) => {
    const isCurrentlyBookmarked = user?.uid
      ? firestoreBookmarkRefs.some((b) => b.questionId === question.id)
      : bookmarkedList.some(q => q.id === question.id);

    if (user?.uid) {
      try {
        await toggleUserBookmark(
          user.uid,
          {
            questionId: question.id,
            subjectId: (question as any).subjectId || question.subject.toLowerCase().replace(/\s+/g, '-'),
            subjectName: question.subject
          },
          isCurrentlyBookmarked
        );
      } catch (e) {
        setBookmarksError('Failed to update bookmark.');
      }
      return;
    }

    let updatedList: MCQQuestion[];
    if (isCurrentlyBookmarked) {
      updatedList = bookmarkedList.filter(q => q.id !== question.id);
    } else {
      updatedList = [{ ...question, isBookmarked: true }, ...bookmarkedList];
    }

    setBookmarkedList(updatedList);
    setAllQuestions(prev => prev.map(q => q.id === question.id ? { ...q, isBookmarked: !isCurrentlyBookmarked } : q));
  };

  // Reset or load default bookmarked MCQs
  const handleResetDefaultBookmarks = () => {
    const defaults = DEFAULT_QUESTION_POOL.filter(q => q.isBookmarked);
    setBookmarkedList(defaults);
    setAllQuestions(DEFAULT_QUESTION_POOL);
    localStorage.setItem('prometric_bookmarked_mcqs', JSON.stringify(defaults));
    localStorage.setItem('prometric_all_mcqs', JSON.stringify(DEFAULT_QUESTION_POOL));
  };

  // Custom module subject toggle
  const toggleSubjectSelection = (subject: string) => {
    setCustomConfig(prev => {
      const exists = prev.subjects.includes(subject);
      let updated: string[];
      if (exists) {
        updated = prev.subjects.filter(s => s !== subject);
        if (updated.length === 0) updated = [subject]; // keep at least one
      } else {
        updated = [...prev.subjects, subject];
      }
      return { ...prev, subjects: updated };
    });
  };

  const selectAllSubjects = () => {
    setCustomConfig(prev => ({
      ...prev,
      subjects: [...availableSubjects]
    }));
  };

  // Launch Custom Module
  const handleStartCustomModule = (customPoolQuestions?: MCQQuestion[]) => {
    let pool: MCQQuestion[] = [];

    if (customPoolQuestions && customPoolQuestions.length > 0) {
      pool = customPoolQuestions;
    } else {
      // Filter by chosen pool
      if (customConfig.questionPool === 'bookmarked') {
        pool = bookmarkedList.filter(q => customConfig.subjects.includes(q.subject));
        if (pool.length === 0) pool = bookmarkedList; // fallback
      } else {
        pool = allQuestions.filter(q => customConfig.subjects.includes(q.subject));
        if (pool.length === 0) pool = allQuestions; // fallback
      }
    }

    // Shuffle and pick desired count
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(customConfig.questionCount, shuffled.length));

    if (selected.length === 0) {
      alert("No questions match the selected criteria. Please select different subjects or add questions.");
      return;
    }

    setModuleQuestions(selected);
    setModuleCurrentIdx(0);
    setModuleUserAnswers({});
    setModuleRevealed({});
    setModuleScore(0);
    setModuleFinished(false);
    setModuleTimeLeft(selected.length * customConfig.timePerQuestionSeconds);
    setIsModuleRunning(true);
  };

  // Timer effect during custom module (if in exam mode)
  useEffect(() => {
    if (!isModuleRunning || moduleFinished || customConfig.mode !== 'exam') return;

    const timer = setInterval(() => {
      setModuleTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishCustomModule();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isModuleRunning, moduleFinished, customConfig.mode]);

  // Answer selection in Custom Module
  const handleSelectModuleAnswer = (optionIdx: number) => {
    if (moduleRevealed[moduleCurrentIdx] && customConfig.mode === 'tutor') return;

    setModuleUserAnswers(prev => ({
      ...prev,
      [moduleCurrentIdx]: optionIdx
    }));

    if (customConfig.mode === 'tutor') {
      setModuleRevealed(prev => ({
        ...prev,
        [moduleCurrentIdx]: true
      }));

      const currentQ = moduleQuestions[moduleCurrentIdx];
      if (optionIdx === currentQ.correctAnswer) {
        setModuleScore(prev => prev + 1);
      }
    }
  };

  // Finish Custom Module
  const finishCustomModule = () => {
    let finalScore = 0;
    moduleQuestions.forEach((q, idx) => {
      if (moduleUserAnswers[idx] === q.correctAnswer) {
        finalScore++;
      }
    });

    setModuleScore(finalScore);
    setModuleFinished(true);

    // Save record to local storage
    const newRecord: SavedModuleRecord = {
      id: `mod-${Date.now()}`,
      title: customConfig.title,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      score: Math.round((finalScore / moduleQuestions.length) * 100),
      totalQuestions: moduleQuestions.length,
      mode: customConfig.mode,
      subjects: customConfig.subjects
    };

    const updatedRecords = [newRecord, ...savedModules.slice(0, 9)];
    setSavedModules(updatedRecords);
    localStorage.setItem('prometric_saved_custom_modules', JSON.stringify(updatedRecords));
  };

  // Filtered bookmarks list
  const filteredBookmarks = bookmarkedList.filter(q => {
    const matchesSubject = bookmarkSubjectFilter === 'All' || q.subject === bookmarkSubjectFilter;
    const matchesSearch = bookmarkSearch === '' || 
      q.text.toLowerCase().includes(bookmarkSearch.toLowerCase()) || 
      q.subject.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
      (q.clinicalPearl && q.clinicalPearl.toLowerCase().includes(bookmarkSearch.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Header & Section Selector */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <h2 className="text-2xl font-black font-display text-[#0B1C30]">Question Bank</h2>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
            {isStudent || isAdmin ? 'Full Access' : 'High-Yield Access'}
          </span>
        </div>
        <p className="text-[#45464D] text-xs font-medium">
          Practice Gulf Prometric past recalls, review bookmarked MCQs, and generate custom targeted mock modules.
        </p>
      </div>

      {/* Internal Question Bank 3-Tab Navigation Bar */}
      <div className="bg-[#EFF4FF] p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap items-center gap-1.5 border border-[#E5EEFF]">
        <button
          onClick={() => { setActiveSection('all'); setIsModuleRunning(false); }}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'all'
              ? 'bg-white text-[#0B1C30] shadow-sm'
              : 'text-[#45464D] hover:text-[#0B1C30]'
          }`}
        >
          <FolderPlus size={15} className={activeSection === 'all' ? 'text-[#2563EB]' : 'text-gray-400'} />
          <span>All Folders</span>
          <span className="text-[10px] bg-blue-100 text-[#2563EB] px-1.5 py-0.2 rounded-full font-bold">
            {activeQuestionFolders.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveSection('bookmarked'); setIsModuleRunning(false); }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'bookmarked'
              ? 'bg-white text-[#0B1C30] shadow-sm'
              : 'text-[#45464D] hover:text-[#0B1C30]'
          }`}
        >
          <Star size={15} className={activeSection === 'bookmarked' ? 'text-amber-500 fill-amber-400' : 'text-gray-400'} />
          <span>Bookmarked MCQs</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold">
            {bookmarkedFolderIds.length + bookmarkedList.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveSection('custom'); }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'custom'
              ? 'bg-white text-[#0B1C30] shadow-sm'
              : 'text-[#45464D] hover:text-[#0B1C30]'
          }`}
        >
          <Sliders size={15} className={activeSection === 'custom' ? 'text-indigo-600' : 'text-gray-400'} />
          <span>Custom Modules</span>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full font-bold">
            {userCustomModules.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL SUBJECT FOLDERS VIEW (Student Portal Subject Folders) */}
      {/* ========================================================================= */}
      {activeSection === 'all' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EEFF] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EEFF] pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF4FF] text-[#2563EB] flex items-center justify-center border border-[#D4E2FF] shrink-0">
                <FolderPlus size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-[#0B1C30]">Subject Folders</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#EFF4FF] text-[#2563EB] border border-[#D4E2FF]">
                    {activeQuestionFolders.length} Available Folders
                  </span>
                </div>
                <p className="text-xs text-[#45464D]">
                  Curated question folders created and managed from the Student Portal. Click any folder to drill its MCQs or star it to save to Bookmarked Folders.
                </p>
              </div>
            </div>

            {/* Folder Search */}
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={folderSearchQuery}
                onChange={(e) => setFolderSearchQuery(e.target.value)}
                placeholder="Search folders or subjects..."
                className="w-full pl-8 pr-7 py-2 bg-[#F8FAFF] border border-[#E5EEFF] rounded-xl text-xs font-semibold text-[#0B1C30] outline-none focus:border-[#2563EB] transition-all"
              />
              {folderSearchQuery && (
                <button
                  type="button"
                  onClick={() => setFolderSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {loadingQuestionFolders ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#45464D]">Loading Subject Folders from Student Portal...</p>
            </div>
          ) : filteredQuestionFolders.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-[#F8FAFF] rounded-2xl border border-[#E5EEFF] p-6">
              <FolderPlus size={32} className="text-gray-300 mx-auto" />
              <p className="text-sm font-black text-[#0B1C30]">
                {folderSearchQuery ? `No folders match "${folderSearchQuery}"` : 'No Subject Folders Found'}
              </p>
              <p className="text-xs text-[#45464D] max-w-md mx-auto">
                {folderSearchQuery
                  ? 'Try searching with another keyword or clear the search filter.'
                  : 'Folders created from the Subject-Wise Question Builder in the Student Portal will appear here automatically.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {filteredQuestionFolders.map((folder) => {
                const isStarred = bookmarkedFolderIds.includes(folder.id);
                const qCount = folder.selectedQuestionIds?.length || folder.selectedQuestions?.length || 0;
                return (
                  <div
                    key={folder.id}
                    onClick={() => handleOpenFolderPractice(folder)}
                    className="group bg-[#F8FAFF] hover:bg-white rounded-2xl p-5 border border-[#E5EEFF] hover:border-[#2563EB] shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E5EEFF] text-[#2563EB] flex items-center justify-center shrink-0 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                          <FolderPlus size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-2 py-0.5 bg-slate-100 rounded-md">
                            {folder.code || 'QB-FLD'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleToggleFolderBookmark(e, folder.id)}
                        title={isStarred ? 'Remove folder bookmark' : 'Bookmark this folder'}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          isStarred
                            ? 'bg-amber-50 border-amber-200 text-amber-500'
                            : 'bg-white border-[#E5EEFF] text-gray-400 hover:text-amber-500 hover:border-amber-200'
                        }`}
                      >
                        <Star size={16} className={isStarred ? 'fill-amber-400 text-amber-500' : ''} />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-black text-[#0B1C30] text-base group-hover:text-[#2563EB] transition-colors line-clamp-1">
                        {folder.name}
                      </h4>
                      {folder.description && (
                        <p className="text-xs text-[#45464D] line-clamp-2 leading-relaxed">
                          {folder.description}
                        </p>
                      )}

                      {/* Subjects represented badges */}
                      {folder.subjectNames && folder.subjectNames.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {folder.subjectNames.slice(0, 3).map((s) => (
                            <span key={s} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-100 truncate max-w-[120px]">
                              {s}
                            </span>
                          ))}
                          {folder.subjectNames.length > 3 && (
                            <span className="text-[9px] font-bold text-gray-400">
                              +{folder.subjectNames.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#E5EEFF] flex items-center justify-between text-xs text-[#45464D] font-semibold">
                      <span className="text-[11px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full">
                        {qCount} {qCount === 1 ? 'Question' : 'Questions'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#2563EB] font-extrabold group-hover:translate-x-0.5 transition-transform">
                        Practice Folder <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BOOKMARKED MCQs VIEW (Bookmarked Subject Folders + Bookmarked Questions) */}
      {/* ========================================================================= */}
      {activeSection === 'bookmarked' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EEFF] shadow-xs space-y-8">
          {/* Sub-section A: Bookmarked Subject Folders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5EEFF] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                  <Star size={20} className="fill-amber-400 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#0B1C30]">Bookmarked Subject Folders</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                      {bookmarkedFolderIds.length} Saved
                    </span>
                  </div>
                  <p className="text-xs text-[#45464D]">Click any starred folder to open its complete question drill.</p>
                </div>
              </div>
            </div>

            {bookmarkedFolderIds.length === 0 ? (
              <div className="py-6 px-4 text-center bg-[#F8FAFF] rounded-2xl border border-[#E5EEFF]">
                <p className="text-xs font-bold text-[#45464D]">
                  No bookmarked subject folders yet. Click the star icon on any folder in the <button type="button" onClick={() => setActiveSection('all')} className="text-[#2563EB] underline font-black cursor-pointer">All</button> tab to save it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {questionFolders
                  .filter((folder) => bookmarkedFolderIds.includes(folder.id))
                  .map((folder) => {
                    const qCount = folder.selectedQuestionIds?.length || folder.selectedQuestions?.length || 0;
                    return (
                      <div
                        key={folder.id}
                        onClick={() => handleOpenFolderPractice(folder)}
                        className="group bg-[#F8FAFF] hover:bg-white rounded-2xl p-4 border border-amber-200/80 hover:border-[#2563EB] shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase px-1.5 py-0.2 bg-slate-100 rounded">
                              {folder.code || 'QB-FLD'}
                            </span>
                          </div>
                          <h4 className="font-black text-[#0B1C30] text-sm group-hover:text-[#2563EB] transition-colors truncate">
                            {folder.name}
                          </h4>
                          <p className="text-xs text-[#45464D] font-semibold mt-0.5">
                            {qCount} {qCount === 1 ? 'Question' : 'Questions'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleToggleFolderBookmark(e, folder.id)}
                          title="Remove folder bookmark"
                          className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-500 hover:bg-amber-100 transition-colors shrink-0 cursor-pointer"
                        >
                          <Star size={15} className="fill-amber-400 text-amber-500" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Sub-section B: Bookmarked Questions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EEFF] pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                <Bookmark size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-[#0B1C30]">Bookmarked MCQs</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    {bookmarkedList.length} Saved
                  </span>
                </div>
                <p className="text-xs text-[#45464D]">Review and drill your flagged high-yield Prometric questions.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {bookmarkedList.length > 0 && (
                <button
                  onClick={() => {
                    handleStartCustomModule(bookmarkedList);
                    setActiveSection('custom');
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <PlayCircle size={15} />
                  <span>Practice All Bookmarks ({bookmarkedList.length})</span>
                </button>
              )}

              <button
                onClick={handleResetDefaultBookmarks}
                title="Restore default curated high-yield bookmarks"
                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl border border-gray-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Search & Subject Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={bookmarkSearch}
                onChange={(e) => setBookmarkSearch(e.target.value)}
                placeholder="Search bookmarked clinical questions, topics, or keywords..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5EEFF] bg-[#F8FAFF] text-xs font-medium focus:outline-none focus:border-[#3853A4] transition-all"
              />
              {bookmarkSearch && (
                <button 
                  onClick={() => setBookmarkSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
              {['All', ...availableSubjects].map(subj => (
                <button
                  key={subj}
                  onClick={() => setBookmarkSubjectFilter(subj)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                    bookmarkSubjectFilter === subj
                      ? 'bg-[#3853A4] text-white shadow-xs'
                      : 'bg-[#EFF4FF] text-[#45464D] hover:bg-[#E5EEFF]'
                  }`}
                >
                  {subj === 'All' ? 'All Subjects' : subj.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Bookmarks List */}
          {loadingBookmarks ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-4 border-[#3853A4] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-gray-500">Loading your bookmarked questions...</p>
            </div>
          ) : bookmarksError ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{bookmarksError}</span>
            </div>
          ) : user?.uid ? (
            (() => {
              const filteredFirestoreBookmarks = resolvedBookmarks.filter((q) => {
                const matchesSubj = bookmarkSubjectFilter === 'All' || q.subjectName === bookmarkSubjectFilter;
                const matchesSearch =
                  bookmarkSearch === '' ||
                  q.text.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
                  q.subjectName.toLowerCase().includes(bookmarkSearch.toLowerCase());
                return matchesSubj && matchesSearch;
              });

              if (filteredFirestoreBookmarks.length === 0) {
                return (
                  <div className="bg-[#F8FAFF] border border-dashed border-[#E5EEFF] rounded-2xl p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
                      <Bookmark size={20} />
                    </div>
                    <h4 className="font-extrabold text-[#0B1C30] text-sm">No bookmarked questions yet</h4>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Click the bookmark icon on any question in the Question Bank to save it here for quick review.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filteredFirestoreBookmarks.map((q) => (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl border border-[#E5EEFF] bg-[#F8FAFF]/60 hover:bg-white transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-50 text-[#3853A4] border border-blue-200">
                          {q.subjectName}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeUserBookmark(user.uid, q.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-all cursor-pointer"
                          title="Remove bookmark"
                        >
                          <BookmarkCheck size={13} />
                          <span>Bookmarked</span>
                        </button>
                      </div>

                      <p className="text-sm font-bold text-[#0B1C30] leading-relaxed">{q.text}</p>

                      {q.imageUrl && (
                        <img
                          src={q.imageUrl}
                          alt="Question reference"
                          className="max-h-56 rounded-xl object-contain border border-gray-200 bg-white p-1"
                        />
                      )}

                      <div className="grid sm:grid-cols-2 gap-2">
                        {q.options.map((opt, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl text-xs font-semibold border ${
                              idx === q.correctAnswer
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                : 'bg-white text-gray-700 border-gray-200'
                            }`}
                          >
                            <span className="font-mono mr-1.5">{['A', 'B', 'C', 'D'][idx]}.</span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-[#0B1C30] leading-relaxed">
                          <span className="font-extrabold text-[#3853A4]">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()
          ) : filteredBookmarks.length === 0 ? (
            <div className="bg-[#F8FAFF] border border-dashed border-[#E5EEFF] rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
                <Bookmark size={20} />
              </div>
              <h4 className="font-extrabold text-[#0B1C30] text-sm">No bookmarked questions match your filter</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Bookmark questions during your custom modules or click reset below to load curated high-yield clinical recalls.
              </p>
              <button
                onClick={handleResetDefaultBookmarks}
                className="px-4 py-2 bg-[#3853A4] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Load High-Yield Recalls</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookmarks.map((q, idx) => {
                const isExpanded = expandedBookmarkId === q.id;
                return (
                  <div
                    key={q.id}
                    className="border border-[#E5EEFF] rounded-2xl p-5 hover:border-[#3853A4]/40 transition-all bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#EFF4FF] text-[#3853A4] border border-[#3853A4]/20">
                          {q.subject}
                        </span>
                        <span className="text-[11px] font-bold text-gray-400">
                          Question #{idx + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleBookmark(q)}
                          title="Remove from bookmarks"
                          className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-all cursor-pointer"
                        >
                          <BookmarkCheck size={18} className="fill-amber-400 text-amber-500" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-[#0B1C30] leading-relaxed">
                      {q.text}
                    </p>

                    {/* Question Options & Explanation Accordion */}
                    <div>
                      <button
                        onClick={() => setExpandedBookmarkId(isExpanded ? null : q.id)}
                        className="text-xs font-bold text-[#3853A4] hover:underline flex items-center gap-1 cursor-pointer py-1"
                      >
                        <span>{isExpanded ? 'Hide Options & Explanation' : 'View Correct Answer & Rationale'}</span>
                        <ChevronRight size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-3 space-y-3 overflow-hidden"
                          >
                            <div className="grid gap-2">
                              {q.options.map((opt, optIdx) => {
                                const isCorrect = optIdx === q.correctAnswer;
                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2.5 border ${
                                      isCorrect
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                        : 'bg-gray-50 border-gray-200 text-gray-700'
                                    }`}
                                  >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                      isCorrect ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>{opt}</span>
                                    {isCorrect && (
                                      <CheckCircle2 size={16} className="text-emerald-600 ml-auto shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Clinical Pearl & Explanation Card */}
                            <div className="bg-[#EFF4FF] p-4 rounded-xl border border-[#E5EEFF] space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#3853A4]">
                                <Sparkles size={14} className="text-amber-500" />
                                <span>Clinical Explanation & Rationale</span>
                              </div>
                              <p className="text-xs text-[#0B1C30] leading-relaxed">
                                {q.explanation}
                              </p>
                              {q.clinicalPearl && (
                                <div className="mt-2 pt-2 border-t border-[#E5EEFF] flex items-start gap-2 text-[11px] font-semibold text-emerald-900 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                                  <span className="font-black text-emerald-700 uppercase tracking-wider shrink-0">Prometric Pearl:</span>
                                  <span>{q.clinicalPearl}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: CUSTOM MODULE GENERATOR & RUNNER VIEW */}
      {/* ========================================================================= */}
      {activeSection === 'custom' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EEFF] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EEFF] pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0">
                <Sliders size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-[#0B1C30]">Custom Practice Module</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Targeted Generator
                  </span>
                </div>
                <p className="text-xs text-[#45464D]">Build personalized drills focusing on your preferred specialties, question pools, and modes.</p>
              </div>
            </div>

            {isModuleRunning && !moduleFinished && (
              <button
                onClick={() => setQuitConfirmModal(true)}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <X size={15} />
                <span>Exit Current Session</span>
              </button>
            )}
          </div>

          {/* IF CUSTOM MODULE IS RUNNING: SHOW THE INTERACTIVE TEST RUNNER */}
          {isModuleRunning ? (
            <div className="space-y-6">
              {!moduleFinished ? (
                /* IN-PROGRESS RUNNER */
                <div className="space-y-6">
                  {/* Runner Top Bar */}
                  <div className="bg-[#EFF4FF] p-4 rounded-2xl border border-[#E5EEFF] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-[#0B1C30]">
                        Question {moduleCurrentIdx + 1} of {moduleQuestions.length}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        customConfig.mode === 'tutor'
                          ? 'bg-blue-100 text-brand-blue border border-blue-200'
                          : 'bg-purple-100 text-purple-700 border border-purple-200'
                      }`}>
                        {customConfig.mode === 'tutor' ? 'Tutor Mode (Instant Rationale)' : 'Timed Exam Mode'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {customConfig.mode === 'exam' && (
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#E5EEFF] text-xs font-black text-[#0B1C30]">
                          <Clock size={14} className="text-[#3853A4]" />
                          <span>
                            {Math.floor(moduleTimeLeft / 60)}:{(moduleTimeLeft % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      )}

                      {/* Bookmark Question in runner */}
                      <button
                        onClick={() => toggleBookmark(moduleQuestions[moduleCurrentIdx])}
                        className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                          bookmarkedList.some(q => q.id === moduleQuestions[moduleCurrentIdx].id)
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-white text-gray-600 border-[#E5EEFF] hover:bg-gray-50'
                        }`}
                      >
                        <Bookmark size={15} className={bookmarkedList.some(q => q.id === moduleQuestions[moduleCurrentIdx].id) ? 'fill-amber-400 text-amber-600' : ''} />
                        <span className="hidden sm:inline">
                          {bookmarkedList.some(q => q.id === moduleQuestions[moduleCurrentIdx].id) ? 'Bookmarked' : 'Bookmark'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3853A4] transition-all duration-300"
                      style={{ width: `${((moduleCurrentIdx + 1) / moduleQuestions.length) * 100}%` }}
                    />
                  </div>

                  {/* Question Card */}
                  <div className="border border-[#E5EEFF] rounded-3xl p-6 sm:p-8 bg-white shadow-xs space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-[#EFF4FF] text-[#3853A4] border border-[#3853A4]/20">
                        {moduleQuestions[moduleCurrentIdx].subject}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">
                        Prometric Single Best Answer
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-[#0B1C30] leading-relaxed">
                      {moduleQuestions[moduleCurrentIdx].text}
                    </h4>

                    {/* Options list */}
                    <div className="space-y-3">
                      {moduleQuestions[moduleCurrentIdx].options.map((opt, optIdx) => {
                        const isSelected = moduleUserAnswers[moduleCurrentIdx] === optIdx;
                        const isRevealed = moduleRevealed[moduleCurrentIdx];
                        const isCorrect = optIdx === moduleQuestions[moduleCurrentIdx].correctAnswer;

                        let styleClasses = 'bg-[#F8FAFF] border-[#E5EEFF] text-[#0B1C30] hover:bg-[#EFF4FF]';

                        if (customConfig.mode === 'tutor' && isRevealed) {
                          if (isCorrect) {
                            styleClasses = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                          } else if (isSelected && !isCorrect) {
                            styleClasses = 'bg-rose-50 border-rose-300 text-rose-950 font-bold';
                          } else {
                            styleClasses = 'bg-gray-50 border-gray-200 text-gray-500 opacity-70';
                          }
                        } else if (isSelected) {
                          styleClasses = 'bg-[#3853A4] text-white border-[#3853A4] shadow-sm font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectModuleAnswer(optIdx)}
                            className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${styleClasses}`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                              isSelected && (!isRevealed || customConfig.mode === 'exam')
                                ? 'bg-white text-[#3853A4]'
                                : isRevealed && isCorrect
                                ? 'bg-emerald-600 text-white'
                                : isRevealed && isSelected && !isCorrect
                                ? 'bg-rose-600 text-white'
                                : 'bg-[#E5EEFF] text-[#3853A4]'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1 pt-0.5">{opt}</span>
                            {isRevealed && isCorrect && (
                              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                            )}
                            {isRevealed && isSelected && !isCorrect && (
                              <XCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Instant Explanation Card (Tutor Mode) */}
                    {customConfig.mode === 'tutor' && moduleRevealed[moduleCurrentIdx] && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#EFF4FF] p-5 rounded-2xl border border-[#D0E0FF] space-y-3"
                      >
                        <div className="flex items-center gap-2 text-xs font-black text-[#3853A4]">
                          <Sparkles size={16} className="text-amber-500" />
                          <span>Detailed Clinical Rationale</span>
                        </div>
                        <p className="text-xs text-[#0B1C30] leading-relaxed">
                          {moduleQuestions[moduleCurrentIdx].explanation}
                        </p>
                        {moduleQuestions[moduleCurrentIdx].clinicalPearl && (
                          <div className="p-3 bg-white rounded-xl border border-[#D0E0FF] text-[11px] font-semibold text-emerald-900">
                            <span className="font-black text-emerald-700 uppercase mr-1">Prometric Exam Tip:</span>
                            {moduleQuestions[moduleCurrentIdx].clinicalPearl}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#E5EEFF]">
                      <button
                        onClick={() => setModuleCurrentIdx(prev => Math.max(0, prev - 1))}
                        disabled={moduleCurrentIdx === 0}
                        className="px-4 py-2.5 rounded-xl border border-[#E5EEFF] text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                        <span>Previous</span>
                      </button>

                      {moduleCurrentIdx < moduleQuestions.length - 1 ? (
                        <button
                          onClick={() => setModuleCurrentIdx(prev => prev + 1)}
                          className="px-6 py-2.5 rounded-xl bg-[#3853A4] hover:bg-[#2F4487] text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                        >
                          <span>Next Question</span>
                          <ChevronRight size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={finishCustomModule}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
                        >
                          <span>Submit & Finish Module</span>
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* MODULE FINISHED SUMMARY CARD */
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  <div className="bg-gradient-to-br from-[#0B1C30] to-[#1E3050] text-white p-8 rounded-3xl text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 mx-auto flex items-center justify-center border border-white/20">
                      <Award size={32} className="text-amber-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                      Module Completed
                    </span>
                    <h3 className="text-3xl font-black">{customConfig.title}</h3>
                    <div className="flex items-center justify-center gap-6 py-2">
                      <div>
                        <div className="text-3xl font-black text-emerald-400">
                          {Math.round((moduleScore / moduleQuestions.length) * 100)}%
                        </div>
                        <div className="text-[11px] text-gray-300 font-medium">Overall Score</div>
                      </div>
                      <div className="h-8 w-px bg-white/20" />
                      <div>
                        <div className="text-3xl font-black text-white">
                          {moduleScore} / {moduleQuestions.length}
                        </div>
                        <div className="text-[11px] text-gray-300 font-medium">Correct Questions</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => handleStartCustomModule()}
                      className="px-5 py-3 rounded-2xl bg-[#3853A4] hover:bg-[#2F4487] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw size={15} />
                      <span>Retake Custom Module</span>
                    </button>
                    <button
                      onClick={() => setIsModuleRunning(false)}
                      className="px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-all cursor-pointer"
                    >
                      <span>Configure New Module</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            /* CUSTOM MODULES & TARGETED GENERATOR */
            <div className="space-y-8">
              {/* ================================================================= */}
              {/* 1. SAVED CUSTOM MODULES (FIRESTORE-PERSISTED)                     */}
              {/* ================================================================= */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-[#0B1C30] uppercase tracking-wider">
                      Your Saved Custom Modules ({userCustomModules.length})
                    </h4>
                    <p className="text-xs text-[#45464D]">
                      Click any module to open its saved questions, or edit/delete your modules.
                    </p>
                  </div>
                </div>

                {moduleActionMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>{moduleActionMessage}</span>
                  </div>
                )}

                {modulesError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{modulesError}</span>
                  </div>
                )}

                {loadingModules ? (
                  <div className="py-8 text-center">
                    <div className="w-7 h-7 border-4 border-[#3853A4] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-500">Loading your custom modules...</p>
                  </div>
                ) : userCustomModules.length === 0 ? (
                  <div className="bg-[#F8FAFF] border border-dashed border-[#E5EEFF] rounded-2xl p-6 text-center space-y-2">
                    <Layers size={22} className="text-indigo-500 mx-auto" />
                    <p className="text-xs font-extrabold text-[#0B1C30]">No custom modules created yet</p>
                    <p className="text-[11px] text-[#45464D] max-w-md mx-auto">
                      Select a subject below, check the questions you want to include, enter a module name, and click Create Module.
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3.5">
                    {userCustomModules.map((mod) => (
                      <div
                        key={mod.id}
                        className="p-4 rounded-2xl border border-[#E5EEFF] bg-[#F8FAFF]/70 hover:bg-white hover:border-indigo-300 transition-all flex flex-col justify-between gap-3"
                      >
                        <div
                          onClick={() => handleOpenSavedModule(mod)}
                          className="cursor-pointer space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase">
                              {mod.questionRefs.length} Questions
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {new Date(mod.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h5 className="text-sm font-extrabold text-[#0B1C30] hover:text-[#3853A4] transition-colors">
                            {mod.name}
                          </h5>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5EEFF]">
                          <button
                            type="button"
                            onClick={() => handleOpenSavedModule(mod)}
                            className="px-3 py-1.5 bg-[#3853A4] hover:bg-[#2E4387] text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            <BookOpen size={12} />
                            <span>Open Questions</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditModule(mod)}
                              className="p-1.5 text-gray-500 hover:text-[#3853A4] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Module"
                            >
                              <FileText size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSavedModule(mod)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Module"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* VIEWING A SAVED MODULE'S QUESTIONS */}
                {activeViewedModule && (
                  <div className="p-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/20 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                          Saved Module Questions
                        </span>
                        <h5 className="text-base font-black text-[#0B1C30]">{activeViewedModule.name}</h5>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeViewedModuleQuestions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const mapped: MCQQuestion[] = activeViewedModuleQuestions.map((q) => ({
                                id: q.id,
                                subject: q.subjectName,
                                text: q.text,
                                options: q.options,
                                correctAnswer: q.correctAnswer,
                                explanation: q.explanation
                              }));
                              setCustomConfig((prev) => ({
                                ...prev,
                                title: activeViewedModule.name,
                                questionCount: mapped.length
                              }));
                              handleStartCustomModule(mapped);
                            }}
                            className="px-3.5 py-2 bg-[#3853A4] hover:bg-[#2E4387] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <PlayCircle size={14} />
                            <span>Practice Module ({activeViewedModuleQuestions.length})</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveViewedModule(null)}
                          className="p-2 text-gray-500 hover:text-gray-800 bg-white rounded-xl border border-gray-200 cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>

                    {loadingViewedModule ? (
                      <div className="py-8 text-center">
                        <div className="w-6 h-6 border-4 border-[#3853A4] border-t-transparent rounded-full animate-spin mx-auto" />
                      </div>
                    ) : activeViewedModuleQuestions.length === 0 ? (
                      <p className="text-xs text-gray-500 py-4 text-center">
                        No questions found for this module.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {activeViewedModuleQuestions.map((q, idx) => (
                          <div key={q.id} className="p-4 rounded-xl bg-white border border-[#E5EEFF] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-[#3853A4] bg-blue-50 px-2 py-0.5 rounded">
                                Q{idx + 1} · {q.subjectName}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-[#0B1C30]">{q.text}</p>
                            <div className="grid sm:grid-cols-2 gap-1.5">
                              {q.options.map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border ${
                                    oIdx === q.correctAnswer
                                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                      : 'bg-gray-50 text-gray-700 border-gray-200'
                                  }`}
                                >
                                  {String.fromCharCode(65 + oIdx)}. {opt}
                                </div>
                              ))}
                            </div>
                            {q.explanation && (
                              <p className="text-[11px] text-[#45464D] bg-blue-50/50 p-2 rounded-lg">
                                <strong className="text-[#3853A4]">Explanation:</strong> {q.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ================================================================= */}
              {/* 2. SUBJECT SELECTION & QUESTION CHECKBOX BUILDER                  */}
              {/* ================================================================= */}
              <div className="p-5 rounded-2xl border border-[#E5EEFF] bg-[#F8FAFF]/60 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-[#0B1C30] uppercase tracking-wider">
                      {editingModuleId ? 'Edit Custom Module' : 'Create New Custom Module'}
                    </h4>
                    <p className="text-xs text-[#45464D]">
                      1. Click a subject card below to view its questions. 2. Select questions using checkboxes. 3. Name &amp; save your module.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black self-start sm:self-auto">
                    {selectedQuestionRefs.length} Questions Selected
                  </span>
                </div>

                {/* Subject Cards Grid */}
                {loadingBuilderSubjects ? (
                  <div className="py-6 text-center text-xs font-bold text-gray-500">Loading subjects...</div>
                ) : builderSubjects.length === 0 ? (
                  <div className="p-4 bg-white rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-500">
                    No subjects available in the Question Bank yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {builderSubjects.map((subj) => {
                      const isSelectedSubj = selectedBuilderSubject?.id === subj.id;
                      const selectedInSubj = selectedQuestionRefs.filter((r) => r.subjectId === subj.id).length;
                      return (
                        <button
                          key={subj.id}
                          type="button"
                          onClick={() => handleSelectBuilderSubject(subj)}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                            isSelectedSubj
                              ? 'bg-[#3853A4] text-white border-[#3853A4] shadow-sm'
                              : 'bg-white text-[#0B1C30] border-[#E5EEFF] hover:border-[#3853A4]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <BookOpen size={16} className={isSelectedSubj ? 'text-white' : 'text-[#3853A4]'} />
                            {selectedInSubj > 0 && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  isSelectedSubj ? 'bg-white text-[#3853A4]' : 'bg-indigo-100 text-indigo-700'
                                }`}
                              >
                                {selectedInSubj}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-extrabold line-clamp-2">{subj.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Selected Subject's Question List with Checkboxes */}
                {selectedBuilderSubject && (
                  <div className="bg-white rounded-2xl p-4 border border-[#E5EEFF] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E5EEFF] pb-2.5">
                      <h5 className="text-xs font-black text-[#0B1C30] uppercase tracking-wider">
                        {selectedBuilderSubject.name} — Select Questions ({builderSubjectQuestions.length})
                      </h5>
                      {builderSubjectQuestions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const allSelected = builderSubjectQuestions.every((q) =>
                              selectedQuestionRefs.some((r) => r.questionId === q.id)
                            );
                            if (allSelected) {
                              const ids = new Set(builderSubjectQuestions.map((q) => q.id));
                              setSelectedQuestionRefs((prev) => prev.filter((r) => !ids.has(r.questionId)));
                            } else {
                              setSelectedQuestionRefs((prev) => {
                                const existing = new Set(prev.map((r) => r.questionId));
                                const additions = builderSubjectQuestions
                                  .filter((q) => !existing.has(q.id))
                                  .map((q) => ({
                                    questionId: q.id,
                                    subjectId: q.subjectId,
                                    subjectName: q.subjectName
                                  }));
                                return [...prev, ...additions];
                              });
                            }
                          }}
                          className="text-[11px] font-bold text-[#3853A4] hover:underline cursor-pointer"
                        >
                          {builderSubjectQuestions.every((q) =>
                            selectedQuestionRefs.some((r) => r.questionId === q.id)
                          )
                            ? 'Deselect All'
                            : 'Select All'}
                        </button>
                      )}
                    </div>

                    {loadingBuilderQuestions ? (
                      <div className="py-6 text-center text-xs font-bold text-gray-500">Loading questions...</div>
                    ) : builderSubjectQuestions.length === 0 ? (
                      <p className="text-xs text-gray-500 py-4 text-center">
                        No questions in this subject yet.
                      </p>
                    ) : (
                      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                        {builderSubjectQuestions.map((q) => {
                          const checked = selectedQuestionRefs.some((r) => r.questionId === q.id);
                          return (
                            <label
                              key={q.id}
                              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                checked
                                  ? 'bg-blue-50/70 border-[#3853A4]'
                                  : 'bg-[#F8FAFF] border-[#E5EEFF] hover:bg-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleQuestionRef(q)}
                                className="mt-1 w-4 h-4 accent-[#3853A4] rounded cursor-pointer shrink-0"
                              />
                              <span className="text-xs font-semibold text-[#0B1C30] leading-relaxed">
                                {q.text}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Create / Save Module Form */}
                <form onSubmit={handleSaveCustomModule} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <input
                    type="text"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    placeholder="Enter custom module name (e.g. Cardiology & Surgery High-Yield)..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5EEFF] bg-white text-xs font-bold text-[#0B1C30] focus:outline-none focus:border-[#3853A4]"
                  />
                  <div className="flex items-center gap-2">
                    {editingModuleId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingModuleId(null);
                          setNewModuleName('');
                          setSelectedQuestionRefs([]);
                        }}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={savingModule}
                      className="px-5 py-2.5 bg-[#3853A4] hover:bg-[#2E4387] disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus size={15} />
                      <span>
                        {savingModule
                          ? 'Saving...'
                          : editingModuleId
                            ? `Save Module (${selectedQuestionRefs.length})`
                            : `Create Module (${selectedQuestionRefs.length})`}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* ================================================================= */}
              {/* 3. QUICK RANDOMIZED DRILL GENERATOR (EXISTING FEATURE PRESERVED)  */}
              {/* ================================================================= */}
              <div className="space-y-6 pt-4 border-t border-[#E5EEFF]">
                <div>
                  <h4 className="text-sm font-black text-[#0B1C30] uppercase tracking-wider">
                    Quick Randomized Drill Generator
                  </h4>
                  <p className="text-xs text-[#45464D]">
                    Or launch an instant randomized tutor/timed session.
                  </p>
                </div>
                {/* Module Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[#0B1C30] uppercase tracking-wider">Module Title</label>
                  <input
                    type="text"
                    value={customConfig.title}
                    onChange={(e) => setCustomConfig({ ...customConfig, title: e.target.value })}
                    placeholder="e.g. My Weekend Prometric Recall Drill"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5EEFF] bg-[#F8FAFF] text-xs font-bold text-[#0B1C30] focus:outline-none focus:border-[#3853A4]"
                  />
                </div>

              {/* Subject Selection Multi-Select */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#0B1C30] uppercase tracking-wider">
                    Select Specialties & Subjects ({customConfig.subjects.length} selected)
                  </label>
                  <button
                    onClick={selectAllSubjects}
                    className="text-xs text-[#3853A4] font-bold hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {availableSubjects.map((subj) => {
                    const isSelected = customConfig.subjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        onClick={() => toggleSubjectSelection(subj)}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#EFF4FF] border-[#3853A4] text-[#3853A4] shadow-2xs font-extrabold'
                            : 'bg-white border-[#E5EEFF] text-[#45464D] hover:bg-gray-50'
                        }`}
                      >
                        <span className="line-clamp-1">{subj}</span>
                        {isSelected ? (
                          <Check size={14} className="text-[#3853A4] shrink-0" />
                        ) : (
                          <Plus size={14} className="text-gray-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode & Question Pool Controls */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Practice Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#0B1C30] uppercase tracking-wider">Delivery Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCustomConfig({ ...customConfig, mode: 'tutor' })}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        customConfig.mode === 'tutor'
                          ? 'bg-[#3853A4] text-white border-[#3853A4] shadow-xs'
                          : 'bg-white border-[#E5EEFF] text-[#45464D] hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-extrabold">Tutor Mode</div>
                      <div className="text-[10px] opacity-80 mt-0.5">Instant rationales</div>
                    </button>

                    <button
                      onClick={() => setCustomConfig({ ...customConfig, mode: 'exam' })}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        customConfig.mode === 'exam'
                          ? 'bg-[#3853A4] text-white border-[#3853A4] shadow-xs'
                          : 'bg-white border-[#E5EEFF] text-[#45464D] hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-extrabold">Timed Exam</div>
                      <div className="text-[10px] opacity-80 mt-0.5">Exam simulation</div>
                    </button>
                  </div>
                </div>

                {/* Question Pool */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#0B1C30] uppercase tracking-wider">Question Pool Source</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCustomConfig({ ...customConfig, questionPool: 'all' })}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        customConfig.questionPool === 'all'
                          ? 'bg-[#3853A4] text-white border-[#3853A4] shadow-xs'
                          : 'bg-white border-[#E5EEFF] text-[#45464D] hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-extrabold">All High-Yield</div>
                      <div className="text-[10px] opacity-80 mt-0.5">Complete question repository</div>
                    </button>

                    <button
                      onClick={() => setCustomConfig({ ...customConfig, questionPool: 'bookmarked' })}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        customConfig.questionPool === 'bookmarked'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-white border-[#E5EEFF] text-[#45464D] hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-extrabold">Bookmarked Only</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{bookmarkedList.length} saved MCQs</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Number of MCQs Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#0B1C30] uppercase tracking-wider">Number of MCQs</label>
                <div className="flex items-center gap-2">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      onClick={() => setCustomConfig({ ...customConfig, questionCount: num })}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                        customConfig.questionCount === num
                          ? 'bg-[#0B1C30] text-white border-[#0B1C30] shadow-xs'
                          : 'bg-[#F8FAFF] border-[#E5EEFF] text-[#45464D] hover:bg-gray-100'
                      }`}
                    >
                      {num} MCQs
                    </button>
                  ))}
                </div>
              </div>

              {/* Launch Custom Module CTA */}
              <div className="pt-2">
                <button
                  onClick={() => handleStartCustomModule()}
                  className="w-full py-4 rounded-2xl bg-[#3853A4] hover:bg-[#2F4487] text-white font-black text-sm shadow-md shadow-[#3853A4]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlayCircle size={18} />
                  <span>Generate & Launch Custom Module ({customConfig.questionCount} Questions)</span>
                </button>
              </div>

              {/* Recent Custom Modules List */}
              {savedModules.length > 0 && (
                <div className="pt-4 border-t border-[#E5EEFF] space-y-3">
                  <h4 className="text-xs font-black text-[#0B1C30] uppercase tracking-wider">Recent Custom Modules</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {savedModules.slice(0, 4).map((mod) => (
                      <div
                        key={mod.id}
                        className="p-3.5 rounded-2xl border border-[#E5EEFF] bg-[#F8FAFF] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-extrabold text-[#0B1C30] line-clamp-1">{mod.title}</div>
                          <div className="text-[10px] text-gray-400 font-medium">{mod.date} • {mod.totalQuestions} Questions</div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            mod.score >= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {mod.score}% Score
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for quitting session */}
      {quitConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1C30]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-[#E5EEFF]">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <h4 className="text-lg font-black text-[#0B1C30]">Quit Custom Practice?</h4>
            <p className="text-xs text-[#45464D]">Your current module progress will be closed and you can configure a new session anytime.</p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setQuitConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E5EEFF] text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Continue Drill
              </button>
              <button
                onClick={() => {
                  setQuitConfirmModal(false);
                  setIsModuleRunning(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer"
              >
                Quit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
