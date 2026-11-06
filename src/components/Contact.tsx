import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, Send } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-4 py-1.5 bg-brand-gray rounded-full text-[10px] font-bold mb-4 uppercase tracking-wider">
              Contact Us
            </div>
            <h2 className="text-5xl mb-8">GET IN TOUCH WITH US</h2>
            <p className="text-gray-500 text-lg mb-12">
              Have questions about our courses or the licensing process? Our team is here to help you every step of the way.
            </p>

            <div className="space-y-8">
              <a href="tel:+919037384400" className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-brand-gray rounded-2xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Call Us</p>
                  <p className="text-xl font-bold group-hover:text-brand-blue transition-colors">+91 90373 84400</p>
                </div>
              </a>
              <a href="mailto:info.promedo@gmail.com" className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-brand-gray rounded-2xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Email Us</p>
                  <p className="text-xl font-bold group-hover:text-brand-blue transition-colors">info.promedo@gmail.com</p>
                </div>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-brand-gray p-10 rounded-[40px]"
          >
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue bg-white"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue bg-white"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue bg-white"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message</label>
                <textarea 
                  rows={4}
                  className="w-full px-6 py-4 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue bg-white"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              <button className="w-full btn-primary py-4 justify-center text-lg">
                Send Message
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
