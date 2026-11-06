import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Bell, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Contact from '../components/Contact';

const updates = [
  {
    id: 1,
    date: "March 15, 2024",
    title: "New GP Prometric Exam Pattern Announced",
    description: "The exam pattern for general practitioners has been updated to include more clinical scenarios and ethical questions.",
    category: "Exam Pattern",
  },
  {
    id: 2,
    date: "March 10, 2024",
    title: "Registration Open for Q2 2024 Examinations",
    description: "Candidates can now register for the upcoming second quarter examinations through the official portal.",
    category: "Registration",
  },
  {
    id: 3,
    date: "March 05, 2024",
    title: "Updated Dataflow Verification Guidelines",
    description: "Important changes to the primary source verification process for international medical graduates.",
    category: "Verification",
  }
];

const Updates = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 mb-24">
        <Link to="/" className="inline-flex items-center gap-2 text-brand-blue font-bold mb-8 hover:underline">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
        
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
            <Bell size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Latest Prometric Updates</h1>
            <p className="text-gray-500">Stay up to date with the latest exam news</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {updates.map((update) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-wider">
                  <Calendar size={14} />
                  {update.date}
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {update.category}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-blue transition-colors">
                {update.title}
              </h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                {update.description}
              </p>
              
              <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
                Read More
                <ChevronRight size={16} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Contact />
    </div>
  );
};

export default Updates;
