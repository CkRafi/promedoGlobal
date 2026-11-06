import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  UserCheck, 
  Server, 
  BellRing, 
  Cookie, 
  FileCheck2, 
  HelpCircle,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', title: '1. Overview & Commitment', icon: ShieldCheck },
    { id: 'data-collection', title: '2. Information We Collect', icon: Database },
    { id: 'data-usage', title: '3. How We Use Your Data', icon: UserCheck },
    { id: 'security', title: '4. Security & Data Protection', icon: Lock },
    { id: 'sharing', title: '5. Third-Party Sharing', icon: Server },
    { id: 'cookies', title: '6. Cookies & Tracking', icon: Cookie },
    { id: 'rights', title: '7. Your Privacy Rights', icon: Eye },
    { id: 'children', title: '8. Age & Eligibility', icon: FileCheck2 },
    { id: 'changes', title: '9. Updates to Policy', icon: BellRing },
    { id: 'contact', title: '10. Contact Us', icon: HelpCircle },
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
        <div className="absolute top-0 left-1/3 w-[450px] h-[450px] bg-brand-blue/15 rounded-full blur-[110px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-brand-periwinkle mb-4">
            <ShieldCheck size={14} />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
            Your privacy and data security are paramount to us. Learn how Promedo protects your personal and educational information.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400 mt-6 pt-4 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-brand-blue" />
              Effective Date: August 2026
            </span>
            <span>•</span>
            <span>Promedo MedMe Global Learning Platform</span>
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
                Navigation
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
                  <p className="text-xs font-bold text-brand-dark mb-1">Privacy Question?</p>
                  <p className="text-[11px] text-gray-500 mb-3">Feel free to request account deletion or data clarification anytime.</p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-extrabold text-brand-blue hover:underline"
                  >
                    <span>Contact Privacy Officer</span>
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
              <section id="overview" className="scroll-mt-28 space-y-3">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <ShieldCheck size={22} className="shrink-0" />
                  <h2>1. Overview & Privacy Commitment</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    Promedo MedMe ("Promedo", "we", "us", or "our") operates the Promedo medical licensing exam preparation portal. We are committed to safeguarding the privacy of medical students, general practitioners, specialists, and nurses who use our website, mobile interface, and learning modules.
                  </p>
                  <p>
                    This Privacy Policy explains how we collect, store, process, and protect your personal data when you interact with our platform.
                  </p>
                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-900 font-medium flex items-start gap-2.5">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-0.5">We Respect Your Data:</strong>
                      Promedo NEVER sells, rents, or trades candidate personal data or email addresses to third-party advertisers.
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section id="data-collection" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <Database size={22} className="shrink-0" />
                  <h2>2. Information We Collect</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>We collect information necessary to provide seamless educational services and track practice test performance:</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">A. Personal Identification Data</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Full Name, Email Address, and Phone/WhatsApp Number during sign-up.</li>
                      <li>Medical Specialty / Role (e.g., General Practitioner, Specialist Dentist, Registered Nurse).</li>
                      <li>Target Medical Exam (e.g., DHA Dubai, HAAD Abu Dhabi, MOH UAE, SMLE Saudi Arabia).</li>
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">B. Performance & Progress Analytics</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Mock test scores, question attempt history, time spent per topic, and subject strength breakdowns.</li>
                      <li>Video lecture watch progress and bookmark preferences.</li>
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">C. Payment Details</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Transaction logs and enrollment verification data (handled securely via payment gateways).</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section id="data-usage" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <UserCheck size={22} className="shrink-0" />
                  <h2>3. How We Use Your Information</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>Your data is processed for the following legitimate educational and administrative purposes:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-gray-700 font-medium">
                    <li>To unlock access to enrolled medical courses, Q-banks, and mock test simulators.</li>
                    <li>To generate personalized student dashboards, analytics charts, and progress reports.</li>
                    <li>To facilitate 1-on-1 mentor guidance and answer technical/academic support queries.</li>
                    <li>To notify you regarding exam blueprint updates, schedule changes, or new course releases.</li>
                    <li>To maintain platform security and prevent unauthorized account access or content scraping.</li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section id="security" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <Lock size={22} className="shrink-0" />
                  <h2>4. Security & Data Protection Measures</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    We employ industry-standard technical and organizational safeguards to protect your personal data against loss, misuse, unauthorized access, or disclosure:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Encryption:</strong> All data transmitted between your browser and Promedo is encrypted using SSL/TLS protocols.</li>
                    <li><strong>Cloud Infrastructure:</strong> Firebase Authentication and Google Cloud Platform encrypted storage.</li>
                    <li><strong>Access Restrictions:</strong> Administrative access to user records is strictly restricted on a need-to-know basis.</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section id="sharing" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <Server size={22} className="shrink-0" />
                  <h2>5. Third-Party Service Providers</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    We may share essential data with trusted infrastructure providers who assist in operating our platform:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Cloud Services:</strong> Firebase / Google Cloud for secure database hosting and user authentication.</li>
                    <li><strong>Payment Processors:</strong> PCI-DSS compliant payment gateways for secure checkout.</li>
                    <li><strong>Customer Support:</strong> WhatsApp / Email communication tools for responsive student assistance.</li>
                  </ul>
                </div>
              </section>

              {/* Section 6 */}
              <section id="cookies" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <Cookie size={22} className="shrink-0" />
                  <h2>6. Cookies & Local Storage</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    Promedo uses browser cookies and local storage tokens strictly to maintain active login sessions, save mock test timer states, and remember theme or language preferences. You can manage or disable cookies in your browser settings.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section id="rights" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <Eye size={22} className="shrink-0" />
                  <h2>7. Your Rights & Choices</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2">
                  <p>You have full ownership of your personal information. You can:</p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 font-medium">
                    <li>View and edit your profile details at any time in your Dashboard.</li>
                    <li>Request a full export of your student progress data.</li>
                    <li>Request complete account deletion and data removal by emailing customer support.</li>
                    <li>Opt out of non-essential promotional messages.</li>
                  </ul>
                </div>
              </section>

              {/* Section 8 */}
              <section id="children" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <FileCheck2 size={22} className="shrink-0" />
                  <h2>8. Age Limit & Eligibility</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    Our services are designed exclusively for adult medical candidates and professionals aged 18 or older. We do not knowingly collect personal information from individuals under 18 years of age.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section id="changes" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <BellRing size={22} className="shrink-0" />
                  <h2>9. Updates to This Privacy Policy</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    We may update this policy periodically to reflect platform additions or legal requirements. Material modifications will be highlighted on the website or communicated via email.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section id="contact" className="scroll-mt-28 space-y-3 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-brand-blue font-black text-lg">
                  <HelpCircle size={22} className="shrink-0" />
                  <h2>10. Contact Privacy Officer</h2>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    If you have questions, feedback, or requests regarding this Privacy Policy or your data, please reach out to us:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1.5 text-xs font-semibold text-brand-dark">
                    <p><strong>Email:</strong> info.promedo@gmail.com</p>
                    <p><strong>WhatsApp Support:</strong> +91 90373 84400</p>
                    <p><strong>Platform:</strong> Promedo MedMe Learning Portal</p>
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

export default PrivacyPolicy;
