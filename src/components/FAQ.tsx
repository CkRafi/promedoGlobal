import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQProps {
  faqs?: { q: string; a: string; }[];
}

const FAQ = ({ faqs: customFaqs }: FAQProps) => {
  const [openIndex, setOpenIndex] = useState(1);

  const defaultFaqs = [
    { 
      q: 'What courses does Promedo offer?', 
      a: 'Promedo offers comprehensive GCC licensing examination preparation for General Practitioner doctors, including DHA, MOH, DOH, OMSB, QCHP, KMLE, and SMLE.' 
    },
    { 
      q: 'How can I join Promedo?', 
      a: 'You can join Promedo by signing up on our platform or contacting us via WhatsApp to enroll in your desired licensing exam preparation program.' 
    },
    { 
      q: 'What is the learning mode?', 
      a: 'Promedo provides globally accessible, structured, and exam-focused online learning supported by high-quality study materials and mentorship from doctors who have recently cleared these exams.' 
    },
    { 
      q: 'How long are the courses?', 
      a: 'Course duration varies based on the selected licensing exam and individual study plan.' 
    },
    { 
      q: 'Do you provide study materials?', 
      a: 'Yes, Promedo provides comprehensive, high-quality study materials specifically tailored to GCC licensing examinations.' 
    },
  ];

  const displayFaqs = customFaqs || defaultFaqs;

  return (
    <section className="section-container">
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 bg-brand-gray rounded-full text-[10px] font-bold mb-4 uppercase tracking-wider">
          Frequently Asked Questions
        </div>
        <h2 className="text-5xl mb-6">Your Questions, Answered</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Explore the answers to frequently asked questions about our platform and learning experience.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {displayFaqs.map((faq, i) => (
          <div 
            key={i} 
            className={`rounded-3xl border border-gray-100 transition-all ${openIndex === i ? 'bg-brand-gray' : 'bg-white'}`}
          >
            <button 
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="w-full px-8 py-6 flex items-center justify-between text-left"
            >
              <span className="text-xl font-bold">{faq.q}</span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${openIndex === i ? 'bg-brand-blue text-white' : 'text-gray-400'}`}>
                {openIndex === i ? <Minus size={20} /> : <Plus size={20} />}
              </div>
            </button>
            {openIndex === i && (
              <div className="px-8 pb-8 text-gray-500 leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
