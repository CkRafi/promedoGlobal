import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Save, Star, ShieldCheck, AlertCircle } from 'lucide-react';
import { Testimonial } from '../lib/testimonials';
import AvatarPicker, { FEMALE_CARTOON_AVATARS } from './AvatarPicker';

interface EditTestimonialModalProps {
  isOpen: boolean;
  testimonial: Testimonial | null;
  onClose: () => void;
  onSave: (updated: Partial<Testimonial>) => Promise<void>;
}

export const EditTestimonialModal: React.FC<EditTestimonialModalProps> = ({
  isOpen,
  testimonial,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'DHA Exam Candidate',
    studentId: '',
    text: '',
    rating: 5,
    avatar: FEMALE_CARTOON_AVATARS[0].url,
    status: 'approved' as 'approved' | 'pending' | 'rejected'
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name || '',
        role: testimonial.role || 'DHA Exam Candidate',
        studentId: testimonial.studentId || '',
        text: testimonial.text || '',
        rating: testimonial.rating || 5,
        avatar: testimonial.avatar || FEMALE_CARTOON_AVATARS[0].url,
        status: testimonial.status || 'pending'
      });
      setErrorMsg('');
    }
  }, [testimonial]);

  if (!isOpen || !testimonial) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Candidate / Doctor name is required.');
      return;
    }
    if (!formData.text.trim()) {
      setErrorMsg('Testimonial review quote text is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      await onSave({
        name: formData.name.trim(),
        role: formData.role.trim(),
        studentId: formData.studentId.trim(),
        text: formData.text.trim(),
        rating: formData.rating,
        avatar: formData.avatar,
        status: formData.status
      });
      onClose();
    } catch (err: any) {
      console.error('Error saving testimonial edit:', err);
      setErrorMsg(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] overflow-y-auto p-3 sm:p-4 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-dark/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl max-h-[calc(100vh-2rem)] sm:max-h-[88vh] z-10 border border-gray-100 flex flex-col my-auto overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 pb-3.5 border-b border-gray-100 shrink-0 bg-white">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-full">
                Testimonial CRUD Management
              </span>
              <h3 className="text-xl font-black text-brand-dark mt-1">Edit Testimonial</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="overflow-y-auto p-5 sm:p-6 py-4 space-y-4 flex-1 min-h-0 overscroll-contain">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            {/* Status Selection */}
            <div>
              <label className="block text-[11px] font-extrabold text-brand-dark uppercase tracking-wider mb-1.5">
                Verification Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'approved' })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    formData.status === 'approved'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <Check size={14} />
                  <span>Approved (Live)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'pending' })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    formData.status === 'pending'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <ShieldCheck size={14} />
                  <span>Pending</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'rejected' })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                    formData.status === 'rejected'
                      ? 'bg-red-500 text-white border-red-500 shadow-xs'
                      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <X size={14} />
                  <span>Rejected</span>
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-brand-dark uppercase tracking-wider mb-1">
                  Doctor / Candidate Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-brand-blue focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-brand-dark uppercase tracking-wider mb-1">
                  Role / Target Exam <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. DHA Exam Candidate"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-brand-blue focus:bg-white"
                />
              </div>
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-[11px] font-extrabold text-brand-dark uppercase tracking-wider mb-1">
                Student ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="PRO-2025-108"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-brand-blue focus:bg-white"
                />
                <ShieldCheck size={15} className="absolute left-3 top-3 text-brand-blue pointer-events-none" />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Used to verify student identity. Mandatory for candidate homepage submissions.
              </p>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-[11px] font-extrabold text-brand-dark uppercase tracking-wider mb-1">
                Star Rating
              </label>
              <div className="inline-flex items-center gap-1 py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-xl">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-0.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      size={18}
                      fill={star <= formData.rating ? 'currentColor' : 'none'}
                      className={star <= formData.rating ? 'text-amber-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-gray-600 ml-2">
                  {formData.rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Avatar Selection: Male or Female */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
              <AvatarPicker
                value={formData.avatar}
                onChange={avatar => setFormData({ ...formData, avatar })}
                label="Select Doctor Avatar"
              />
            </div>

            {/* Review text */}
            <div>
              <label className="block text-[11px] font-extrabold text-brand-dark uppercase tracking-wider mb-1">
                Testimonial Review Quote <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.text}
                onChange={e => setFormData({ ...formData, text: e.target.value })}
                placeholder="Candidate feedback and preparation review..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-brand-blue focus:bg-white resize-none leading-relaxed"
              />
            </div>

            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 p-4 sm:p-5 pt-3 border-t border-gray-100 bg-white shrink-0 rounded-b-3xl">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-brand-blue hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-brand-blue/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save size={15} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditTestimonialModal;
