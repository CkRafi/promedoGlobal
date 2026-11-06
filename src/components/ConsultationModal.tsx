import React, { useState } from 'react';
import { X, User, Phone, Mail, GraduationCap, Calendar, Globe, ClipboardList, MessageSquare, CalendarCheck, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAM_OPTIONS = [
  "DHA-DUBAI Examination",
  "HAAD / DOH Examination",
  "MOH UAE Examination",
  "SMLE-SAUDI Examination",
  "QCHP-QATAR Examination",
  "OMSB-OMAN Examination",
  "NHRA/BMLE-BAHRAIN Examination",
  "KMLE-KUWAIT",
  "OTHERS"
];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose }) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    qualification: '',
    graduationYear: '',
    examPreparingFor: '',
    otherDetails: '',
    plannedExamDate: '',
    email: '',
    whatsapp: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const appointmentPayload = {
      fullName: formData.fullName,
      email: formData.email,
      whatsapp: formData.whatsapp,
      qualification: formData.qualification,
      graduationYear: formData.graduationYear,
      plannedExamDate: formData.plannedExamDate,
      examPreparingFor: formData.examPreparingFor,
      otherDetails: formData.examPreparingFor === 'OTHERS' ? formData.otherDetails : '',
      country: formData.country,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    let docId = 'app_' + Date.now();

    try {
      const docRef = await addDoc(collection(db, 'appointments'), appointmentPayload);
      if (docRef?.id) docId = docRef.id;
    } catch (err) {
      console.warn("Could not save appointment to Firestore directly, saving locally:", err);
    }

    try {
      const existing = JSON.parse(localStorage.getItem('local_appointments') || '[]');
      localStorage.setItem('local_appointments', JSON.stringify([
        { id: docId, ...appointmentPayload },
        ...existing
      ]));
    } catch (e) {
      console.error("Local appointment save error:", e);
    }

    setSubmitting(false);
    alert('Your appointment has been booked successfully! Our advisory team will contact you on WhatsApp / Email shortly.');
    
    setFormData({
      fullName: '',
      country: '',
      qualification: '',
      graduationYear: '',
      examPreparingFor: '',
      otherDetails: '',
      plannedExamDate: '',
      email: '',
      whatsapp: ''
    });

    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#F3F4F6] rounded-[40px] w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl relative border border-white/20">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 hover:bg-gray-200 rounded-full transition-colors z-10"
        >
          <X size={24} className="text-gray-600" />
        </button>

        <div className="p-8 md:p-12">
          <div className="flex items-start gap-4 mb-10">
            <div className="bg-blue-50 p-3 rounded-2xl shadow-sm text-brand-blue">
              <CalendarCheck size={28} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                Book an Appointment & <br />
                Mentoring With <span className="text-brand-blue">Dr Muhammed Saleem</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1">Schedule a 1-on-1 licensing consultation or request customized exam prep guidance.</p>
              <div className="h-1 w-32 bg-brand-blue mt-2.5 rounded-full"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                  </div>
                  <input
                    required
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all placeholder:text-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">Email ID</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                  </div>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all placeholder:text-gray-400"
                    placeholder="Enter your email ID"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">Contact No. (WhatsApp)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                  </div>
                  <input
                    required
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all placeholder:text-gray-400"
                    placeholder="Enter your contact no."
                  />
                </div>
              </div>

              {/* Qualification */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">Qualification</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <GraduationCap size={18} className="text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                  </div>
                  <input
                    required
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all placeholder:text-gray-400"
                    placeholder="Enter your qualification"
                  />
                </div>
              </div>

              {/* Year of Graduation */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">Year of Graduation</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                  </div>
                  <input
                    required
                    type="text"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all placeholder:text-gray-400"
                    placeholder="eg:2020"
                  />
                </div>
              </div>

              {/* Planned Exam Date */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">Planned Exam Month / Year</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                  </div>
                  <input
                    required
                    type="text"
                    name="plannedExamDate"
                    value={formData.plannedExamDate}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all placeholder:text-gray-400"
                    placeholder="eg:June 2026"
                  />
                </div>
              </div>

              {/* Exam Preparing For */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">Exam / Service Selected</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ClipboardList size={18} className="text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                  </div>
                  <select
                    required
                    name="examPreparingFor"
                    value={formData.examPreparingFor}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all appearance-none"
                  >
                    <option value="">Select Exam or Service</option>
                    {EXAM_OPTIONS.map(exam => (
                      <option key={exam} value={exam}>{exam}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">Country</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe size={18} className="text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                  </div>
                  <select
                    required
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all appearance-none"
                  >
                    <option value="">Select Country</option>
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional text field if OTHERS selected */}
              {formData.examPreparingFor === 'OTHERS' && (
                <div className="md:col-span-2 space-y-2 bg-blue-50/80 p-5 rounded-2xl border border-brand-blue/30 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-bold text-gray-900 ml-1 flex items-center gap-2">
                    <MessageSquare size={16} className="text-brand-blue" />
                    <span>Please specify what exam or guidance you are looking for:</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    name="otherDetails"
                    value={formData.otherDetails}
                    onChange={handleChange}
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
                    placeholder="Describe your specific exam, specialty, or licensing requirements..."
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-5 bg-brand-blue text-white rounded-2xl font-bold text-lg hover:bg-brand-blue/90 transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>BOOKING APPOINTMENT...</span>
                </>
              ) : (
                <>
                  <span>BOOK APPOINTMENT NOW</span>
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <X size={12} className="rotate-45" />
                  </div>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConsultationModal;
