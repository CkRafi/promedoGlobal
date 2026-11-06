import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Linkedin,
  Youtube, 
  Mail, 
  Phone, 
  MessageCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Award,
  BookOpen
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <footer className="bg-[#0A0D1B] text-white pt-16 pb-10 relative overflow-hidden border-t border-white/10">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top CTA / Newsletter Strip */}
        <div className="bg-gradient-to-r from-brand-blue/90 via-blue-700/80 to-brand-dark p-6 sm:p-10 rounded-3xl border border-white/15 shadow-2xl mb-16 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 text-white pointer-events-none">
            <Sparkles size={240} />
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-7 space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                Ready to Ace Your Medical License Exam?
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 font-normal max-w-xl leading-relaxed">
                Join 20,000+ medical doctors, specialists, and nurses preparing for DHA, HAAD, MOH, SMLE, & OMSB. Get high-yield updates and free mock tests directly.
              </p>
            </div>

            <div className="lg:col-span-5">
              {subscribed ? (
                <div className="bg-white/10 border border-emerald-400/30 rounded-2xl p-4 text-center text-emerald-200 text-xs font-extrabold flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  <span>Thank you! You are subscribed for exam updates.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="email" 
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address..."
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 text-xs focus:outline-none focus:ring-2 focus:ring-white/50 flex-1"
                  />
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-white text-brand-dark hover:bg-white/90 font-extrabold text-xs rounded-xl shadow-lg transition-transform active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Main Footer 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-16 border-b border-white/10">
          
        {/* Column 1: Brand & Mission */}
        <div className="space-y-5">
          <Link to="/" className="h-9 flex items-center gap-3 group inline-flex">
            <img
              src="/promedo-logo.png"
              alt="Promedo"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-2xl font-display font-black tracking-tight text-white">
              Promedo
            </span>
          </Link>
            
          <p className="text-xs text-gray-400 leading-relaxed font-normal">
            Empowering healthcare professionals worldwide to achieve their medical licensing dreams across UAE, Saudi Arabia, Oman, Qatar, and Gulf nations.
          </p>

          {/* Highlights */}
          <div className="space-y-2 pt-1 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              <span>98.4% First-Time Pass Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-brand-blue shrink-0" />
              <span>Verified 2026 Exam Questions</span>
            </div>
          </div>
        </div>

        {/* Column 2: Licensing Exams Prep */}
        <div className="space-y-4">
          <h4 className="h-9 flex items-center text-xs font-bold uppercase tracking-wider text-white gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
            Licensing Exams
          </h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-normal">
              <li>
                <Link to="/mocktests" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>DHA Exam Simulator (Dubai)</span>
                </Link>
              </li>
              <li>
                <Link to="/mocktests" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>HAAD / DoH Exam Simulator (Abu Dhabi)</span>
                </Link>
              </li>
              <li>
                <Link to="/mocktests" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>MOH Exam Simulator (UAE)</span>
                </Link>
              </li>
              <li>
                <Link to="/mocktests" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>SMLE Exam Simulator (Saudi Arabia)</span>
                </Link>
              </li>
              <li>
                <Link to="/mocktests" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>OMSB Exam Simulator (Oman)</span>
                </Link>
              </li>
              <li>
                <Link to="/mocktests" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>NHRA & QCHP Exam Simulator (Bahrain & Qatar)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Medical Professions & Specialties */}
          <div className="space-y-4">
            <h4 className="h-9 flex items-center text-xs font-bold uppercase tracking-wider text-white gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
              Medical Professions
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-normal">
              <li>
                <Link to="/courses" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>General Practitioner (GP / MBBS)</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Registered Nurse (RN) & Midwifery</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Dental Practitioner & Surgery</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Clinical Pharmacists & Assistants</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Pediatrics, OB-GYN & Internal Med</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Allied Health & Radiography</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Direct Support */}
          <div className="space-y-4">
            <h4 className="h-9 flex items-center text-xs font-bold uppercase tracking-wider text-white gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue"></span>
              Direct Support
            </h4>
            
            <div className="space-y-3 text-xs text-gray-400">
              <a 
                href="mailto:info.promedo@gmail.com" 
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-blue/20 text-brand-blue flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Email Us</p>
                  <p className="text-xs font-bold text-white truncate">info.promedo@gmail.com</p>
                </div>
              </a>

              <a 
                href="https://wa.me/919037384400" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-200 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-emerald-400 uppercase font-bold">WhatsApp Advisor</p>
                  <p className="text-xs font-bold text-white">+91 90373 84400</p>
                </div>
              </a>

              <div className="flex items-center gap-2.5 pt-1 text-[11px] text-gray-400">
                <Clock size={14} className="text-brand-blue shrink-0" />
                <span>Working Hours: Mon – Sat (9 AM – 7 PM GST)</span>
              </div>

              {/* Connect With Us & Social Media Links */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-300 mb-2.5">Connect With Us</p>
                <div className="flex items-center gap-2">
                  {[
                    { Icon: Facebook, href: "https://facebook.com", title: "Facebook" },
                    { Icon: Instagram, href: "https://www.instagram.com/promedo_global?igsh=Y3JncDc5eGFieTdz&utm_source=qr", title: "Instagram" },
                    { Icon: Linkedin, href: "https://linkedin.com", title: "LinkedIn" },
                    { Icon: Youtube, href: "https://youtube.com", title: "YouTube" }
                  ].map(({ Icon, href, title }, i) => (
                    <a 
                      key={i} 
                      href={href} 
                      title={title}
                      target={href !== "#" ? "_blank" : undefined}
                      rel={href !== "#" ? "noopener noreferrer" : undefined}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-brand-blue border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all hover:scale-110 shadow-xs"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Security Bar */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-normal">
          <p>© {currentYear} Promedo. All rights reserved.</p>

          <div className="flex items-center gap-6 text-gray-400">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-white/20">•</span>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <span className="text-white/20">•</span>
            <Link to="/contact" className="hover:text-white transition-colors">Support Center</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
