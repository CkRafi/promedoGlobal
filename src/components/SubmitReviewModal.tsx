import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, CheckCircle2, Trophy, Star, Send, Sparkles } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: auth.currentUser?.displayName || '',
    title: 'General Practitioner',
    exam: 'DHA License Exam',
    score: 'Passed on 1st Attempt',
    posterUrl: '',
    text: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'reviews'), {
        name: formData.name || 'Doctor',
        title: formData.title || 'General Practitioner',
        exam: formData.exam || 'GP Prometric Exam',
        score: formData.score || 'Passed',
        posterUrl: formData.posterUrl,
        text: formData.text,
        status: 'pending', // Pending admin approval
        userId: auth.currentUser?.uid || 'guest',
        userEmail: auth.currentUser?.email || '',
        createdAt: new Date().toISOString()
      });

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error submitting review/poster:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: auth.currentUser?.displayName || '',
      title: 'General Practitioner',
      exam: 'DHA License Exam',
      score: 'Passed on 1st Attempt',
      posterUrl: '',
      text: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleReset}
          className="absolute inset-0 bg-brand-dark/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] z-10 border border-gray-100"
        >
          <button
            onClick={handleReset}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-brand-dark hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-black text-brand-dark">Review Submitted!</h3>
              <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                Thank you, <span className="font-bold text-brand-dark">{formData.name}</span>! Your success poster and review have been submitted for review. It will appear on the Hall of Fame once approved by our team.
              </p>
              <button
                onClick={handleReset}
                className="mt-6 px-8 py-3.5 bg-brand-blue hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-periwinkle text-brand-blue flex items-center justify-center">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-brand-dark">Share Your Success Story</h3>
                  <p className="text-xs text-gray-400">Upload your exam poster & review to join our Hall of Fame.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-brand-dark uppercase tracking-wider mb-1.5">
                      Doctor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Dr. Sarah Jenkins"
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-blue text-xs font-medium outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-brand-dark uppercase tracking-wider mb-1.5">
                      Specialty / Role
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="General Practitioner"
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-blue text-xs font-medium outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-brand-dark uppercase tracking-wider mb-1.5">
                      Exam Target
                    </label>
                    <select
                      value={formData.exam}
                      onChange={e => setFormData({ ...formData, exam: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-blue text-xs font-medium outline-none transition-all"
                    >
                      <option value="DHA License Exam">DHA Dubai License Exam</option>
                      <option value="HAAD / DoH Abu Dhabi">HAAD / DoH Abu Dhabi</option>
                      <option value="MOH UAE Exam">MOH UAE Exam</option>
                      <option value="SMLE Saudi Arabia">SMLE Saudi Arabia</option>
                      <option value="OMSB Oman">OMSB Oman</option>
                      <option value="QCHP Qatar">QCHP Qatar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-brand-dark uppercase tracking-wider mb-1.5">
                      Score / Result Status
                    </label>
                    <input
                      type="text"
                      value={formData.score}
                      onChange={e => setFormData({ ...formData, score: e.target.value })}
                      placeholder="Passed on 1st Attempt (89%)"
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-blue text-xs font-medium outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-brand-dark uppercase tracking-wider mb-1.5">
                    Success Poster Image URL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={formData.posterUrl}
                      onChange={e => setFormData({ ...formData, posterUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... or poster image link"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-blue text-xs font-medium outline-none transition-all"
                    />
                    <Upload size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Paste a direct image link for your congratulations banner or photo poster.</p>
                </div>

                {formData.posterUrl && (
                  <div className="p-2 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                      <img src={formData.posterUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <Sparkles size={12} /> Poster Image Linked
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-extrabold text-brand-dark uppercase tracking-wider mb-1.5">
                    Your Feedback / Review Quote
                  </label>
                  <textarea
                    rows={3}
                    value={formData.text}
                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Describe how Promedo helped you clear your Prometric exam..."
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-blue text-xs font-medium outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-brand-blue hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-md shadow-brand-blue/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Submit Success Poster & Review</span>
                      <Send size={15} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubmitReviewModal;
