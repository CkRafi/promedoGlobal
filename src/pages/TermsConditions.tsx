import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  ShieldCheck, 
  BookOpen, 
  Lock, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Scale, 
  UserCheck, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  const [activeSection, setActiveSection] = useState<string>('acceptance');

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms', icon: CheckCircle2 },
    { id: 'eligibility', title: '2. Eligibility & Accounts', icon: UserCheck },
    { id: 'educational', title: '3. Medical Exam Content & License', icon: BookOpen },
    { id: 'payments', title: '4. Fees, Payments & Refunds', icon: CreditCard },
    { id: 'medical-disclaimer', title: '5. Medical & Exam Disclaimer', icon: AlertCircle },
    { id: 'ip', title: '6. Intellectual Property Rights', icon: ShieldCheck },
    { id: 'conduct', title: '7. Prohibited User Conduct', icon: Lock },
    { id: 'liability', title: '8. Limitation of Liability', icon: Scale },
    { id: 'termination', title: '9. Account Termination', icon: FileText },
    { id: 'governing', title: '10. Governing Law & Contact', icon: HelpCircle },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-6">
      {/* Header Banner */}
      <div className="bg-[#0A0D1B] text-white py-16 relative overflow-hidden border-b border-white/10">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-brand-blue/15 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-brand-periwinkle mb-4">
            <FileText size={14} />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-3">
            Terms & Conditions
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
            Please read these terms carefully before using Promedo MedMe’s medical licensing exam preparation platform and services.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400 mt-6 pt-4 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-brand-blue" />
              Last Updated: August 2026
            </span>
            <span>•</span>
            <span>Applies to all Promedo platform users</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-28 space-y-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 px-3 mb-3">
                Table of Contents
              </h3>
              {sections.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isActive 
                        ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-brand-dark'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon size={15} className={isActive ? 'text-white' : 'text-brand-blue'} />
                      <span className="truncate">{item.title}</span>
                    </div>
                  </button>
                );
              })}

              <div className="pt-6 mt-6 border-t border-gray-100">
                <div className="bg-brand-periwinkle/30 p-4 rounded-2xl border border-brand-blue/10 text-center">
                  <p className="text-xs font-bold text-brand-dark mb-1">Have Questions?</p>
                  <p className="text-[11px] text-gray-500 mb-3">Our support team is here to help with any legal or platform query.</p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-extrabold text-brand-blue hover:underline"
                  >
                    <span>Contact Legal Support</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Document Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-10 text-brand-dark">
              
              {/* Section 1 */}
              <section id="acceptance" className="scroll-mt-28 space-y-3">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <CheckCircle2 size={22} className="shrink-0" />
                  <h2>1. Acceptance of Terms</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    By creating an account, accessing, browsing, or purchasing any exam preparation modules, mock tests, video lectures, or clinical Q-banks on Promedo ("the Platform"), you agree to be bound by these Terms and Conditions ("Terms").
                  </p>
                  <p>
                    If you do not agree to all terms herein, you must immediately discontinue use of the Platform. Promedo MedMe reserves the right to update these terms at any time. Continued use of our services following posted modifications constitutes your binding acceptance.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="eligibility" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <UserCheck size={22} className="shrink-0" />
                  <h2>2. Eligibility & User Accounts</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    Promedo is designed specifically for healthcare professionals, medical students, general practitioners, specialists, nurses, and allied health candidates preparing for licensing examinations (e.g., DHA Dubai, HAAD/DOH Abu Dhabi, MOH UAE, SMLE Saudi Arabia, OMSB Oman, QCHP Qatar, and related exams).
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 font-medium text-gray-700">
                    <li>You must be at least 18 years of age or possess legal capacity to enter into a binding contract.</li>
                    <li>You are responsible for maintaining the confidentiality of your login credentials and password.</li>
                    <li>Accounts are individual and non-transferable. Shared or group account access is strictly prohibited.</li>
                    <li>You must provide accurate, current, and complete registration details.</li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section id="educational" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <BookOpen size={22} className="shrink-0" />
                  <h2>3. Medical Exam Content & Grant of License</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    Upon enrollment in a course or mock test package, Promedo grants you a limited, personal, non-exclusive, non-transferable, and revocable license to access our study materials for your personal examination preparation.
                  </p>
                  <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 font-medium">
                    <p className="font-bold mb-1">Strict Prohibition on Content Sharing:</p>
                    You are strictly prohibited from recording, downloading (except for designated offline materials), reproducing, distributing, reselling, or sharing any mock test questions, rationales, video lectures, or PDF summaries provided by Promedo.
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section id="payments" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <CreditCard size={22} className="shrink-0" />
                  <h2>4. Fees, Payments & Refund Policy</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    All course fees and package prices are listed on the Platform in supported currencies. Payments are processed securely via encrypted payment gateways.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Access Duration:</strong> Course access is granted for the specific period stated at checkout (e.g., 3 months, 6 months, or 1 year unlimited access).</li>
                    <li><strong>Refund Policy:</strong> Due to the immediate digital delivery of proprietary Q-bank content and video lectures, purchases are generally non-refundable once content access has been initiated.</li>
                    <li><strong>Exceptions:</strong> Refund requests made within 48 hours of purchase with zero question attempts or video views may be reviewed on a case-by-case basis by contacting customer support.</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section id="medical-disclaimer" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <AlertCircle size={22} className="shrink-0" />
                  <h2>5. Medical & Exam Disclaimer</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p className="font-bold text-gray-800">
                    Educational Purpose Only:
                  </p>
                  <p>
                    Promedo provides educational materials designed to assist candidates with medical licensing exam preparation. The content does NOT constitute medical advice, clinical diagnosis, or patient care instructions.
                  </p>
                  <p>
                    While our mock tests and clinical rationales are meticulously curated by medical experts to reflect official blueprint styles, passing Promedo practice exams does not guarantee passing official licensing board exams (DHA, DOH, MOH, SMLE, etc.), as official exam outcomes depend on individual student preparation and board policies.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="ip" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <ShieldCheck size={22} className="shrink-0" />
                  <h2>6. Intellectual Property Rights</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    All trademarks, logos, brand names, software code, UI designs, question banks, explanations, and video tutorials displayed on Promedo are the exclusive intellectual property of Promedo MedMe and its licensors.
                  </p>
                  <p>
                    Unauthorized use, copying, or reverse-engineering of the Platform is a violation of copyright laws and international intellectual property treaties.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section id="conduct" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <Lock size={22} className="shrink-0" />
                  <h2>7. Prohibited User Conduct</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2">
                  <p>When using Promedo, you agree NOT to:</p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    <li>Share your login details or allow concurrent logins from multiple devices.</li>
                    <li>Use web crawlers, bots, or automated scrapers to extract practice questions.</li>
                    <li>Attempt to bypass security controls or breach database authentication measures.</li>
                    <li>Upload malicious scripts, viruses, or spam content.</li>
                  </ul>
                </div>
              </section>

              {/* Section 8 */}
              <section id="liability" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <Scale size={22} className="shrink-0" />
                  <h2>8. Limitation of Liability</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    To the maximum extent permitted by law, Promedo MedMe, its directors, instructors, and affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from your use or inability to use the Platform.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section id="termination" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <FileText size={22} className="shrink-0" />
                  <h2>9. Account Suspension & Termination</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    Promedo reserves the right to immediately suspend or terminate your account without refund if we detect unauthorized account sharing, content piracy, scraping, or breach of these Terms.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section id="governing" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <HelpCircle size={22} className="shrink-0" />
                  <h2>10. Governing Law & Contact Details</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    These Terms shall be governed by and construed in accordance with applicable legal frameworks. If you have any questions or concerns regarding these Terms & Conditions, please contact us at:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1.5 text-xs font-semibold text-brand-dark">
                    <p><strong>Email:</strong> info.promedo@gmail.com</p>
                    <p><strong>WhatsApp Support:</strong> +91 90373 84400</p>
                    <p><strong>Platform:</strong> Promedo MedMe Medical Licensing Portal</p>
                  </div>
                </div>
              </section>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
