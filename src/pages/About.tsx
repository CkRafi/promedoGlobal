import React from 'react';
import { motion } from 'motion/react';
import { Play, ArrowUpRight } from 'lucide-react';
import Contact from '../components/Contact';

const About = () => {
  return (
    <div className="min-h-screen bg-white pt-0 pb-24">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-brand-dark mb-6"
        >
          Discover our <span className="text-gray-400">Promedo</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto text-gray-500 text-lg md:text-xl leading-relaxed"
        >
          Unleash the full potential of medical exam preparation with Promedo. Organize, 
          prepare, and achieve more with ease.
        </motion.p>
      </div>

      {/* Hero Card Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative aspect-[16/9] md:aspect-[21/9] rounded-[40px] overflow-hidden shadow-2xl group"
        >
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2000" 
            alt="Doctor working on computer" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
          
          {/* Large Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-white text-7xl md:text-[12rem] font-bold opacity-90 select-none tracking-tighter">
              Promedo
            </h2>
          </div>

          {/* Play Button Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:scale-110 transition-transform duration-300">
              <Play fill="currentColor" size={32} className="ml-1" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Content Section - About & Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <div className="grid md:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-brand-dark mb-6">About Promedo</h3>
            <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
              <p>
                Promedo is an educational platform designed to help healthcare professionals prepare for international medical qualification exams. We provide structured study materials, expert guidance, and high-quality mock tests to support effective exam preparation.
              </p>
              <p>
                Our platform simplifies learning by offering well-organized resources, allowing students to access courses, practice tests, and essential study materials in one place.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-brand-dark mb-6">Our Story</h3>
            <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
              <p>
                Promedo was founded by Dr. Muhammed Saleem C.K with a vision to make preparation for international medical licensing exams simpler, more structured, and accessible for healthcare professionals.
              </p>
              <p>
                Today, it supports healthcare professionals preparing for exams such as DHA, HAAD, MOH, SMLE, OMSB, QCHP, KMLE, and NHRA, helping them build confidence and move closer to their global medical careers.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Team Section - "The Faces of Innovation" */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-brand-dark mb-6"
            >
              The Faces of <span className="text-gray-400">Innovation</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 text-lg"
            >
              Meet the visionary leadership driving the future of medical education at Promedo.
            </motion.p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-brand-blue text-white px-8 py-3 rounded-full font-medium text-sm"
          >
            View all
          </motion.button>
        </div>

        {/* Founder Card Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Founder Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group"
          >
            <div className="bg-[#F5F5F7] rounded-[32px] overflow-hidden mb-6 aspect-[4/5] relative">
              <img 
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=1000" 
                alt="Dr. Muhammed Saleem C.K" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-6 right-6">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-dark shadow-lg group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300">
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold text-brand-dark mb-1">Dr. Muhammed Saleem C.K</h4>
              <p className="text-gray-500 text-sm">Founder & Visionary</p>
            </div>
          </motion.div>

          {/* Placeholder cards to match the UI style grid */}
          <div className="hidden md:block opacity-40">
            <div className="bg-[#F5F5F7] rounded-[32px] aspect-[4/5] mb-6 flex items-center justify-center">
              <span className="text-gray-300 font-medium">Coming Soon</span>
            </div>
          </div>
          <div className="hidden md:block opacity-40">
            <div className="bg-[#F5F5F7] rounded-[32px] aspect-[4/5] mb-6 flex items-center justify-center">
              <span className="text-gray-300 font-medium">Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Founder Vision Text */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-10 bg-[#F5F5F7] rounded-[40px]"
        >
          <h3 className="text-2xl font-bold text-brand-dark mb-6">Founder's Vision</h3>
          <p className="text-gray-600 text-lg leading-relaxed mb-8 italic">
            "Dr. Saleem envisions Promedo as a platform that empowers doctors with the right knowledge, guidance, and preparation tools needed to confidently pursue medical careers across different countries."
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-brand-blue rounded-full mt-2.5 flex-shrink-0"></div>
              <p className="text-gray-600">Simplify the preparation process for international medical licensing exams</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-brand-blue rounded-full mt-2.5 flex-shrink-0"></div>
              <p className="text-gray-600">Provide structured and accessible learning resources for doctors</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-brand-blue rounded-full mt-2.5 flex-shrink-0"></div>
              <p className="text-gray-600">Support medical professionals in achieving their global career aspirations</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-brand-blue rounded-full mt-2.5 flex-shrink-0"></div>
              <p className="text-gray-600">Help doctors successfully navigate the path toward working in GCC systems</p>
            </div>
          </div>
        </motion.div>
      </div>
      <Contact />
    </div>
  );
};

export default About;
