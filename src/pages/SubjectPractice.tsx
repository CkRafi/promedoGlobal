import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, BookOpen, Brain, ChevronLeft, ChevronRight, Check, X,
  RefreshCw, Award, Play, AlertCircle, Sparkles, Star, Target, CheckCircle2, Loader2,
  LogOut, AlertTriangle, Bookmark, BookmarkCheck
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserBookmarks, toggleUserBookmark } from '../lib/userQuestionService';

interface Subject {
  id: string;
  name: string;
  details: string;
  createdAt: string;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  imageUrl?: string;
}

export default function SubjectPractice() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [emptySubjectError, setEmptySubjectError] = useState<string | null>(null);
  
  // Practice states
  const [isPracticing, setIsPracticing] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userSelectedOpt, setUserSelectedOpt] = useState<number | null>(null); // Index of currently clicked option
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, number>>({}); // Map: question index -> user selected option index
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Prevent back navigation without confirmation during practice
  useEffect(() => {
    if (!isPracticing || completed) return;

    window.history.pushState({ practiceActive: true }, '');

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = () => {
      window.history.pushState({ practiceActive: true }, '');
      setShowQuitConfirm(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isPracticing, completed]);

  // Subscribe to user's Firestore bookmarks
  useEffect(() => {
    if (!user?.uid) {
      setBookmarkedIds(new Set());
      return;
    }
    const unsub = subscribeToUserBookmarks(user.uid, (list) => {
      setBookmarkedIds(new Set(list.map((b) => b.questionId)));
    });
    return () => unsub();
  }, [user?.uid]);

  // If navigated from Question Folder with selected questions, launch practice immediately
  useEffect(() => {
    if (location.state?.folderQuestions && Array.isArray(location.state.folderQuestions) && location.state.folderQuestions.length > 0) {
      const folderSubj: Subject = {
        id: location.state.folderId || 'folder',
        name: location.state.folderName || 'Selected Question Folder',
        details: location.state.folderDesc || 'Practice drill from custom question builder folder',
        createdAt: new Date().toISOString()
      };
      setSelectedSubject(folderSubj);
      setQuestions(location.state.folderQuestions);
      setIsPracticing(true);
      setCurrentIdx(0);
      setUserSelectedOpt(null);
      setRevealedAnswers({});
      setScore(0);
      setCompleted(false);
    }
  }, [location.state]);

  // Real-time subjects listener from Firestore
  useEffect(() => {
    setLoadingSubjects(true);
    let unsub: (() => void) | undefined;
    import('../lib/lmsService').then(({ subscribeToSubjects }) => {
      unsub = subscribeToSubjects(
        (list) => {
          setSubjects(list as Subject[]);
          setLoadingSubjects(false);
        },
        () => {
          setLoadingSubjects(false);
        }
      );
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Real-time questions listener when a subject is selected
  useEffect(() => {
    if (!selectedSubject?.id) return;
    setLoadingQuestions(true);
    let unsub: (() => void) | undefined;
    import('../lib/lmsService').then(({ subscribeToSubjectQuestions }) => {
      unsub = subscribeToSubjectQuestions(
        selectedSubject.id,
        (list) => {
          if (list.length === 0) {
            setEmptySubjectError(`The subject "${selectedSubject.name}" does not have any questions configured yet. Administrators are currently uploading them!`);
            setTimeout(() => setEmptySubjectError(null), 5000);
          } else {
            setEmptySubjectError(null);
          }
          setQuestions(list as unknown as Question[]);
          setLoadingQuestions(false);
        },
        () => {
          setLoadingQuestions(false);
        }
      );
    });
    return () => {
      if (unsub) unsub();
    };
  }, [selectedSubject?.id]);

  // Start practice for a specific subject
  const startPractice = (subject: Subject) => {
    setSelectedSubject(subject);
    setLoadingQuestions(true);
    setIsPracticing(true);
    setCurrentIdx(0);
    setUserSelectedOpt(null);
    setRevealedAnswers({});
    setScore(0);
    setCompleted(false);
    setEmptySubjectError(null);
  };

  // Option select handler
  const selectOption = (optIdx: number) => {
    if (revealedAnswers[currentIdx] !== undefined) return; // Answer already revealed for this page
    
    setUserSelectedOpt(optIdx);
    
    // Save to revealed map
    setRevealedAnswers(prev => ({
      ...prev,
      [currentIdx]: optIdx
    }));

    // Increment score if matches correctAnswer
    const currentQuestion = questions[currentIdx];
    if (optIdx === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  // Skip / Next handler
  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setUserSelectedOpt(null);
    } else {
      // Completed practice deck
      setCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setUserSelectedOpt(null);
    }
  };

  const resetAll = () => {
    setIsPracticing(false);
    setSelectedSubject(null);
    setQuestions([]);
    setCurrentIdx(0);
    setUserSelectedOpt(null);
    setRevealedAnswers({});
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header Back button */}
        {!isPracticing ? (
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-brand-blue font-bold mb-8 hover:underline text-sm shadow-sm bg-white px-4 py-2.5 rounded-xl border border-gray-100">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                <Brain size={14} />
                Subject-Wise Prep Mode
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Focus Mastery</h1>
              <p className="text-gray-500 max-w-2xl mx-auto text-base text-balance">
                Engage with targeted clinical questions grouped by subject category. Learn through immediate feedback and diagnostic citations to maximize your performance.
              </p>
            </div>

            {emptySubjectError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto mb-8 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-5 flex items-start gap-3 shadow-sm text-left"
              >
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Subject Catalog Empty</p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">{emptySubjectError}</p>
                </div>
              </motion.div>
            )}

            {/* Subjects Selection Catalog */}
            {loadingSubjects ? (
              <div className="py-24 text-center">
                <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-bold text-gray-500 text-sm">Organizing subjects...</p>
              </div>
            ) : subjects.length === 0 ? (
              <div className="bg-white rounded-[32px] p-12 text-center border border-dashed border-gray-200">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-bold mb-2">No subjects available yet</h3>
                <p className="text-gray-400 max-w-md mx-auto">Our administrators are preparing high-yield modules. Please check again shortly!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {subjects.map((sub, idx) => (
                  <motion.div 
                    key={sub.id}
                    whileHover={{ y: -6, shadow: '0 12px 30px rgba(0,0,0,0.06)' }}
                    className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between transition-all group pointer-events-auto cursor-pointer"
                    onClick={() => startPractice(sub)}
                  >
                    <div>
                      <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center font-bold mb-6 group-hover:bg-brand-blue group-hover:text-white transition-all">
                        <BookOpen size={22} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-blue transition-colors mb-2">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-3 mb-6 font-medium">
                        {sub.details || "Practice high-yield recall, scenarios, and questions targeted for this topic."}
                      </p>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-2xl">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Exercise Port</span>
                      <span className="text-xs font-extrabold text-brand-blue flex items-center gap-1">
                        <Play size={12} fill="currentColor" /> Let's Practice
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ACTIVE PRACTICE DECK */
          <div className="space-y-6">
            
            {/* Nav Header Row */}
            <div className="flex justify-between items-center bg-white p-4 sm:p-6 rounded-[24px] border border-gray-100 shadow-sm">
              <button 
                onClick={() => setShowQuitConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-extrabold transition-all cursor-pointer shadow-xs"
              >
                <LogOut size={14} />
                Quit Exam
              </button>

              <div className="text-center">
                <span className="text-[10px] text-brand-blue font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                  Practice mode • {selectedSubject?.name}
                </span>
              </div>

              <div className="text-xs font-bold text-brand-dark">
                Score: <span className="text-green-600 font-extrabold">{score}</span> / {questions.length}
              </div>
            </div>

            {loadingQuestions ? (
              <div className="py-24 bg-white rounded-[40px] text-center shadow-sm">
                <Loader2 size={40} className="animate-spin mb-4 text-brand-blue mx-auto" />
                <p className="font-bold text-gray-400">Loading catalog items...</p>
              </div>
            ) : completed ? (
              /* RESULTS DECK */
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-10 sm:p-14 rounded-[40px] border border-gray-100 shadow-xl text-center space-y-8"
              >
                <div className="mx-auto w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500 animate-pulse">
                  <Award size={48} fill="currentColor" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-extrabold text-gray-900">Practice Session Completed!</h2>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    Excellent training! You completed all practice scenarios inside <strong className="text-brand-blue">{selectedSubject?.name}</strong>.
                  </p>
                </div>

                <div className="max-w-xs mx-auto bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Correct Answers</p>
                  <p className="text-4xl font-extrabold text-brand-blue">
                    {score} <span className="text-lg text-gray-500 font-normal">/ {questions.length}</span>
                  </p>
                  <p className="text-xs font-semibold text-gray-500">
                    Accuracy Score: {questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}%
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 max-w-sm mx-auto justify-center pt-4">
                  <button 
                    onClick={() => startPractice(selectedSubject!)}
                    className="flex-1 btn-primary py-4 rounded-2xl justify-center font-bold text-sm shadow-md flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Practice Again
                  </button>
                  <button 
                    onClick={resetAll}
                    style={{ border: '1px solid #1E293B' }}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-sm text-brand-dark hover:bg-gray-50 transition-colors"
                  >
                    Other Subjects
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ACTIVE DECK QUESTION */
              <div className="space-y-6">
                
                {/* Progress bar */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                    <span>Clinical scenario {currentIdx + 1} of {questions.length}</span>
                    <span className="text-brand-blue">{Math.round(((currentIdx + 1) / questions.length) * 100)}% complete</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue transition-all duration-300" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
                  </div>
                </div>

                {/* The Question Card */}
                <div className="bg-white p-8 sm:p-12 rounded-[40px] border border-gray-100 shadow-md space-y-8">
                  
                  {/* question text */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="inline-flex items-center gap-1.5 text-xs text-brand-blue font-bold">
                        <Sparkles size={14} /> Clinical Trial recall case
                      </div>
                      {questions[currentIdx] && (() => {
                        const q = questions[currentIdx];
                        const isBookmarked = bookmarkedIds.has(q.id);
                        return (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!user?.uid) {
                                navigate('/login');
                                return;
                              }
                              const subjectId = (q as any).subjectId || selectedSubject?.id || 'general';
                              const subjectName = (q as any).subjectName || selectedSubject?.name || 'General';
                              // Optimistic update
                              setBookmarkedIds((prev) => {
                                const next = new Set(prev);
                                if (isBookmarked) next.delete(q.id);
                                else next.add(q.id);
                                return next;
                              });
                              try {
                                await toggleUserBookmark(
                                  user.uid,
                                  { questionId: q.id, subjectId, subjectName },
                                  isBookmarked
                                );
                              } catch (err) {
                                // Revert on error
                                setBookmarkedIds((prev) => {
                                  const next = new Set(prev);
                                  if (isBookmarked) next.add(q.id);
                                  else next.delete(q.id);
                                  return next;
                                });
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              isBookmarked
                                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                                : 'bg-gray-50 hover:bg-amber-50/60 text-gray-600 hover:text-amber-800 border-gray-200'
                            }`}
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this question'}
                          >
                            {isBookmarked ? (
                              <Star size={15} className="text-amber-500 fill-amber-400" />
                            ) : (
                              <Star size={15} className="text-gray-400" />
                            )}
                            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                          </button>
                        );
                      })()}
                    </div>
                    <p className="text-lg sm:text-xl font-bold leading-relaxed text-gray-900">
                      {questions[currentIdx]?.text}
                    </p>
                  </div>

                  {/* Optional Question Image */}
                  {questions[currentIdx]?.imageUrl && (
                    <div className="rounded-3xl overflow-hidden bg-gray-900 border border-gray-200 max-h-96 flex items-center justify-center p-2 shadow-sm">
                      <img 
                        src={questions[currentIdx].imageUrl} 
                        alt="Clinical scenario finding" 
                        className="max-h-96 w-auto object-contain rounded-2xl"
                      />
                    </div>
                  )}

                  {/* multiple choices */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {questions[currentIdx]?.options.map((opt, oIdx) => {
                      const letters = ['A', 'B', 'C', 'D'];
                      const isRevealed = revealedAnswers[currentIdx] !== undefined;
                      const isCorrectAnswer = oIdx === questions[currentIdx]?.correctAnswer;
                      const isUserSelected = oIdx === revealedAnswers[currentIdx];

                      // Style logic
                      let cardStyle = "bg-gray-50/50 hover:bg-gray-100/70 border-gray-100 text-gray-700";
                      let letterStyle = "bg-white text-gray-400 border border-gray-100";

                      if (isRevealed) {
                        if (isCorrectAnswer) {
                          cardStyle = "bg-green-50 border-green-300 text-green-900";
                          letterStyle = "bg-green-600 text-white border-green-600";
                        } else if (isUserSelected) {
                          cardStyle = "bg-red-50 border-red-200 text-red-900";
                          letterStyle = "bg-red-500 text-white border-red-500";
                        } else {
                          cardStyle = "bg-gray-50/40 border-gray-100 text-gray-400 opacity-60";
                          letterStyle = "bg-gray-100 text-gray-400 border-gray-100";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isRevealed}
                          onClick={() => selectOption(oIdx)}
                          className={`p-5 rounded-2xl border text-left font-medium transition-all text-sm flex gap-4 items-center outline-none ${cardStyle}`}
                        >
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 ${letterStyle}`}>
                            {letters[oIdx]}
                          </span>
                          <span className="flex-grow">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Detailed explanation area - revealed immediately upon selection */}
                  <AnimatePresence>
                    {revealedAnswers[currentIdx] !== undefined && (
                      <motion.div 
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        className="p-6 bg-brand-gray/50 rounded-3xl border border-gray-100 space-y-4 text-sm"
                      >
                        <div className="flex items-center gap-2 text-brand-dark font-bold">
                          <CheckCircle2 size={16} className="text-green-500" />
                          <span>Diagnostic Explanation & Citation</span>
                        </div>

                        <p className="text-gray-600 leading-relaxed font-medium">
                          {questions[currentIdx]?.explanation || "The correct option is based on current clinical standards and preparation references."}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Deck Footer Buttons */}
                <div className="flex justify-between items-center">
                  <button 
                    disabled={currentIdx === 0}
                    onClick={handlePrev}
                    className="flex items-center gap-1 px-5 py-3 rounded-xl bg-white border border-gray-100 text-xs font-bold text-gray-500 hover:text-brand-blue disabled:opacity-40 select-none shadow-sm transition-all"
                  >
                    <ChevronLeft size={16} />
                    Previous Card
                  </button>

                  <button 
                    disabled={revealedAnswers[currentIdx] === undefined} // Mandate selection before progressive navigation
                    onClick={handleNext}
                    className="flex items-center gap-1 px-6 py-3 rounded-xl bg-brand-dark text-white text-xs font-extrabold hover:bg-brand-blue disabled:opacity-50 select-none shadow-md transition-all active:scale-95"
                  >
                    {currentIdx === questions.length - 1 ? "Finish Session" : "Next Clinical Case"}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quit Confirmation Modal */}
      <AnimatePresence>
        {showQuitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuitConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center border border-gray-100 z-10"
            >
              <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
                <AlertTriangle size={32} />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Quit Practice Exam?
              </h3>

              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Are you sure you want to quit this practice exam? All current progress and answer choices will be cleared.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowQuitConfirm(false)}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all cursor-pointer text-xs"
                >
                  Continue Exam
                </button>
                <button
                  onClick={() => {
                    setShowQuitConfirm(false);
                    resetAll();
                  }}
                  className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all text-center cursor-pointer text-xs flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Yes, Quit Exam
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
