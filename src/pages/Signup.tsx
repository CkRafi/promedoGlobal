import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { recordCandidateLogin, EXAM_OPTIONS } from '../lib/userLogins';
import { 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  GraduationCap, 
  Award,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Phone,
  Lock
} from 'lucide-react';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [examPreparingFor, setExamPreparingFor] = useState('DHA (Dubai Health Authority)');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [domainCopied, setDomainCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const redirectTarget = location.state?.from || '/dashboard';
  const customMessage = location.state?.message;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please agree to the Terms & Conditions to create an account.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number to complete registration.');
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please make sure both passwords match.');
      return;
    }
    setError('');
    setLoading(true);

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const selectedExam = examPreparingFor.trim() || 'DHA (Dubai Health Authority)';

    // Cache to localStorage first for instant availability during auth state changes
    try {
      localStorage.setItem('promedo_user_phone', normalizedPhone);
      localStorage.setItem('promedo_user_name', trimmedName || 'Doctor');
      localStorage.setItem('promedo_user_exam', selectedExam);
    } catch (_) {}

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const isBootstrapAdmin = normalizedEmail === 'live.rafick@gmail.com';
      const role = isBootstrapAdmin ? 'admin' : 'user';
      const now = new Date().toISOString();

      if (trimmedName) {
        try {
          await updateProfile(userCredential.user, { displayName: trimmedName });
        } catch (profileErr) {
          console.warn('Could not set displayName on auth user:', profileErr);
        }
      }
      
      // All data provided during sign-up saved to Firestore users/{uid}
      const userPayload = {
        uid: userCredential.user.uid,
        name: trimmedName || 'Doctor',
        email: normalizedEmail,
        phone: normalizedPhone,
        examPreparingFor: selectedExam,
        role,
        termsAgreed: true,
        termsAgreedAt: now,
        authProvider: 'email_password',
        createdAt: now,
        updatedAt: now,
        photoURL: '',
        mockTestsTaken: 0,
        questionsAttempted: 0,
        averageScore: 0,
        bestScore: 0
      };

      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), userPayload, { merge: true });
      } catch (firestoreErr) {
        console.error("Firestore error saving user document:", firestoreErr);
        handleFirestoreError(firestoreErr, OperationType.WRITE, `users/${userCredential.user.uid}`);
      }

      // Also record candidate profile in userLogins directory for admin tracking
      try {
        await recordCandidateLogin({
          name: trimmedName || 'Candidate Doctor',
          phone: normalizedPhone,
          email: normalizedEmail,
          examPreparingFor: selectedExam,
          source: 'Candidate Portal Registration'
        });
      } catch (logErr) {
        console.warn('Could not record candidate registration entry:', logErr);
      }

      // Backup to localStorage for instant synchronous availability
      try {
        localStorage.setItem('promedo_user_phone', normalizedPhone);
        localStorage.setItem('promedo_user_name', trimmedName || 'Doctor');
        localStorage.setItem('promedo_user_exam', selectedExam);
      } catch (_) {}
      
      navigate(redirectTarget);
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        const now = new Date().toISOString();
        const isBootstrapAdmin = user.email?.toLowerCase() === 'live.rafick@gmail.com';
        const role = isBootstrapAdmin ? 'admin' : 'user';
        const trimmedName = (user.displayName || name.trim() || 'Doctor');
        const userEmail = (user.email || email.trim()).toLowerCase();
        const userPhone = user.phoneNumber || phone.trim() || '';
        const selectedExam = examPreparingFor.trim() || 'DHA (Dubai Health Authority)';
        
        if (!userSnap.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            name: trimmedName,
            email: userEmail,
            phone: userPhone,
            examPreparingFor: selectedExam,
            role,
            termsAgreed: true,
            termsAgreedAt: now,
            authProvider: 'google',
            createdAt: now,
            updatedAt: now,
            photoURL: user.photoURL || '',
            mockTestsTaken: 0,
            questionsAttempted: 0,
            averageScore: 0,
            bestScore: 0
          }, { merge: true });
        } else {
          // If user doc exists but phone was provided now and was empty, update it
          const existing = userSnap.data();
          if (!existing?.phone && userPhone) {
            await setDoc(userDocRef, { phone: userPhone, updatedAt: now }, { merge: true });
          }
        }

        try {
          await recordCandidateLogin({
            name: trimmedName,
            phone: userPhone,
            email: userEmail,
            examPreparingFor: selectedExam,
            source: 'Google Auth Registration'
          });
        } catch (logErr) {
          console.warn('Could not record google candidate registration entry:', logErr);
        }

        if (userPhone) {
          try {
            localStorage.setItem('promedo_user_phone', userPhone);
          } catch (_) {}
        }
      }

      navigate(redirectTarget);
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        console.warn('Firebase domain authorization required for Google Auth. Hostname:', window.location.hostname);
        setUnauthorizedDomain(window.location.hostname);
        setError('');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was cancelled.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site or sign up with email.');
      } else {
        console.error('Google signup error:', err);
        setError(err.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page-root min-h-screen bg-slate-50 flex flex-col lg:flex-row items-stretch justify-center w-full">
      {/* Left Visual Branding Pane (Desktop / Tablet / Mobile) */}
      <div className="auth-desktop-hero auth-hero-banner bg-gradient-to-br from-[#1b2b65] via-[#243b82] to-[#3853a4] text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Ambient Glow Blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Navigation */}
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-white text-brand-blue rounded-2xl flex items-center justify-center font-extrabold shadow-md group-hover:scale-105 transition-transform">
                <Sparkles size={20} className="text-brand-blue fill-brand-blue" />
              </div>
              <span className="text-2xl font-display font-extrabold tracking-tight text-white">Promedo</span>
            </Link>

            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition-colors backdrop-blur-sm"
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Core Promedo Value Proposition */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-bold tracking-wide uppercase mb-4 backdrop-blur-sm">
              <ShieldCheck size={14} className="text-emerald-300" />
              <span>Create Your Account</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-extrabold tracking-tight text-white leading-tight mb-4 font-display">
              Start Your Journey with Promedo
            </h1>

            <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed mb-6 font-normal">
              Your Trusted Partner for a Successful GCC Licensing Journey
            </p>

            {/* Medical Pillars List */}
            <div className="hidden sm:flex flex-col gap-3 my-6">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/95">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>One-to-One Mentorship by Doctors</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/95">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>Reliable Study Materials, Fast-Track Study Plans & Recall Updates</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/95">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>DataFlow & CHSI (China) Verification Assistance</span>
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm text-white/95">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>All Your Licensing Needs — One Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Medical Authorities & Proof */}
        <div className="relative z-10 pt-6 mt-6 border-t border-white/15">
          <p className="text-blue-200/90 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Award size={14} className="text-amber-300" />
            <span>Accredited GCC Medical Authorities</span>
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
            <span className="px-3 py-1 rounded-xl bg-white/15 text-white border border-white/20 backdrop-blur-xs">
              DHA (Dubai)
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/15 text-white border border-white/20 backdrop-blur-xs">
              HAAD / DOH (Abu Dhabi)
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/15 text-white border border-white/20 backdrop-blur-xs">
              SMLE (Saudi Arabia)
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/15 text-white border border-white/20 backdrop-blur-xs">
              OMSB (Oman)
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/15 text-white border border-white/20 backdrop-blur-xs">
              NHRA (Bahrain)
            </span>
            <span className="px-3 py-1 rounded-xl bg-white/15 text-white border border-white/20 backdrop-blur-xs">
              MOH (UAE)
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3 text-xs text-blue-100/80">
            <GraduationCap size={16} className="text-blue-200" />
            <span>98.4% First-Attempt Pass Rate</span>
          </div>
        </div>
      </div>

      {/* Right Side Form Pane */}
      <div className="auth-desktop-form flex-1 bg-white flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Form Header */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-display mb-2">
              Create your account
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Start your journey with Promedo to pass your healthcare licensing exams.
            </p>
          </div>

          {customMessage && (
            <div className="bg-blue-50 text-brand-blue p-3.5 rounded-2xl text-xs font-semibold mb-6 flex items-center gap-2.5 border border-blue-100">
              <Sparkles size={16} className="shrink-0 text-brand-blue" />
              <span>{customMessage}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-3.5 rounded-2xl text-xs font-semibold mb-6 flex items-start gap-2.5 border border-red-200">
              <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Firebase Domain Authorization Guidance Banner */}
          {unauthorizedDomain && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left text-xs">
              <div className="flex items-start gap-2.5 mb-2.5">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Firebase Domain Authorization Required</h4>
                  <p className="text-amber-700 mt-1 leading-relaxed">
                    Google OAuth popups require this container domain to be added to Authorized Domains in your Firebase Console project (<span className="font-mono font-bold text-amber-900 bg-amber-100/80 px-1 py-0.5 rounded">promedo-5ff5b</span>).
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-amber-200 flex items-center justify-between gap-2 mt-2 shadow-2xs">
                <code className="text-[11px] font-mono font-bold text-gray-800 truncate select-all">
                  {unauthorizedDomain}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(unauthorizedDomain);
                    setDomainCopied(true);
                    setTimeout(() => setDomainCopied(false), 2500);
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shrink-0 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {domainCopied ? (
                    <>
                      <Check size={12} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy Domain</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 pt-2.5 border-t border-amber-200/70 text-amber-800 space-y-1 text-[11px]">
                <p className="font-bold text-amber-900">How to authorize in 3 steps:</p>
                <ol className="list-decimal list-inside space-y-1 pl-0.5 text-amber-900/90">
                  <li>
                    Open{' '}
                    <a
                      href="https://console.firebase.google.com/project/promedo-5ff5b/authentication/settings"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-bold text-brand-blue hover:text-blue-700 inline-flex items-center gap-0.5"
                    >
                      Firebase Console Settings <ExternalLink size={10} />
                    </a>
                  </li>
                  <li>Scroll to <strong>Authorized domains</strong> and click <strong>Add domain</strong></li>
                  <li>Paste the copied domain above and save</li>
                </ol>
              </div>

              <div className="mt-3 pt-2.5 border-t border-amber-200/70 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-medium text-amber-800">Register right now:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('live.rafick@gmail.com');
                    setName('Dr. Rafick');
                    const passInput = document.getElementById('signup-password') as HTMLInputElement;
                    passInput?.focus();
                  }}
                  className="text-[11px] font-bold text-brand-blue hover:text-blue-700 bg-white hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer shadow-2xs transition-colors"
                >
                  Use live.rafick@gmail.com
                </button>
              </div>
            </div>
          )}

          {/* Google Authentication via Firebase */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="auth-action-btn w-full py-3.5 px-4 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-2xl text-xs sm:text-sm font-bold text-gray-800 transition-all flex items-center justify-center gap-3 shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-70"
          >
            {googleLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center my-6 gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Or with email
            </span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input-element w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 placeholder-gray-400 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all"
                placeholder="Dr. John Smith"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input 
                id="signup-email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input-element w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 placeholder-gray-400 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all"
                placeholder="doctor@example.com"
                required
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-500" />
                  Phone Number
                </label>
                <span className="text-[10px] text-gray-400 font-semibold normal-case">
                  With country code
                </span>
              </div>
              <div className="relative">
                <input 
                  id="signup-phone"
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="auth-input-element w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 placeholder-gray-400 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all"
                  placeholder="+971 50 123 4567 or +966..."
                  required
                />
              </div>
            </div>

            {/* Target Licensing Exam Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <GraduationCap size={13} className="text-gray-500" />
                Target Licensing Exam
              </label>
              <select 
                id="signup-exam"
                value={examPreparingFor}
                onChange={(e) => setExamPreparingFor(e.target.value)}
                className="auth-input-element w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all cursor-pointer"
              >
                <option value="DHA (Dubai Health Authority)">DHA - Dubai Health Authority</option>
                <option value="HAAD / DOH (Abu Dhabi Health Authority)">HAAD / DOH - Abu Dhabi Department of Health</option>
                <option value="MOHAP (UAE Ministry of Health)">MOHAP - UAE Ministry of Health & Prevention</option>
                <option value="SMLE (Saudi Medical Licensing Exam)">SMLE - Saudi Commission (SCFHS)</option>
                <option value="OMSB (Oman Medical Specialty Board)">OMSB - Oman Medical Specialty Board</option>
                <option value="QCHP (Qatar Prometric Exam)">QCHP / DHP - Qatar Council</option>
                <option value="NHRA (Bahrain Health Regulatory Authority)">NHRA - Bahrain Regulatory Authority</option>
                <option value="GP Prometric (General Practice)">GP Prometric (General Practice)</option>
                <option value="Nursing Prometric">Nursing Prometric Licensure</option>
                <option value="Dental Prometric">Dental Prometric</option>
                <option value="Other">Other Medical Licensing Exam</option>
              </select>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock size={13} className="text-gray-500" />
                Password
              </label>
              <div className="relative">
                <input 
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input-element w-full px-4 py-3 pr-11 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 placeholder-gray-400 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all"
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={13} className="text-gray-500" />
                  Confirm Password
                </label>
                {confirmPassword.length > 0 && (
                  <span className={`text-[11px] font-bold flex items-center gap-1 ${
                    password === confirmPassword ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        Passwords match
                      </>
                    ) : (
                      <>
                        <AlertCircle size={12} className="text-red-500" />
                        Passwords do not match
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <input 
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`auth-input-element w-full px-4 py-3 pr-11 bg-white border rounded-2xl text-sm font-medium text-gray-800 placeholder-gray-400 outline-none transition-all ${
                    confirmPassword.length > 0 
                      ? password === confirmPassword
                        ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
                        : 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/15'
                      : 'border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15'
                  }`}
                  placeholder="Re-enter your password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input 
                type="checkbox" 
                id="terms-signup"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-brand-blue border-gray-300 focus:ring-brand-blue cursor-pointer"
              />
              <label htmlFor="terms-signup" className="text-xs text-gray-600 font-medium cursor-pointer select-none">
                I agree to the <span className="font-bold text-brand-blue underline">Terms of Service</span> and <span className="font-bold text-brand-blue underline">Privacy Policy</span>.
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || googleLoading}
              className="auth-action-btn w-full py-3.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-brand-blue/25 active:scale-[0.99] cursor-pointer mt-3 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Promedo Account</span>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-600 font-medium">
              Already have an account?{' '}
              <Link 
                to="/login" 
                state={{ from: redirectTarget, message: customMessage }} 
                className="text-brand-blue font-bold hover:underline"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
