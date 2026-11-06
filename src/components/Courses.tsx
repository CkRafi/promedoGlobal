import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Clock, BookOpen, GraduationCap, CheckCircle2, ArrowRight, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const Courses = () => {
  return (
    <section id="courses" className="py-20 bg-[#FAFBFD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Mock Tests Prometric Simulator Highlight Card (Top) */}
        <div className="mb-20" id="mocktests-highlight-section">
          <div className="max-w-5xl mx-auto" id="mocktests-highlight-container">
            <motion.div 
              whileHover={{ y: -3 }}
              className="relative overflow-hidden rounded-[32px] bg-brand-blue p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8"
              id="mocktests-highlight-card"
            >
              <div className="relative text-center md:text-left flex-1 space-y-3" id="mocktests-highlight-text-content">
                <span className="inline-block px-3.5 py-1 bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-full backdrop-blur-md" id="mocktests-badge">
                  Live Exam Practice Portal
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight" id="mocktests-highlight-title">
                  Prometric GP Exam Simulator
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm max-w-lg leading-relaxed font-normal" id="mocktests-highlight-desc">
                  Practice right now with our high-yield, authentic Prometric question banks. Experience real exam timing, immediate detailed rationales, and complete performance analysis.
                </p>
              </div>

              <div className="relative shrink-0 w-full md:w-auto text-center" id="mocktests-highlight-cta">
                <Link 
                  to="/mocktests" 
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-brand-dark font-extrabold text-xs sm:text-sm rounded-full shadow-lg hover:bg-brand-periwinkle transition-all cursor-pointer"
                  id="try-mocktests-btn"
                >
                  Try Prometric Mock Tests
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* LMS / Courses Section (Bottom) */}
        <div id="lms-courses-section">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-brand-periwinkle text-brand-blue text-xs font-extrabold rounded-full mb-3">
                <Sparkles size={13} />
                LMS Learning Portal
              </span>
              <h2 className="text-4xl sm:text-5xl font-black font-display text-brand-dark tracking-tight leading-tight">
                Featured Programs & <br />
                Video Courses
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-normal">
                Our learning management system and course modules are undergoing technical platform updates and content enhancements to deliver a seamless learning experience.
              </p>
            </div>
          </div>

          {/* Coming Soon Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden bg-white rounded-[32px] border border-gray-100 p-8 sm:p-12 shadow-xl text-center"
          >
            {/* Subtle Ambient Glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              {/* Animated Icon Badge */}
              <div className="w-20 h-20 bg-brand-periwinkle rounded-3xl flex items-center justify-center mx-auto mb-6 text-brand-blue shadow-inner">
                <Clock size={36} className="animate-pulse" />
              </div>

              <span className="inline-block px-4 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200/60 mb-4">
                ✨ Technical Platform & Course System Updating
              </span>

              <h3 className="text-3xl sm:text-4xl font-extrabold text-brand-dark mb-4 tracking-tight">
                Courses Coming Soon!
              </h3>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8">
                We are currently upgrading the technical infrastructure and course platform alongside updated video lectures and study materials to deliver an enhanced, high-yield Prometric learning experience.
              </p>

              {/* Highlights Grid */}
              <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left">
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <BookOpen size={20} className="text-brand-blue mb-2" />
                  <h4 className="text-xs font-extrabold text-brand-dark mb-1">Updated Syllabus</h4>
                  <p className="text-[11px] text-gray-500 leading-snug">Newest guidelines & high-yield medical topics.</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <GraduationCap size={20} className="text-brand-blue mb-2" />
                  <h4 className="text-xs font-extrabold text-brand-dark mb-1">Expert Faculty</h4>
                  <p className="text-[11px] text-gray-500 leading-snug">Lessons recorded by certified specialist doctors.</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <CheckCircle2 size={20} className="text-brand-blue mb-2" />
                  <h4 className="text-xs font-extrabold text-brand-dark mb-1">100% Exam-Focused</h4>
                  <p className="text-[11px] text-gray-500 leading-snug">Designed specifically for first-attempt success.</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-extrabold text-brand-blue bg-brand-periwinkle/60 px-5 py-2.5 rounded-full">
                <Bell size={14} />
                <span>Stay tuned! New course enrollments will open shortly.</span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default Courses;
