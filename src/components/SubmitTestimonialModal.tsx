import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Star, Send, ShieldCheck, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { submitUserTestimonial } from '../lib/testimonials';
import AvatarPicker, { FEMALE_CARTOON_AVATARS } from './AvatarPicker';

interface SubmitTestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubmitTestimonialModal: React.FC<SubmitTestimonialModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    role: 'DHA Exam Candidate',
    text: '',
    rating: 5,
    avatar: FEMALE_CARTOON_AVATARS[0].url
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedStudentId, setSubmittedStudentId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.studentId.trim()) {
      setErrorMsg('Student ID is strictly required to verify your enrollment with Promedo.');
      return;
    }

    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!formData.text.trim()) {
      setErrorMsg('Please write your testimonial or review experience.');
      return;
    }

    setLoading(true);

    try {
      await submitUserTestimonial({
        name: formData.name,
        studentId: formData.studentId,
        role: formData.role,
        text: formData.text,
        rating: formData.rating,
        avatar: formData.avatar
      });

      setSubmittedStudentId(formData.studentId.trim());
      setSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error submitting testimonial:', err);
      setErrorMsg(err.message || 'Failed to submit testimonial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrorMsg('');
    setSubmitted(false);
    setFormData({
      name: '',
      studentId: '',
      role: 'DHA Exam Candidate',
      text: '',
      rating: 5,
      avatar: FEMALE_CARTOON_AVATARS[0].url
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] overflow-y-auto p-3 sm:p-4 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-brand-dark/70 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-[28px] sm:rounded-[32px] shadow-2xl border border-gray-100 z-10 flex flex-col my-auto max-h-[calc(100vh-2rem)] sm:max-h-[88vh] overflow-hidden"
        >
          {submitted ? (
            <div className="text-center p-6 sm:p-8 space-y-4 overflow-y-auto my-auto">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-black text-brand-dark">Testimonial Received!</h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-brand-blue rounded-full text-xs font-bold border border-blue-100">
                <ShieldCheck size={14} />
                Student ID: <span className="font-black">{submittedStudentId}</span>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed pt-1">
                Thank you for sharing your experience! Because you provided your Student ID, our administrative team will verify your submission. Once approved, your testimonial will be proudly featured on our Home page community section.
              </p>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 text-left text-xs text-amber-800 space-y-1 max-w-md mx-auto">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" />
                  What happens next?
                </div>
                <p className="text-amber-700 text-[11px] leading-relaxed">
                  Our team reviews student submissions for quality and authenticity. Verification typically takes within a few business hours.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="mt-4 px-8 py-3.5 bg-brand-blue hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-5 sm:p-6 pb-3.5 border-b border-gray-100 shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center border border-blue-100 shadow-2xs shrink-0">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-brand-dark leading-tight">Submit Your Testimonial</h3>
                    <p className="text-[11px] sm:text-xs text-gray-400">Share your exam success with future medical aspirants.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-brand-dark hover:bg-gray-100 rounded-full transition-colors cursor-pointer shrink-0"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="overflow-y-auto p-5 sm:p-6 py-4 space-y-3.5 flex-1 min-h-0 overscroll-contain">
                <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-start gap-2.5">
                  <ShieldCheck size={16} className="text-brand-blue shrink-0 mt-0.5" />
                  <div className="text-[11px] text-brand-dark leading-relaxed">
                    <span className="font-extrabold text-brand-blue">Verification Notice:</span> A valid <span className="font-bold">Student ID</span> is required. All submissions are verified by the admin team before appearing on the website.
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-2 text-xs font-semibold">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Student ID (Required) */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-extrabold text-brand-dark uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Student ID <span className="text-red-500">* (Required)</span></span>
                    <span className="text-[10px] text-gray-400 font-normal">e.g., PRO-2024-89</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={e => {
                      setFormData({ ...formData, studentId: e.target.value });
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Enter your Promedo Student ID (e.g. PRO-9421)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-blue text-xs font-bold outline-none transition-all placeholder:font-normal"
                  />
                </div>

                {/* Doctor Name & Role */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-extrabold text-brand-dark uppercase tracking-wider mb-1">
                      Doctor / Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Dr. Sarah Jenkins"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-blue text-xs font-medium outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-extrabold text-brand-dark uppercase tracking-wider mb-1">
                      Role / Target Exam <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. DHA Exam Candidate"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-blue text-xs font-medium outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Rating (1-5 Stars) */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-extrabold text-brand-dark uppercase tracking-wider mb-1">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          size={20}
                          fill={star <= formData.rating ? 'currentColor' : 'none'}
                          className={star <= formData.rating ? 'text-amber-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-500 ml-1.5">
                      {formData.rating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Testimonial Quote */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-extrabold text-brand-dark uppercase tracking-wider mb-1">
                    Testimonial / Review Experience <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.text}
                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Tell us about your experience preparing with Promedo, the mock test simulator, mentors, and how it helped you pass your licensing exam..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-brand-blue text-xs font-medium outline-none transition-all resize-y min-h-[72px] leading-relaxed"
                  />
                </div>

                {/* Avatar Selection: Male or Female */}
                <AvatarPicker
                  value={formData.avatar}
                  onChange={(avatar) => setFormData({ ...formData, avatar })}
                  label="Select Doctor Avatar"
                />
              </div>

              {/* Pinned Sticky Footer with Submit Button */}
              <div className="p-4 sm:p-6 pt-3 bg-white border-t border-gray-100 shrink-0 rounded-b-[28px] sm:rounded-b-[32px]">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl sm:rounded-2xl bg-brand-blue hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-md shadow-brand-blue/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting for Verification...</span>
                  ) : (
                    <>
                      <span>Submit Testimonial (Admin Verification)</span>
                      <Send size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SubmitTestimonialModal;
