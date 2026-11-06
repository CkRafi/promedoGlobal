import React from 'react';
import { motion } from 'motion/react';
import { Target, Rocket, ShieldCheck, HeartPulse } from 'lucide-react';

const VisionMission = () => {
  return (
    <section className="section-container py-24 bg-brand-gray/30">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Vision Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white p-10 md:p-16 rounded-[50px] shadow-sm border border-gray-100 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-brand-blue/20">
              <Target size={32} />
            </div>
            
            <h2 className="text-4xl font-bold mb-6 text-brand-dark">Our Vision</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              To become the most trusted global gateway for international medical professionals aspiring to practice in the GCC, by setting the highest standards in licensing examination preparation, dataflow verification, and end-to-end licensing support.
            </p>
            
            <div className="mt-10 flex items-center gap-3 text-brand-blue font-bold">
              <ShieldCheck size={20} />
              <span>Setting Global Standards</span>
            </div>
          </div>
        </motion.div>

        {/* Mission Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-brand-dark p-10 md:p-16 rounded-[50px] shadow-xl relative overflow-hidden group"
        >
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-tr-[100px] -ml-10 -mb-10 group-hover:scale-110 transition-transform duration-500"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-brand-dark mb-8 shadow-lg shadow-yellow-400/20">
              <Rocket size={32} />
            </div>
            
            <h2 className="text-4xl font-bold mb-6 text-white">Our Mission</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              To empower international medical professionals through comprehensive, doctor-led licensing examination preparation and end-to-end GCC licensing support. Promedo is committed to delivering globally accessible, high-quality study resources, personalized mentorship, and seamless assistance with dataflow verification, credentialing, and exam scheduling, enabling medical professionals to confidently achieve their GCC career goals.
            </p>
            
            <div className="mt-10 flex items-center gap-3 text-yellow-400 font-bold">
              <HeartPulse size={20} />
              <span>Empowering Medical Careers</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VisionMission;
