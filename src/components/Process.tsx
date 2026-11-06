import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CalendarCheck, Sparkles, ArrowRight } from 'lucide-react';
import ConsultationModal from './ConsultationModal';

const Process = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = [
    {
      step: "1",
      icon: <ShieldCheck size={18} className="text-brand-blue" />,
      title: "Select Your Exam Simulator",
      desc: "Explore DHA, HAAD, MOH, and SMLE licensing mock test simulators tailored for general practitioners.",
    },
    {
      step: "2",
      icon: <CalendarCheck size={18} className="text-brand-blue" />,
      title: "Practice Real Simulations",
      desc: "Experience timed Computer-Based Testing with authentic clinical case questions and instant rationales.",
    },
    {
      step: "3",
      icon: <Sparkles size={18} className="text-brand-blue" />,
      title: "Pass on First Attempt",
      desc: "Analyze diagnostic performance reports and conquer your GP Prometric licensing exam with confidence.",
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-[#F8F9FE] to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <h2 className="text-4xl sm:text-5xl font-black font-display text-brand-dark tracking-tight leading-tight">
              Simple Steps To <br />
              Your Medical Journey
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-normal">
              Meet our dedicated team of healthcare professionals and follow our streamlined 3-step process to get started today.
            </p>
          </div>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {steps.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="relative bg-white rounded-[28px] p-8 border border-gray-100/80 shadow-xs hover:shadow-xl hover:border-brand-blue/20 transition-all duration-300 group flex flex-col justify-between overflow-hidden"
            >
              {/* Huge Background Number */}
              <div className="absolute top-2 right-4 text-7xl font-black font-display text-gray-100 select-none pointer-events-none group-hover:text-brand-periwinkle transition-colors">
                {item.step}
              </div>

              <div className="relative z-10">
                {/* Icon Pill */}
                <div className="w-9 h-9 rounded-xl bg-brand-periwinkle flex items-center justify-center mb-6 shadow-2xs">
                  {item.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-extrabold text-brand-dark mb-3 group-hover:text-brand-blue transition-colors">
                  {item.title}
                </h3>

                {/* Desc */}
                <p className="text-gray-500 text-xs leading-relaxed font-normal mb-8">
                  {item.desc}
                </p>
              </div>

              {/* Action Link */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="relative z-10 flex items-center gap-2 text-xs font-bold text-brand-dark hover:text-brand-blue transition-colors group/btn cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>

            </motion.div>
          ))}
        </div>

        {/* Centered Get Started Button */}
        <div className="text-center">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-4 bg-brand-blue hover:bg-brand-blue/95 text-white font-extrabold text-sm rounded-full shadow-lg shadow-brand-blue/20 transition-all hover:scale-105 cursor-pointer flex items-center gap-2 mx-auto"
          >
            <CalendarCheck size={18} />
            <span>Book an Appointment</span>
          </button>
        </div>

      </div>

      <ConsultationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default Process;
