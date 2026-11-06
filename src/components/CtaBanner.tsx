import React, { useState } from 'react';
import { motion } from 'motion/react';
import ConsultationModal from './ConsultationModal';

const CtaBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollToCourses = () => {
    const element = document.getElementById('courses');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-[36px] bg-brand-dark text-white p-10 sm:p-16 md:p-20 overflow-hidden shadow-2xl">
          
          {/* Geometric Starburst Graphic on Right */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none hidden md:flex items-center justify-end pr-10">
            <svg className="w-96 h-96 text-brand-blue" viewBox="0 0 200 200" fill="currentColor">
              <path d="M100 0 L115 85 L200 100 L115 115 L100 200 L85 115 L0 100 L85 85 Z" />
            </svg>
          </div>

          {/* Background Radial Glow */}
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-brand-blue/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl text-center mx-auto space-y-6">
            
            {/* Top Pill Label */}
            <span className="text-xs font-semibold text-gray-300 tracking-widest uppercase">
              (Prometric Licensing & Mock Test Prep)
            </span>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-[1.12]">
              Start Your Medical Exam Preparation Today
            </h2>

            <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto font-normal leading-relaxed">
              Take the first step toward your GCC medical license and career advancement with expert doctor guidance today.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button 
                onClick={scrollToCourses}
                className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-full border border-white/20 transition-all cursor-pointer"
              >
                Explore Mock Simulators
              </button>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-3.5 bg-white hover:bg-gray-100 text-brand-dark font-extrabold text-xs sm:text-sm rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                Book an Appointment
              </button>
            </div>

          </div>

        </div>

      </div>

      <ConsultationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default CtaBanner;
