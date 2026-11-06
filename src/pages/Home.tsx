import React from 'react';
import { motion } from 'motion/react';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Faculty from '../components/Faculty';
import Process from '../components/Process';
import Courses from '../components/Courses';
import Testimonials from '../components/Testimonials';
import CtaBanner from '../components/CtaBanner';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';

const scrollBlendBlurVariants = {
  initial: { 
    opacity: 0, 
    y: 50, 
    filter: 'blur(16px)',
    scale: 0.98
  },
  whileInView: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    scale: 1
  },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const Home = () => {
  return (
    <div className="min-h-screen overflow-x-hidden relative bg-[#FAFAFC]">
      
      {/* Scroll Ambient Background Blend & Blur Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-brand-blue/10 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute top-3/4 left-1/3 w-96 h-96 bg-cyan-400/10 rounded-full blur-[120px] mix-blend-multiply" />
      </div>

      <div className="relative z-10">
        <Hero />
        
        <motion.div {...scrollBlendBlurVariants}>
          <Stats />
        </motion.div>

        <motion.div {...scrollBlendBlurVariants}>
          <Faculty />
        </motion.div>

        <motion.div {...scrollBlendBlurVariants}>
          <Process />
        </motion.div>

        <motion.div {...scrollBlendBlurVariants}>
          <Courses />
        </motion.div>

        <motion.div {...scrollBlendBlurVariants}>
          <Testimonials />
        </motion.div>

        <motion.div {...scrollBlendBlurVariants}>
          <CtaBanner />
        </motion.div>

        <motion.div {...scrollBlendBlurVariants}>
          <FAQ />
        </motion.div>

        <motion.div {...scrollBlendBlurVariants}>
          <Contact />
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
