import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, GraduationCap, FileText, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const carouselItems = [
  {
    id: 1,
    title: "Free GP Prometric Mock Test",
    description: "Test your knowledge with our realistic mock examination designed by experts.",
    cta: "Start Free Test",
    link: "/mock-test",
    icon: <FileText className="text-brand-blue" size={24} />,
    bgColor: "bg-blue-50",
    isLive: true,
  },
  {
    id: 2,
    title: "Latest Prometric Exam Updates",
    description: "Stay informed about the latest changes in exam patterns and registration dates.",
    cta: "View Updates",
    link: "/updates",
    icon: <Bell className="text-orange-500" size={24} />,
    bgColor: "bg-orange-50",
    isHot: true,
  },
  {
    id: 3,
    title: "Join Our Full Coaching Program",
    description: "Get comprehensive guidance and structured preparation for your medical career.",
    cta: "Enroll Now",
    link: "/#courses",
    icon: <GraduationCap className="text-emerald-500" size={24} />,
    bgColor: "bg-emerald-50",
  }
];

const TopCarousel = () => {
  // Duplicate items to ensure seamless loop
  const marqueeItems = [...carouselItems, ...carouselItems];

  return (
    <div className="relative w-full bg-white border-b border-gray-100 overflow-hidden mt-20 py-4">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
          whileHover={{ animationPlayState: "paused" }}
          style={{ display: 'flex', alignItems: 'center' }}
          className="flex items-center gap-12 px-6"
        >
          {marqueeItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex items-center gap-6 group">
              <div className="flex items-center gap-4">
                <div className={`flex w-10 h-10 ${item.bgColor} rounded-full items-center justify-center flex-shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    {item.isLive ? (
                      <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase animate-pulse">
                        <span className="w-1 h-1 bg-white rounded-full"></span>
                        Live
                      </span>
                    ) : item.isHot ? (
                      <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Hot</span>
                    ) : (
                      <span className="bg-brand-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">New</span>
                    )}
                    <span className="font-bold text-sm md:text-base">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {item.description}
                  </span>
                </div>
              </div>
              
              <Link 
                to={item.link}
                className="flex items-center gap-2 text-xs md:text-sm font-bold text-brand-blue hover:underline"
              >
                {item.cta}
                <ArrowRight size={16} />
              </Link>
              
              {/* Divider between items */}
              <div className="h-8 w-px bg-gray-100 ml-6"></div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TopCarousel;
