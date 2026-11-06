import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Save, 
  HelpCircle, 
  Settings, 
  Copy, 
  ArrowRight, 
  AlertCircle, 
  Search, 
  FileText,
  Clock,
  Award,
  DollarSign
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const AdminMocktestEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  
  const [testData, setTestData] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 60,
    exam: 'dha',
    isActive: true,
    isPaid: false,
    price: ''
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    }
  ]);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activePane, setActivePane] = useState<'question' | 'settings'>('question');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  const handleBack = () => {
    if (isDirty) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate('/adminlandingpage');
      }
    } else {
      navigate('/adminlandingpage');
    }
  };

  useEffect(() => {
    if (id) {
      const fetchTest = async () => {
        try {
          const docRef = doc(db, 'mocktests', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTestData({
              title: data.title || '',
              description: data.description || '',
              timeLimit: data.timeLimit || 30,
              passingScore: data.passingScore !== undefined ? data.passingScore : (data.passScore !== undefined ? data.passScore : 60),
              exam: data.exam || 'dha',
              isActive: data.isActive !== undefined ? data.isActive : true,
              isPaid: data.isPaid !== undefined ? data.isPaid : false,
              price: data.price || ''
            });
            if (data.questions && data.questions.length > 0) {
              setQuestions(data.questions);
              setSelectedIndex(0);
            }
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `mocktests/${id}`);
        } finally {
          setLoading(false);
        }
      };
      fetchTest();
    }
  }, [id]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <h1 className="text-4xl text-gray-400">Access Denied</h1>
      </div>
    );
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    };
    const updated = [...questions, newQuestion];
    setQuestions(updated);
    setSelectedIndex(updated.length - 1);
    setActivePane('question');
    setIsDirty(true);
    setSidebarOpenMobile(false);
  };

  const duplicateQuestion = (index: number) => {
    const original = questions[index];
    if (!original) return;
    const copy: Question = {
      ...original,
      id: Math.random().toString(36).substr(2, 9),
      text: original.text ? `${original.text} (Copy)` : ''
    };
    const updated = [...questions];
    updated.splice(index + 1, 0, copy);
    setQuestions(updated);
    setSelectedIndex(index + 1);
    setIsDirty(true);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      alert("At least one question is required.");
      return;
    }
    if (!confirm("Are you sure you want to remove this question?")) return;
    
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    setIsDirty(true);
    
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1));
    } else if (selectedIndex === index) {
      setSelectedIndex(Math.max(0, index - 1));
    }
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
    setIsDirty(true);
  };

  const updateOption = (qIndex: number, oIndex: number, val: string) => {
    const updated = [...questions];
    const newOptions = [...updated[qIndex].options];
    newOptions[oIndex] = val;
    updated[qIndex].options = newOptions;
    setQuestions(updated);
    setIsDirty(true);
  };

  const isQuestionIncomplete = (q: Question) => {
    return !q.text.trim() || q.options.some(opt => !opt.trim());
  };

  const handleSave = async () => {
    if (!testData.title.trim()) {
      setActivePane('settings');
      return alert("Please enter a Test Title in Test Settings.");
    }
    
    const incompleteIndex = questions.findIndex(isQuestionIncomplete);
    if (incompleteIndex !== -1) {
      setSelectedIndex(incompleteIndex);
      setActivePane('question');
      return alert(`Question ${incompleteIndex + 1} has empty text or missing options. Please complete all fields before saving.`);
    }

    if (testData.isPaid && !testData.price) {
      setActivePane('settings');
      return alert("Please specify a price for a paid test.");
    }

    setSaving(true);
    try {
      const finalData = {
        ...testData,
        passScore: testData.passingScore,
        questions: questions,
        updatedAt: new Date().toISOString()
      };

      if (id) {
        await setDoc(doc(db, 'mocktests', id), finalData, { merge: true });
      } else {
        await addDoc(collection(db, 'mocktests'), {
          ...finalData,
          createdAt: new Date().toISOString()
        });
      }
      setIsDirty(false);
      navigate('/adminlandingpage');
    } catch (err) {
      handleFirestoreError(err, id ? OperationType.UPDATE : OperationType.CREATE, id ? `mocktests/${id}` : 'mocktests');
    } finally {
      setSaving(false);
    }
  };

  const currentQuestion = questions[selectedIndex] || questions[0];

  const filteredQuestions = questions.map((q, originalIndex) => ({
    q,
    originalIndex
  })).filter(({ q, originalIndex }) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesText = (q.text || '').toLowerCase().includes(query);
    const matchesNumber = (originalIndex + 1).toString().includes(query);
    return matchesText || matchesNumber;
  });

  const incompleteCount = questions.filter(isQuestionIncomplete).length;

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center text-brand-blue font-bold">
        Loading Mock Test Editor...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Control Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-200/80 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <button 
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-brand-blue transition-colors px-3 py-2 rounded-xl hover:bg-gray-100"
              >
                <ArrowLeft size={18} />
                <span>Dashboard</span>
              </button>

              <div className="h-6 w-px bg-gray-200 hidden sm:block" />

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    {testData.title || 'Untitled Mock Test'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                    {testData.exam}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-1">
                  <span className="flex items-center gap-1">
                    <FileText size={13} className="text-gray-400" />
                    {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-gray-400" />
                    {testData.timeLimit} Mins
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Award size={13} className="text-gray-400" />
                    Pass: {testData.passingScore}%
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-bold text-brand-blue">
                    <DollarSign size={13} />
                    {testData.isPaid ? testData.price || 'Paid' : 'Free Access'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setActivePane(activePane === 'settings' ? 'question' : 'settings');
                  setSidebarOpenMobile(false);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
                  activePane === 'settings'
                    ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Settings size={16} />
                <span>Test Settings</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarOpenMobile(!sidebarOpenMobile)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <FileText size={16} />
                <span>List ({questions.length})</span>
              </button>

              <button 
                onClick={handleSave}
                disabled={saving}
                className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-brand-blue/25 hover:shadow-brand-blue/40 disabled:opacity-60 transition-all"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{id ? 'Update Test' : 'Publish Test'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Two-Pane Editor Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Pane / Sidebar: Questions List */}
          <div 
            className={`lg:col-span-4 xl:col-span-4 bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col ${
              sidebarOpenMobile ? 'block' : 'hidden lg:flex'
            }`}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-base">Questions</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                    {questions.length}
                  </span>
                  {incompleteCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200" title={`${incompleteCount} incomplete questions`}>
                      <AlertCircle size={10} />
                      {incompleteCount} incomplete
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-blue text-white hover:bg-brand-blue/90 shadow-sm shadow-brand-blue/20 transition-all"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter by question text..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-blue focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Test Settings Shortcut Tab in Sidebar */}
            <div className="p-2 border-b border-gray-100 bg-gray-50/50">
              <button
                type="button"
                onClick={() => {
                  setActivePane('settings');
                  setSidebarOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                  activePane === 'settings'
                    ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    activePane === 'settings' ? 'bg-white/20 text-white' : 'bg-brand-blue/10 text-brand-blue'
                  }`}>
                    <Settings size={15} />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold truncate">General Test Settings</p>
                    <p className={`text-[10px] truncate ${activePane === 'settings' ? 'text-white/80' : 'text-gray-400'}`}>
                      {testData.exam.toUpperCase()} • {testData.timeLimit}m • {testData.isPaid ? 'Paid' : 'Free'}
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className={activePane === 'settings' ? 'text-white' : 'text-gray-400'} />
              </button>
            </div>

            {/* Scrollable Questions List */}
            <div className="max-h-[calc(100vh-340px)] overflow-y-auto p-2 space-y-1.5 divide-y-0">
              {filteredQuestions.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  No questions match your filter.
                </div>
              ) : (
                filteredQuestions.map(({ q, originalIndex }) => {
                  const isSelected = activePane === 'question' && selectedIndex === originalIndex;
                  const incomplete = isQuestionIncomplete(q);
                  const correctLetter = ['A', 'B', 'C', 'D'][q.correctAnswer] || 'A';

                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        setSelectedIndex(originalIndex);
                        setActivePane('question');
                        setSidebarOpenMobile(false);
                      }}
                      className={`group relative flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                        isSelected 
                          ? 'bg-blue-50/70 border-brand-blue shadow-sm' 
                          : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/80'
                      }`}
                    >
                      {/* Number Pill */}
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-brand-blue text-white' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }`}>
                        {originalIndex + 1}
                      </span>

                      {/* Question Content Snippet */}
                      <div className="flex-1 min-w-0 pr-6">
                        <p className={`text-xs font-semibold line-clamp-2 leading-relaxed ${
                          isSelected ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {q.text.trim() || <span className="text-gray-300 italic font-normal">Untitled question prompt...</span>}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isSelected 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            Key: {correctLetter}
                          </span>

                          {incomplete && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle size={9} />
                              Missing fields
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Delete Action */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuestion(originalIndex);
                        }}
                        className="absolute right-2.5 top-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Question"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar Bottom Add Bar */}
            <div className="p-3 border-t border-gray-100 bg-gray-50/50">
              <button
                type="button"
                onClick={addQuestion}
                className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-brand-blue text-gray-500 hover:text-brand-blue text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-white"
              >
                <Plus size={14} />
                <span>Add Another Question</span>
              </button>
            </div>
          </div>

          {/* Right Pane / Main Editing Area */}
          <div className="lg:col-span-8 xl:col-span-8">
            <AnimatePresence mode="wait">
              {activePane === 'question' ? (
                /* Question Details Editor */
                <motion.div
                  key={`question-${currentQuestion.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 sm:p-8 space-y-6"
                >
                  {/* Editor Sub-Header */}
                  <div className="flex items-center justify-between pb-5 border-b border-gray-100 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue font-extrabold flex items-center justify-center text-base">
                        Q{selectedIndex + 1}
                      </span>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Question {selectedIndex + 1} of {questions.length}
                        </h2>
                        <p className="text-xs text-gray-400">
                          Set question stem, options, correct answer key, and explanation.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => duplicateQuestion(selectedIndex)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 hover:text-brand-blue bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-200/60"
                        title="Duplicate this question"
                      >
                        <Copy size={14} />
                        <span>Duplicate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => removeQuestion(selectedIndex)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                        title="Delete this question"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Question Stem Textarea */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Question Stem / Scenario <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-gray-400">
                        {currentQuestion.text.length} characters
                      </span>
                    </div>
                    <textarea
                      value={currentQuestion.text}
                      onChange={e => updateQuestion(selectedIndex, { text: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-brand-blue focus:bg-white outline-none font-medium text-gray-800 text-sm leading-relaxed transition-all resize-none min-h-[120px]"
                      placeholder="Enter the clinical scenario, problem statement, or question prompt here..."
                      rows={4}
                    />
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Answer Options <span className="text-red-500">*</span>
                      </label>
                      <span className="text-xs text-gray-400">
                        Click <span className="text-emerald-600 font-bold">"Mark Correct"</span> to specify the key
                      </span>
                    </div>

                    <div className="space-y-3">
                      {currentQuestion.options.map((opt, oIndex) => {
                        const isCorrect = currentQuestion.correctAnswer === oIndex;
                        const optionLetter = String.fromCharCode(65 + oIndex);

                        return (
                          <div 
                            key={oIndex}
                            className={`p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                              isCorrect 
                                ? 'bg-emerald-50/40 border-emerald-500 shadow-sm' 
                                : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                                  isCorrect 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {optionLetter}
                                </span>
                                <span className="text-xs font-bold text-gray-600">
                                  Option {optionLetter}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => updateQuestion(selectedIndex, { correctAnswer: oIndex })}
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                                  isCorrect
                                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                                    : 'bg-white text-gray-400 hover:text-emerald-600 border border-gray-200 hover:border-emerald-300'
                                }`}
                              >
                                <CheckCircle2 size={13} />
                                <span>{isCorrect ? 'Correct Answer' : 'Mark Correct'}</span>
                              </button>
                            </div>

                            <input
                              type="text"
                              value={opt}
                              onChange={e => updateOption(selectedIndex, oIndex, e.target.value)}
                              placeholder={`Enter answer choice ${optionLetter}...`}
                              className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all ${
                                isCorrect 
                                  ? 'bg-white border border-emerald-300 text-gray-900 focus:ring-2 focus:ring-emerald-400' 
                                  : 'bg-white border border-gray-200 text-gray-800 focus:border-brand-blue'
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation Section */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <HelpCircle size={16} className="text-brand-blue" />
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Answer Rationale / Explanation (Optional)
                      </label>
                    </div>
                    <textarea
                      value={currentQuestion.explanation}
                      onChange={e => updateQuestion(selectedIndex, { explanation: e.target.value })}
                      className="w-full px-5 py-3.5 bg-blue-50/40 rounded-2xl border border-blue-100 focus:border-brand-blue focus:bg-white outline-none font-medium text-gray-800 text-sm leading-relaxed transition-all resize-none min-h-[90px]"
                      rows={3}
                      placeholder="Explain why the selected option is correct and provide clinical references or exam hints..."
                    />
                  </div>

                  {/* Bottom Navigation for Questions */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100 flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={selectedIndex === 0}
                      onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <ArrowLeft size={16} />
                      <span>Previous Question</span>
                    </button>

                    <span className="text-xs font-bold text-gray-400">
                      {selectedIndex + 1} of {questions.length}
                    </span>

                    {selectedIndex < questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setSelectedIndex(selectedIndex + 1)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-blue text-white hover:bg-brand-blue/90 shadow-sm shadow-brand-blue/20 transition-all"
                      >
                        <span>Next Question</span>
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all"
                      >
                        <Plus size={16} />
                        <span>Add Next Question</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* Test Settings Form */
                <motion.div
                  key="settings-pane"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 sm:p-8 space-y-6"
                >
                  <div className="flex items-center justify-between pb-5 border-b border-gray-100 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue font-bold flex items-center justify-center">
                        <Settings size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Mock Test Configuration & Settings
                        </h2>
                        <p className="text-xs text-gray-400">
                          Set exam category, timer, passing score, and access pricing.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActivePane('question')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20 transition-colors"
                    >
                      <FileText size={14} />
                      <span>Back to Questions Editor</span>
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Test Title */}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Test Title <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text"
                        value={testData.title}
                        onChange={e => { setTestData({...testData, title: e.target.value}); setIsDirty(true); }}
                        className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-brand-blue focus:bg-white outline-none font-bold text-gray-800 text-sm transition-all"
                        placeholder="e.g. DHA General Practice Comprehensive Mock 1"
                      />
                    </div>

                    {/* Exam Authority */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Exam Authority / Category
                      </label>
                      <select 
                        value={testData.exam}
                        onChange={e => { 
                          const val = e.target.value;
                          setTestData({
                            ...testData, 
                            exam: val,
                            isPaid: val === 'free' ? false : testData.isPaid
                          }); 
                          setIsDirty(true); 
                        }}
                        className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-brand-blue focus:bg-white outline-none font-bold text-gray-800 text-sm transition-all"
                      >
                        <option value="dha">DHA (Dubai Health Authority)</option>
                        <option value="haad">HAAD / DOH (Abu Dhabi)</option>
                        <option value="moat">MOH / MOAT</option>
                        <option value="omsb">OMSB (Oman)</option>
                        <option value="nhra">NHRA (Bahrain)</option>
                        <option value="smle">SMLE (Saudi Medical)</option>
                        <option value="general">General Medical Practice</option>
                        <option value="free">Free Mock Test</option>
                      </select>
                    </div>

                    {/* Time Limit & Passing Score */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Time (Mins)
                        </label>
                        <input 
                          type="number"
                          value={testData.timeLimit}
                          onChange={e => { setTestData({...testData, timeLimit: parseInt(e.target.value) || 0}); setIsDirty(true); }}
                          className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-brand-blue focus:bg-white outline-none font-bold text-gray-800 text-sm transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Passing (%)
                        </label>
                        <input 
                          type="number"
                          value={testData.passingScore}
                          onChange={e => { setTestData({...testData, passingScore: parseInt(e.target.value) || 0}); setIsDirty(true); }}
                          className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-brand-blue focus:bg-white outline-none font-bold text-gray-800 text-sm transition-all"
                        />
                      </div>
                    </div>

                    {/* Access Pricing */}
                    <div className="sm:col-span-2 space-y-3 p-5 rounded-2xl bg-gray-50/80 border border-gray-200/80">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                        Access Model
                      </label>
                      <div className="flex gap-3">
                        <button 
                          type="button"
                          onClick={() => { setTestData({...testData, isPaid: false}); setIsDirty(true); }}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                            !testData.isPaid 
                              ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20' 
                              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          🎁 Free Access
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setTestData({...testData, isPaid: true}); setIsDirty(true); }}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                            testData.isPaid 
                              ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20' 
                              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          💎 Paid Simulator
                        </button>
                      </div>

                      {testData.isPaid && (
                        <div className="pt-2 space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Price Display (e.g. $29 or 150 AED)
                          </label>
                          <input 
                            type="text"
                            value={testData.price}
                            onChange={e => { setTestData({...testData, price: e.target.value}); setIsDirty(true); }}
                            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-brand-blue outline-none font-bold text-sm"
                            placeholder="Enter test price..."
                          />
                        </div>
                      )}
                    </div>

                    {/* Overview & Instructions */}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Description / Student Instructions
                      </label>
                      <textarea 
                        rows={4}
                        value={testData.description}
                        onChange={e => { setTestData({...testData, description: e.target.value}); setIsDirty(true); }}
                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-brand-blue focus:bg-white outline-none font-medium text-gray-800 text-sm transition-all resize-none"
                        placeholder="Provide test overview, exam syllabus coverage, or instructions for students..."
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActivePane('question')}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-brand-blue text-white hover:bg-brand-blue/90 shadow-md shadow-brand-blue/20 transition-all"
                    >
                      <span>Proceed to Questions Editor</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMocktestEditor;
