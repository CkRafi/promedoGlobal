import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const Features = () => {
  const services = [
    {
      number: '001',
      title: 'Individual Therapy & GP Prep',
      description: 'Work one-on-one with licensed medical mentors to address exam challenges, clinical knowledge gaps, and high-yield Prometric topics in a structured space.',
    },
    {
      number: '002',
      title: 'Pediatrics & Family Medicine',
      description: 'Master core relationship cases, pediatric guidelines, and family medicine protocols through structured, supportive practice modules.',
    },
    {
      number: '003',
      title: 'Hospital & Institutional Prep',
      description: 'We design and deliver medical licensing access, workshops, and team accreditation programs tailored to healthcare institutions.',
    },
    {
      number: '004',
      title: 'Psychiatric & Internal Medicine',
      description: 'Comprehensive diagnostic case reviews, clinical scenario breakdowns, and rationale-guided exam supervision from active doctors.',
    },
    {
      number: '005',
      title: 'Online Tele-Coaching',
      description: 'Book virtual coaching sessions with your preferred specialist mentor — from anywhere, on any device. Flexible, private, and secure.',
    },
    {
      number: '006',
      title: 'Stress & Burnout Management',
      description: 'Specialized study scheduling and resilience programs for high-pressure doctors, students, and practitioners facing tight exam deadlines.',
    },
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section with Title Left and Description Right */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <h2 className="text-4xl sm:text-5xl font-black font-display text-brand-dark tracking-tight leading-tight">
              Medical Services You <br className="hidden sm:inline" />
              Can Rely On
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-normal">
              Comprehensive healthcare solutions and specialized licensing prep designed to keep you and your medical career thriving at every stage.
            </p>
          </div>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="bg-[#F8F9FE] hover:bg-white rounded-[28px] p-8 border border-gray-100 hover:border-brand-blue/20 hover:shadow-xl hover:shadow-brand-blue/5 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Star Icon & Number */}
                <div className="flex items-center justify-between mb-8">
                  <div className="w-9 h-9 rounded-xl bg-white group-hover:bg-brand-blue group-hover:text-white text-brand-dark flex items-center justify-center shadow-2xs border border-gray-100 transition-colors">
                    <Sparkles size={16} className="fill-current" />
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-400 tracking-wider">
                    {item.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-extrabold text-brand-dark mb-3 group-hover:text-brand-blue transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-xs leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
