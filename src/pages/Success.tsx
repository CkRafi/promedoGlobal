import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const Success = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  const courseId = searchParams.get('courseId');
  const sessionId = searchParams.get('session_id') || searchParams.get('payment_id') || 'pay_verified_success';

  useEffect(() => {
    const enrollUser = async () => {
      if (!user || !courseId) return;

      try {
        const cleanCourseId = courseId.replace('mock-', '');
        // Check if already enrolled
        const q = query(
          collection(db, 'enrollments'), 
          where('userId', '==', user.uid), 
          where('courseId', '==', cleanCourseId)
        );
        const snap = await getDocs(q);
        
        if (snap.empty) {
          await addDoc(collection(db, 'enrollments'), {
            userId: user.uid,
            courseId: cleanCourseId,
            mocktestId: courseId.startsWith('mock-') ? cleanCourseId : null,
            status: 'paid',
            enrolledAt: new Date().toISOString(),
            progress: 0,
            sessionId: sessionId
          });
        }
        
        setStatus('success');
      } catch (err) {
        console.error("Enrollment error:", err);
        setStatus('error');
      }
    };

    if (user) {
      enrollUser();
    } else {
      setStatus('success');
    }
  }, [user, courseId, sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-brand-blue mb-4" size={48} />
        <h2 className="text-2xl font-bold">Verifying Purchase...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[40px] border border-gray-100 p-12 shadow-2xl text-center"
      >
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-4xl mb-4">Purchase Successful!</h1>
        <p className="text-gray-500 mb-10">
          Thank you for your purchase. You are now enrolled in the course and can start learning immediately.
        </p>
        
        <button 
          onClick={() => {
            if (courseId?.startsWith('mock-')) {
              navigate(`/mock-test/${courseId.replace('mock-', '')}`);
            } else {
              navigate(`/player/${courseId}`);
            }
          }}
          className="w-full btn-primary py-4 justify-center text-lg group cursor-pointer"
        >
          {courseId?.startsWith('mock-') ? 'Launch Exam Simulator' : 'Start Learning'}
          <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
};

export default Success;
