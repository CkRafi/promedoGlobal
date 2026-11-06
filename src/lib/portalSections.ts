import { useState, useEffect } from 'react';

export type PortalCategory = 'qbank' | 'imagebank' | 'mocktests';

export interface PortalSection {
  id: string;
  category: PortalCategory;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  itemCount: number;
  badgeText?: string;
  order: number;
  metadata?: {
    timeLimit?: number;      // for mock tests (in minutes)
    passingScore?: number;   // for mock tests (e.g. 60)
    difficulty?: string;     // e.g. "Exam Grade", "High Yield", "Standard"
    authority?: string;      // e.g. "DHA Dubai", "HAAD / DOH", "SMLE Saudi"
    examSlug?: string;       // router link e.g. "dha-gp-mock-1"
    modality?: string;       // for image bank e.g. "X-Ray", "CT Scan", "Clinical Photo"
    practiceMode?: string;   // for qbank e.g. "Tutor Mode & Timed"
    subType?: 'subject' | 'bookmarked' | 'custom'; // Question Bank sub-type
  };
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'promedo_portal_sections_v2';
const EVENT_NAME = 'promedo:portal_sections_updated';

export const DEFAULT_PORTAL_SECTIONS: PortalSection[] = [
  // -------------------------------------------------------------
  // QUESTION BANK SECTIONS (Folders created dynamically from Subject Builder)
  // -------------------------------------------------------------
  {
    id: 'qb-sec-bookmarked',
    category: 'qbank',
    name: 'Bookmarked MCQs',
    code: 'QB-BKM-01',
    description: 'Candidate personal repository of flagged and saved high-yield questions for targeted review and spaced recall.',
    isActive: true,
    itemCount: 0,
    badgeText: 'Candidate Bookmarks',
    order: 1,
    metadata: {
      practiceMode: 'Adaptive Review & Spaced Repetition',
      authority: 'Candidate Saved Library',
      subType: 'bookmarked'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'qb-sec-custom',
    category: 'qbank',
    name: 'Custom Module',
    code: 'QB-CST-01',
    description: 'Dynamic drill & simulator generator allowing candidates to configure custom subjects, question count, difficulty, and timer.',
    isActive: true,
    itemCount: 2500,
    badgeText: 'Custom Builder',
    order: 9,
    metadata: {
      practiceMode: 'Custom Timed / Untimed Drill',
      authority: 'All Prometric Specialties',
      subType: 'custom'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },

  // -------------------------------------------------------------
  // IMAGE BANK SECTIONS / SPOTTERS
  // -------------------------------------------------------------
  {
    id: 'ib-sec-ortho',
    category: 'imagebank',
    name: 'Orthopaedics & Trauma',
    code: 'IB-ORTHO-01',
    description: 'Forearm and long-bone radiographs, dislocation signs, and skeletal dysplasias.',
    isActive: true,
    itemCount: 45,
    badgeText: 'X-Ray Spotters',
    order: 1,
    metadata: {
      modality: 'Plain Radiographs',
      authority: 'DHA / SMLE'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'ib-sec-cardio',
    category: 'imagebank',
    name: 'Internal Medicine & Cardiology',
    code: 'IB-CARD-02',
    description: '12-Lead ECG rhythm interpretation, ischemia patterns, and echo loops.',
    isActive: true,
    itemCount: 52,
    badgeText: 'ECG Traces',
    order: 2,
    metadata: {
      modality: '12-Lead Electrocardiograms',
      authority: 'HAAD / DHA'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'ib-sec-rad',
    category: 'imagebank',
    name: 'Radiology & Imaging',
    code: 'IB-RAD-03',
    description: 'Chest X-rays, abdominal plain films, CT brain, and thoracic trauma series.',
    isActive: true,
    itemCount: 68,
    badgeText: 'Chest / CT',
    order: 3,
    metadata: {
      modality: 'Diagnostic Radiology',
      authority: 'ATLS 10th'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'ib-sec-derm',
    category: 'imagebank',
    name: 'Dermatology & Skin Lesions',
    code: 'IB-DERM-04',
    description: 'Vesicular rashes, Hutchinson sign, malignant melanomas, and infectious eruptions.',
    isActive: true,
    itemCount: 38,
    badgeText: 'Clinical Photos',
    order: 4,
    metadata: {
      modality: 'Dermatology Spotters',
      authority: 'DHA / MOH'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'ib-sec-ophth',
    category: 'imagebank',
    name: 'Ophthalmology',
    code: 'IB-OPHTH-05',
    description: 'Fundoscopy spotters: CRAO cherry-red spots, papilledema, and retinal tears.',
    isActive: true,
    itemCount: 26,
    badgeText: 'Fundoscopy',
    order: 5,
    metadata: {
      modality: 'Retinal Examination',
      authority: 'SMLE / OMSB'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'ib-sec-surg',
    category: 'imagebank',
    name: 'General Surgery & Trauma',
    code: 'IB-SURG-06',
    description: 'Coffee-bean volvulus signs, pneumoperitoneum, and peritonitis imaging.',
    isActive: true,
    itemCount: 40,
    badgeText: 'Abdominal Signs',
    order: 6,
    metadata: {
      modality: 'Abdominal Radiography',
      authority: 'HAAD / DHA'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'ib-sec-paed',
    category: 'imagebank',
    name: 'Paediatrics & Neonatology',
    code: 'IB-PAED-07',
    description: 'Double-bubble duodenal atresia, subglottic steeple signs, and foreign bodies.',
    isActive: true,
    itemCount: 34,
    badgeText: 'Neonatal / Peds',
    order: 7,
    metadata: {
      modality: 'Pediatric Radiographs',
      authority: 'DHA / SMLE'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'ib-sec-obg',
    category: 'imagebank',
    name: 'Obstetrics & Gynaecology',
    code: 'IB-OBG-08',
    description: 'Transvaginal ring-of-fire Doppler, intrapartum CTG decelerations, and sonograms.',
    isActive: true,
    itemCount: 30,
    badgeText: 'Ultrasound / CTG',
    order: 8,
    metadata: {
      modality: 'Obstetric Sonography',
      authority: 'DHA / OMSB'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'ib-sec-path',
    category: 'imagebank',
    name: 'Pathology & Hematology',
    code: 'IB-PATH-09',
    description: 'Peripheral blood smears, drepanocytes, sickle cells, and bone marrow aspirates.',
    isActive: true,
    itemCount: 28,
    badgeText: 'Blood Films',
    order: 9,
    metadata: {
      modality: 'Microscopy Stains',
      authority: 'SMLE / MOH'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'ib-sec-neuro',
    category: 'imagebank',
    name: 'Emergency & Neurosurgery',
    code: 'IB-NEURO-10',
    description: 'Biconvex epidural hematomas, crescent subdural bleeds, and midline shifts.',
    isActive: true,
    itemCount: 32,
    badgeText: 'Brain CT',
    order: 10,
    metadata: {
      modality: 'Neuroimaging CT',
      authority: 'DHA / SMLE'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },

  // -------------------------------------------------------------
  // MOCK TEST SIMULATORS
  // -------------------------------------------------------------
  {
    id: 'mt-sec-dha',
    category: 'mocktests',
    name: 'DHA GP Prometric Full Exam Simulator #1',
    code: 'MT-DHA-01',
    description: 'Authentic 150-question 3-hour Prometric computer-based exam simulator for Dubai Health Authority GP licensing.',
    isActive: true,
    itemCount: 150,
    badgeText: 'Exam Grade',
    order: 1,
    metadata: {
      timeLimit: 180,
      passingScore: 60,
      difficulty: 'Exam Grade',
      authority: 'DHA Dubai GP',
      examSlug: 'dha-gp-mock-1'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'mt-sec-haad',
    category: 'mocktests',
    name: 'HAAD / DOH Abu Dhabi Practice Exam #1',
    code: 'MT-HAAD-02',
    description: 'Standard Department of Health Abu Dhabi medical licensure assessment with clinical case drills and rapid rationales.',
    isActive: true,
    itemCount: 150,
    badgeText: 'High Yield',
    order: 2,
    metadata: {
      timeLimit: 180,
      passingScore: 60,
      difficulty: 'High Yield',
      authority: 'HAAD Abu Dhabi',
      examSlug: 'haad-doh-mock-1'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'mt-sec-smle',
    category: 'mocktests',
    name: 'SMLE Saudi Commission High-Yield Mock Test',
    code: 'MT-SMLE-03',
    description: 'Saudi Medical Licensing Exam (SCFHS) blueprint simulation with updated pharmacology and surgical guidelines.',
    isActive: true,
    itemCount: 150,
    badgeText: 'Advanced',
    order: 3,
    metadata: {
      timeLimit: 180,
      passingScore: 60,
      difficulty: 'Advanced',
      authority: 'SMLE Saudi',
      examSlug: 'smle-saudi-mock-1'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'mt-sec-moh',
    category: 'mocktests',
    name: 'MOH UAE Federal Medical Licensing Simulator',
    code: 'MT-MOH-04',
    description: 'Ministry of Health & Prevention UAE federal Prometric exam test covering Northern Emirates licensure standards.',
    isActive: true,
    itemCount: 150,
    badgeText: 'Exam Grade',
    order: 4,
    metadata: {
      timeLimit: 180,
      passingScore: 60,
      difficulty: 'Exam Grade',
      authority: 'MOH UAE',
      examSlug: 'moh-uae-mock-1'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'mt-sec-qchp',
    category: 'mocktests',
    name: 'QCHP Qatar Prometric Practice Assessment',
    code: 'MT-QCHP-05',
    description: 'Qatar Council for Healthcare Practitioners general medicine and surgery computerized assessment.',
    isActive: true,
    itemCount: 150,
    badgeText: 'Standard',
    order: 5,
    metadata: {
      timeLimit: 180,
      passingScore: 60,
      difficulty: 'Standard',
      authority: 'QCHP Qatar',
      examSlug: 'qchp-qatar-mock-1'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'mt-sec-omsb',
    category: 'mocktests',
    name: 'OMSB Oman Medical Specialty Board CBT Simulator',
    code: 'MT-OMSB-06',
    description: 'Sultanate of Oman Medical Specialty Board Prometric simulator with pediatric and adult clinical scenarios.',
    isActive: true,
    itemCount: 150,
    badgeText: 'High Yield',
    order: 6,
    metadata: {
      timeLimit: 180,
      passingScore: 60,
      difficulty: 'High Yield',
      authority: 'OMSB Oman',
      examSlug: 'omsb-oman-mock-1'
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  }
];

export function getPortalSections(category?: PortalCategory): PortalSection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return category ? DEFAULT_PORTAL_SECTIONS.filter(s => s.category === category) : DEFAULT_PORTAL_SECTIONS;
    }
    const parsedRaw: PortalSection[] = JSON.parse(raw);
    if (!Array.isArray(parsedRaw) || parsedRaw.length === 0) {
      return category ? DEFAULT_PORTAL_SECTIONS.filter(s => s.category === category) : DEFAULT_PORTAL_SECTIONS;
    }
    const LEGACY_DUMMY_QB_IDS = new Set([
      'qb-sec-im',
      'qb-sec-surg',
      'qb-sec-obg',
      'qb-sec-paed',
      'qb-sec-pharm',
      'qb-sec-eth',
      'qb-sec-ortho'
    ]);
    const parsed = parsedRaw.filter(s => !LEGACY_DUMMY_QB_IDS.has(s.id));
    if (parsed.length !== parsedRaw.length) {
      savePortalSections(parsed);
    }
    // Auto-migrate essential sections like bookmarked and custom module if absent
    const existingIds = new Set(parsed.map(s => s.id));
    const missingCore = DEFAULT_PORTAL_SECTIONS.filter(d => 
      (d.id === 'qb-sec-bookmarked' || d.id === 'qb-sec-custom') && !existingIds.has(d.id)
    );
    if (missingCore.length > 0) {
      const merged = [...parsed, ...missingCore];
      savePortalSections(merged);
      return category ? merged.filter(s => s.category === category) : merged;
    }
    return category ? parsed.filter(s => s.category === category) : parsed;
  } catch (err) {
    console.warn('Error reading portal sections from localStorage:', err);
    return category ? DEFAULT_PORTAL_SECTIONS.filter(s => s.category === category) : DEFAULT_PORTAL_SECTIONS;
  }
}

export function savePortalSections(sections: PortalSection[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: sections }));
    }
    // Sync to Firestore in background
    import('firebase/firestore').then(({ collection, doc, setDoc }) => {
      import('./firebase').then(({ db }) => {
        sections.forEach((sec) => {
          setDoc(doc(collection(db, 'portalSections'), sec.id), sec, { merge: true }).catch(() => {});
        });
      });
    });
  } catch (err) {
    console.error('Error saving portal sections:', err);
  }
}

export function subscribeToPortalSections(
  category: PortalCategory | undefined,
  onData: (sections: PortalSection[]) => void
): () => void {
  let unsub: (() => void) | undefined;
  import('firebase/firestore').then(({ collection, onSnapshot }) => {
    import('./firebase').then(({ db }) => {
      unsub = onSnapshot(
        collection(db, 'portalSections'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<PortalSection, 'id'>),
            }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            onData(category ? list.filter((s) => s.category === category) : list);
          } else {
            onData(getPortalSections(category));
          }
        },
        () => {
          onData(getPortalSections(category));
        }
      );
    });
  });
  return () => {
    if (unsub) unsub();
  };
}

export function toggleSectionActive(id: string): PortalSection[] {
  const current = getPortalSections();
  const updated = current.map(sec => {
    if (sec.id === id) {
      return {
        ...sec,
        isActive: !sec.isActive,
        updatedAt: new Date().toISOString()
      };
    }
    return sec;
  });
  savePortalSections(updated);
  return updated;
}

export function addPortalSection(data: Omit<PortalSection, 'id' | 'createdAt' | 'updatedAt'>): PortalSection {
  const current = getPortalSections();
  const newSection: PortalSection = {
    ...data,
    id: `sec-${data.category}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const updated = [newSection, ...current];
  savePortalSections(updated);
  return newSection;
}

export function updatePortalSection(id: string, patch: Partial<Omit<PortalSection, 'id' | 'category' | 'createdAt'>>): PortalSection[] {
  const current = getPortalSections();
  const updated = current.map(sec => {
    if (sec.id === id) {
      return {
        ...sec,
        ...patch,
        updatedAt: new Date().toISOString()
      };
    }
    return sec;
  });
  savePortalSections(updated);
  return updated;
}

export function deletePortalSection(id: string): PortalSection[] {
  const current = getPortalSections();
  const updated = current.filter(sec => sec.id !== id);
  savePortalSections(updated);
  return updated;
}

export function resetPortalSections(category?: PortalCategory): PortalSection[] {
  let updated: PortalSection[];
  if (!category) {
    updated = DEFAULT_PORTAL_SECTIONS;
  } else {
    const current = getPortalSections();
    const defaultsForCat = DEFAULT_PORTAL_SECTIONS.filter(s => s.category === category);
    const others = current.filter(s => s.category !== category);
    updated = [...others, ...defaultsForCat];
  }
  savePortalSections(updated);
  return updated;
}

export function usePortalSections(category?: PortalCategory) {
  const [sections, setSections] = useState<PortalSection[]>(() => getPortalSections(category));

  useEffect(() => {
    const handleUpdate = () => {
      setSections(getPortalSections(category));
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [category]);

  return {
    sections,
    activeSections: sections.filter(s => s.isActive),
    toggleActive: (id: string) => {
      const updated = toggleSectionActive(id);
      setSections(category ? updated.filter(s => s.category === category) : updated);
    },
    addSection: (data: Omit<PortalSection, 'id' | 'createdAt' | 'updatedAt'>) => {
      addPortalSection(data);
      setSections(getPortalSections(category));
    },
    updateSection: (id: string, patch: Partial<Omit<PortalSection, 'id' | 'category' | 'createdAt'>>) => {
      const updated = updatePortalSection(id, patch);
      setSections(category ? updated.filter(s => s.category === category) : updated);
    },
    deleteSection: (id: string) => {
      const updated = deletePortalSection(id);
      setSections(category ? updated.filter(s => s.category === category) : updated);
    },
    resetToDefaults: () => {
      const updated = resetPortalSections(category);
      setSections(category ? updated.filter(s => s.category === category) : updated);
    }
  };
}
