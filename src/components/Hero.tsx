import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, GraduationCap, Star, Award, Tag, Brain, MessageSquare } from 'lucide-react';
import ConsultationModal from './ConsultationModal';

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToCourses = () => {
    const element = document.getElementById('courses');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-24 sm:pt-28 pb-12 bg-brand-blue overflow-hidden text-white">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />
      
      {/* Radial Background Light Glow */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Row */}
        <div className="grid lg:grid-cols-12 gap-10 items-center pt-4 sm:pt-6 pb-12">
          
          {/* Left Text Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6"
          >
          {/* Eyebrow Tagline */}
            <p className="text-white/80 text-sm font-medium tracking-wide uppercase">
             PREPARE FOR YOUR PROMETRIC JOURNEY            </p>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light font-display tracking-tight leading-[1.12]">
              Your Medical Licensing
 
            <br />
            Journey Starts with <br />
              <span className="text-white font-black underline decoration-white/40"> Promedo</span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-lg font-normal">
              Prepare confidently for Prometric exams with expert faculty, structured learning, and personalized guidance.
            </p>

            {/* Clean White Action CTA */}
            <div className="pt-2">
              <button 
                onClick={scrollToCourses}
                className="px-8 py-4 bg-white hover:bg-white/90 text-brand-dark font-extrabold text-sm rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                Get Started Now
              </button>
            </div>

            {/* Student Review Block Bottom-Left */}
            <div className="pt-8 flex items-center gap-4">
              {/* Avatars */}
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-brand-blue overflow-hidden bg-white">
                  <img src="https://picsum.photos/seed/std1/100/100" alt="Student" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-brand-blue overflow-hidden bg-white">
                  <img src="https://picsum.photos/seed/std2/100/100" alt="Student" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-brand-blue bg-brand-dark text-white font-bold text-xs flex items-center justify-center gap-0.5">
                  4.8 <Star size={10} fill="currentColor" className="text-white" />
                </div>
              </div>

              {/* Review Text */}
              <div>
                <p className="text-sm font-bold text-white">Student Review</p>
                <p className="text-xs text-white/80">Based on more than 10,000 feedbacks</p>
              </div>
            </div>

          </motion.div>

      {/* Right Column: Hero Student Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-6 relative flex justify-center items-center"
          >
            <div className="relative w-full max-w-lg aspect-[4/4.5]">
              {/* Main Doctor Image */}
              <img 
                src="./DocterImage.png" 
                alt="Medical Doctor Mentor" 
                className="w-full h-full object-cover object-top rounded-[40px] drop-shadow-2xl"
              />
            </div>
          </motion.div>

        </div>

        {/* Bottom Feature Card Bar (White Card Overlapping) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl text-gray-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
        >
          {/* Card 1: Best Mentors */}
          <div className="p-4 rounded-2xl flex flex-col justify-between space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Award size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Best Mentors</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Our top mentors bring valuable knowledge and experience to guide you on your journey.
              </p>
            </div>
          </div>

          {/* Card 2: Best Price */}
          <div className="bg-brand-blue p-6 rounded-[22px] flex flex-col justify-between space-y-3 text-white shadow-md">
            <div className="w-10 h-10 rounded-xl bg-white text-brand-blue flex items-center justify-center">
              <Tag size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white mb-1">Best Price</h3>
              <p className="text-xs text-white/90 font-medium leading-relaxed">
                We offer competitive pricing on all our mock test simulators, ensuring you receive the best value for money.
              </p>
            </div>
          </div>

          {/* Card 3: Easy to Learn */}
          <div className="p-4 rounded-2xl flex flex-col justify-between space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Brain size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Easy to Learn</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                With user-friendly navigation and engaging materials, you can dive into your studies hassle-free.
              </p>
            </div>
          </div>

          {/* Card 4: 1 to 1 Discussion */}
          <div className="p-4 rounded-2xl flex flex-col justify-between space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">1 to 1 Discussion</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Our 1-to-1 mentoring connects you with dedicated professionals for your success.
              </p>
            </div>
          </div>

        </motion.div>

      </div>

      <ConsultationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default Hero;
