import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  KeyRound, 
  User as UserIcon, 
  Mail, 
  LogOut, 
  Timer, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck,
  CheckCircle,
  Lock
} from 'lucide-react';

const API_BASE = 'http://localhost:3000/auth';
const ADMIN_API_BASE = 'http://localhost:3000/admin/auth';

interface UserProfile {
  id: string;
  mobileNumber: string;
  name: string | null;
  email: string | null;
  isProfileCompleted: boolean;
  createdAt: string;
  isAdmin?: boolean;
}

interface AdminProfile {
  id: string;
  username: string;
  mobileNumber: string;
  createdAt: string;
  isAdmin: boolean;
}

type Step = 'HOME' | 'PHONE' | 'OTP' | 'PROFILE' | 'DASHBOARD';
type AdminStep = 'LOGIN';

export default function App() {
  // Navigation & Common States
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [step, setStep] = useState<Step>('HOME');
  const [, setAdminStep] = useState<AdminStep>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // User States
  const [mobileNumber, setMobileNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);

  // Admin States
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminUser, setAdminUser] = useState<AdminProfile | null>(null);

  // OTP inputs state (shared for user OTP verification and admin reset OTP verification)
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check login status on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true' || urlParams.get('portal') === 'admin') {
      setIsAdminPortal(true);
      setAdminStep('LOGIN');
    }

    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token');

    if (adminToken) {
      checkAdminAuthStatus(adminToken);
    } else if (userToken) {
      checkUserAuthStatus(userToken);
    }
  }, []);

  // Handle countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const checkUserAuthStatus = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAdminPortal(false);
        if (userData.isProfileCompleted) {
          setStep('DASHBOARD');
        } else {
          setStep('PROFILE');
        }
      } else {
        localStorage.removeItem('token');
        setStep('HOME');
      }
    } catch (err) {
      console.error('User auth verification failed', err);
      localStorage.removeItem('token');
      setStep('HOME');
    } finally {
      setLoading(false);
    }
  };

  const checkAdminAuthStatus = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${ADMIN_API_BASE}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const adminData = await response.json();
        setAdminUser({ ...adminData, isAdmin: true });
        setIsAdminPortal(true);
        setStep('DASHBOARD');
      } else {
        localStorage.removeItem('adminToken');
        setIsAdminPortal(false);
        setStep('HOME');
      }
    } catch (err) {
      console.error('Admin auth verification failed', err);
      localStorage.removeItem('adminToken');
      setIsAdminPortal(false);
      setStep('HOME');
    } finally {
      setLoading(false);
    }
  };

  // --- USER AUTHENTICATION FLOW ---

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const trimmedPhone = mobileNumber.trim();
    if (!trimmedPhone.startsWith('+') || trimmedPhone.length < 8) {
      setError('Please enter a valid mobile number with country code (e.g. +919876543210).');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: trimmedPhone }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP.');
      }

      setInfo('An OTP has been sent to your WhatsApp number!');
      setStep('OTP');
      setResendTimer(30);
      setOtp(Array(6).fill(''));
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobileNumber.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP.');
      }

      setInfo('A fresh OTP has been sent via WhatsApp!');
      setResendTimer(30);
      setOtp(Array(6).fill(''));
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const otpCode = otp.join('');
    if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      setError('Please enter a valid 6-digit numeric OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: mobileNumber.trim(),
          otp: otpCode,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invalid or expired OTP.');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);

      if (data.isProfileCompleted) {
        setStep('DASHBOARD');
      } else {
        setStep('PROFILE');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete profile.');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      setStep('DASHBOARD');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // --- ADMIN AUTHENTICATION FLOW ---

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminUsername.trim() || !adminPassword.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${ADMIN_API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invalid username or password.');
      }

      localStorage.setItem('adminToken', data.token);
      setAdminUser({ ...data.admin, isAdmin: true });
      setStep('DASHBOARD');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // --- COMMON LOGOUT ---

  const handleLogout = () => {
    if (isAdminPortal) {
      localStorage.removeItem('adminToken');
      setAdminUser(null);
      setAdminPassword('');
      setAdminStep('LOGIN');
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setMobileNumber('');
      setName('');
      setEmail('');
      setStep('HOME');
    }
    setError(null);
    setInfo(null);
  };

  // OTP inputs key configurations
  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      otpRefs.current[5]?.focus();
    }
  };

  return (
    <div className="w-full min-h-screen text-zinc-100 flex flex-col bg-[#030712] relative font-inter">
      {step === 'HOME' ? (
        <div className="min-h-screen text-zinc-100 flex flex-col relative overflow-hidden w-full">
          {/* Background Ambient Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-emerald-950/20 blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[45rem] h-[45rem] rounded-full bg-amber-950/10 blur-[150px] pointer-events-none -z-10"></div>

          {/* Navigation Bar */}
          <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5 z-20">
            <div 
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => {
                setIsAdminPortal(!isAdminPortal);
                setAdminStep('LOGIN');
                setStep('PHONE');
                setError(null);
                setInfo(null);
              }}
            >
              <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">🏏</span>
              <span className="text-xl font-outfit font-bold tracking-wider text-zinc-100">GCG</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
              <a href="#about" className="hover:text-amber-500 transition-colors">About</a>
              <a href="#facilities" className="hover:text-amber-500 transition-colors">Facilities</a>
              <a href="#why-us" className="hover:text-amber-500 transition-colors">Why GCG</a>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setStep('PHONE')} 
                className="inline-flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 text-sm font-semibold rounded-xl active:scale-95 transition-all cursor-pointer h-12 px-6 select-none"
              >
                Sign In
              </button>
              <button 
                onClick={() => setStep('PHONE')} 
                className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold text-sm rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-amber-500/20 active:translate-y-0 active:scale-95 transition-all duration-200 h-12 px-6 cursor-pointer select-none"
              >
                Book Pitch
              </button>
            </div>
          </nav>

          {/* Hero Section */}
          <header className="flex-1 w-full max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-12 z-10">
            <div className="flex-1 flex flex-col items-start text-left max-w-xl">
              <div className="inline-flex items-center gap-2 bg-emerald-950/40 border border-emerald-900/30 text-emerald-500 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Now Open for Bookings
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-outfit font-bold tracking-tight text-zinc-100 leading-[1.1] mb-6">
                The Ultimate Arena for <span className="text-amber-500">Gentlemen</span>
              </h1>
              <p className="text-zinc-400 font-inter text-base md:text-lg leading-relaxed mb-8">
                Experience world-class turf pitches, automated bowling machines, floodlit night nets, and expert cricket training under one roof. GCG is built by professionals, for cricket lovers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => setStep('PHONE')} 
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-amber-500/20 active:translate-y-0 active:scale-95 transition-all duration-200 h-14 px-8 flex items-center justify-center text-base cursor-pointer select-none"
                >
                  Book Nets & Ground
                </button>
                <a 
                  href="#facilities" 
                  className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/50 rounded-xl transition-all h-14 px-8 flex items-center justify-center text-base cursor-pointer active:scale-95 select-none text-center"
                >
                  Explore Pitch
                </a>
              </div>
            </div>
            
            {/* Visual Callout Graphic */}
            <div className="flex-1 w-full max-w-md md:max-w-none relative flex justify-center">
              <div className="w-full aspect-[4/3] max-w-[440px] bg-zinc-900/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden backdrop-blur-xl group">
                <img 
                  src="/gcg_turf_ground.png" 
                  alt="Gentlemen Cricket Ground Turf Ground" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500 -z-10"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent -z-10"></div>
                
                <div className="flex justify-between items-start">
                  <span className="text-4xl">🏟️</span>
                  <span className="bg-emerald-950/70 text-emerald-400 border border-emerald-900/40 text-xs font-semibold px-2.5 py-1 rounded-md backdrop-blur-md">Live Status</span>
                </div>
                <div>
                  <h3 className="text-xl font-outfit font-bold text-zinc-100 mb-1">Gentlemen Cricket Ground</h3>
                  <p className="text-zinc-300 text-sm mb-4 font-inter">Pune, India</p>
                  <div className="flex items-center gap-6 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-zinc-400 text-xs uppercase tracking-wider mb-0.5 font-semibold font-inter">Grass Turf</p>
                      <p className="text-emerald-400 text-sm font-semibold">100% Professional</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs uppercase tracking-wider mb-0.5 font-semibold font-inter">Practice Nets</p>
                      <p className="text-amber-500 text-sm font-semibold">Automated Machine</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Facilities Section */}
          <section id="facilities" className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24 border-t border-white/5">
            <div className="text-center max-w-xl mx-auto mb-16">
              <h2 className="text-3xl font-outfit font-bold text-zinc-100 mb-4">Our Facilities</h2>
              <p className="text-zinc-400 font-inter">Equipped with state-of-the-art facilities designed to level up your game.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden flex flex-col hover:border-amber-500/30 hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src="/gcg_turf_ground.png" 
                    alt="Premium Turf Ground" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <span className="text-3xl mb-4 w-12 h-12 bg-zinc-950 flex items-center justify-center rounded-xl">🏟️</span>
                  <h3 className="text-lg font-outfit font-bold text-zinc-100 mb-2">Premium Turf Ground</h3>
                  <p className="text-zinc-400 font-inter text-sm leading-relaxed">Full-size cricket ground with professional grass pitch, excellent outfield, and high-intensity floodlights for night matches.</p>
                </div>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden flex flex-col hover:border-amber-500/30 hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src="/gcg_practice_nets.png" 
                    alt="Automated Nets" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <span className="text-3xl mb-4 w-12 h-12 bg-zinc-950 flex items-center justify-center rounded-xl">🏏</span>
                  <h3 className="text-lg font-outfit font-bold text-zinc-100 mb-2">Automated Nets</h3>
                  <p className="text-zinc-400 font-inter text-sm leading-relaxed">Practice with computerized bowling machines simulating spin, swing, and pace, ideal for solo players and net sessions.</p>
                </div>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden flex flex-col hover:border-amber-500/30 hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src="/gcg_academy_coaching.png" 
                    alt="Coaching Academy" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <span className="text-3xl mb-4 w-12 h-12 bg-zinc-950 flex items-center justify-center rounded-xl">🎓</span>
                  <h3 className="text-lg font-outfit font-bold text-zinc-100 mb-2">Coaching Academy</h3>
                  <p className="text-zinc-400 font-inter text-sm leading-relaxed">Learn technique and tactics under experienced coaches with video analysis tools to target your weak spots.</p>
                </div>
              </div>
            </div>
          </section>

          {/* GCG Footer */}
          <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500 font-inter">
            <p>© {new Date().getFullYear()} Gentlemen Cricket Ground. All rights reserved.</p>
            <p>Built with ❤️ for Indian Cricket</p>
          </footer>
        </div>
      ) : (
        /* OTHER SCREENS: LOGIN & DASHBOARD */
        <div className="min-h-screen text-zinc-100 flex flex-col items-center justify-center p-6 w-full relative overflow-hidden">
          <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

          {/* Common header */}
          <header className="mb-8 z-10 flex flex-col items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => {
                setIsAdminPortal(!isAdminPortal);
                setAdminStep('LOGIN');
                setError(null);
                setInfo(null);
              }}
            >
              <span className="text-3xl">🏏</span>
              <h1 className="text-2xl font-outfit font-bold tracking-wide text-zinc-100">
                {isAdminPortal ? 'GCG Admin Portal' : 'Gentlemen Cricket Ground'}
              </h1>
            </div>
          </header>

          <main className="w-full max-w-md z-10">
            {/* LOGGED IN VIEWS */}
            {step === 'DASHBOARD' && (
              <>
                {/* ADMIN DASHBOARD */}
                {isAdminPortal && adminUser ? (
                  <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col">
                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold px-2.5 py-1 bg-emerald-950/40 border border-emerald-900/30 rounded-full self-start mb-6">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Admin Session Active
                    </div>

                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/25 mb-4">
                        <ShieldCheck size={36} />
                      </div>
                      <h2 className="text-xl font-outfit font-bold text-zinc-100">Welcome, Admin!</h2>
                      <p className="text-xs text-amber-500 font-mono mt-1">ID: {adminUser.username}</p>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-xl flex flex-col">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold font-inter">Username</span>
                        <span className="text-sm font-medium text-zinc-200">{adminUser.username}</span>
                      </div>
                      <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-xl flex flex-col">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold font-inter">Admin WhatsApp</span>
                        <span className="text-sm font-medium text-zinc-200">{adminUser.mobileNumber}</span>
                      </div>
                      <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-xl flex flex-col">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold font-inter">Privilege</span>
                        <span className="text-sm font-semibold text-amber-500 font-inter">System Administrator</span>
                      </div>
                      <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-xl flex flex-col">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold font-inter">Database Link</span>
                        <span className="text-sm font-semibold text-emerald-500 font-inter">Connected & Healthy</span>
                      </div>
                    </div>

                    <button 
                      onClick={handleLogout} 
                      className="w-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/50 rounded-xl transition-all h-12 flex items-center justify-center gap-2 active:scale-95 select-none cursor-pointer text-sm font-semibold"
                    >
                      <LogOut size={18} />
                      Log Out Admin
                    </button>
                  </div>
                ) : (
                  /* USER DASHBOARD */
                  user && (
                    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col">
                      <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold px-2.5 py-1 bg-emerald-950/40 border border-emerald-900/30 rounded-full self-start mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {user.isAdmin ? 'Admin Session Active' : 'Logged In Securely'}
                      </div>

                      <div className="flex flex-col items-center text-center mb-6">
                        {user.isAdmin ? (
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/25 mb-4">
                            <ShieldCheck size={36} />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-700 flex items-center justify-center text-zinc-100 shadow-lg shadow-emerald-500/20 mb-4 font-bold text-xl uppercase">
                            {user.name ? user.name.slice(0, 2) : 'US'}
                          </div>
                        )}
                        <h2 className="text-xl font-outfit font-bold text-zinc-100">Welcome, {user.name || 'User'}!</h2>
                        <p className="text-xs text-emerald-500 mt-1 font-semibold">{user.mobileNumber}</p>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-xl flex flex-col">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold font-inter">Email Address</span>
                          <span className="text-sm font-medium text-zinc-200">{user.email || 'Not provided'}</span>
                        </div>
                        <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-xl flex flex-col">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold font-inter">User Account ID</span>
                          <span className="text-xs font-mono text-amber-500 overflow-hidden text-ellipsis">{user.id}</span>
                        </div>
                        <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-xl flex flex-col">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold font-inter">Joined Date</span>
                          <span className="text-sm font-medium text-zinc-200 font-inter">
                            {new Date(user.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-xl flex flex-col">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold font-inter">Verified Gateway</span>
                          <span className="text-sm font-semibold text-emerald-500 font-inter">WhatsApp Verified</span>
                        </div>
                        {user.isAdmin && (
                          <>
                            <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-xl flex flex-col">
                              <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold font-inter">Privilege Level</span>
                              <span className="text-sm font-semibold text-amber-500 font-inter">System Administrator</span>
                            </div>
                            <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-xl flex flex-col">
                              <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold font-inter">Database Status</span>
                              <span className="text-sm font-semibold text-emerald-500 font-inter">Healthy & Online</span>
                            </div>
                          </>
                        )}
                      </div>

                      <button 
                        onClick={handleLogout} 
                        className="w-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/50 rounded-xl transition-all h-12 flex items-center justify-center gap-2 active:scale-95 select-none cursor-pointer text-sm font-semibold"
                      >
                        <LogOut size={18} />
                        Logout {user.isAdmin ? 'Admin' : ''}
                      </button>
                    </div>
                  )
                )}
              </>
            )}

            {/* LOGIN SCREENS */}
            {step !== 'DASHBOARD' && (
              <div className="bg-zinc-900/90 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col">
                {isAdminPortal ? (
                  <>
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
                        <Lock size={24} />
                      </div>
                      <h2 className="text-xl font-outfit font-bold text-zinc-100">Admin Log In</h2>
                      <p className="text-xs text-zinc-400 mt-1 font-inter">Enter your credentials to access system telemetry.</p>
                    </div>

                    <form onSubmit={handleAdminLogin} className="space-y-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="adminUsername">Username</label>
                        <div className="relative">
                          <UserIcon className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                          <input
                            id="adminUsername"
                            type="text"
                            placeholder="admin"
                            value={adminUsername}
                            onChange={(e) => setAdminUsername(e.target.value)}
                            required
                            disabled={loading}
                            className="w-full h-12 bg-zinc-900/80 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-12 pr-4 text-sm text-zinc-100 placeholder-zinc-500 transition-all duration-200 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="adminPassword">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                          <input
                            id="adminPassword"
                            type="password"
                            placeholder="••••••••"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="w-full h-12 bg-zinc-900/80 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-12 pr-4 text-sm text-zinc-100 placeholder-zinc-500 transition-all duration-200 outline-none"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-950/30 border border-red-900/30 text-rose-500 text-xs p-3.5 rounded-xl flex items-center gap-2">
                          <AlertCircle size={16} />
                          <span className="font-semibold">{error}</span>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-amber-500/20 active:translate-y-0 active:scale-95 transition-all duration-200 h-12 flex items-center justify-center cursor-pointer select-none text-sm"
                      >
                        {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Login as Administrator'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setInfo(null);
                          setIsAdminPortal(false);
                          setStep('HOME');
                        }}
                        disabled={loading}
                        className="w-full text-zinc-500 hover:text-zinc-300 text-xs font-medium py-1 transition-colors mt-2 cursor-pointer"
                      >
                        Return to Homepage
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    {/* USER REGULAR OTP SCENARIO */}
                    {step === 'PHONE' && (
                      <>
                        <div className="flex flex-col items-center text-center mb-6">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                            <Phone size={24} />
                          </div>
                          <h2 className="text-xl font-outfit font-bold text-zinc-100">Welcome Back</h2>
                          <p className="text-xs text-zinc-400 mt-1 font-inter">Sign in with your mobile number to receive a secure WhatsApp OTP.</p>
                        </div>

                        <form onSubmit={handleSendOtp} className="space-y-6">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="mobile">Mobile Number</label>
                            <div className="relative">
                              <span className="absolute left-4 top-3 text-sm font-semibold text-zinc-400">+</span>
                              <input
                                id="mobile"
                                type="tel"
                                placeholder="919876543210"
                                value={mobileNumber.startsWith('+') ? mobileNumber.slice(1) : mobileNumber}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9]/g, '');
                                  setMobileNumber(val ? `+${val}` : '');
                                }}
                                required
                                disabled={loading}
                                className="w-full h-12 bg-zinc-900/80 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-8 pr-4 text-sm text-zinc-100 placeholder-zinc-500 transition-all duration-200 outline-none"
                              />
                            </div>
                            <small className="text-[11px] text-zinc-500 mt-1 font-inter">Include country code (e.g. 91 for India)</small>
                          </div>

                          {error && (
                            <div className="bg-red-950/30 border border-red-900/30 text-rose-500 text-xs p-3.5 rounded-xl flex items-center gap-2">
                              <AlertCircle size={16} />
                              <span className="font-semibold">{error}</span>
                            </div>
                          )}

                          <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-amber-500/20 active:translate-y-0 active:scale-95 transition-all duration-200 h-12 flex items-center justify-center cursor-pointer select-none text-sm"
                          >
                            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Send OTP via WhatsApp'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setError(null);
                              setInfo(null);
                              setStep('HOME');
                            }}
                            className="w-full text-zinc-500 hover:text-zinc-300 text-xs font-medium py-1 transition-colors mt-2 cursor-pointer"
                          >
                            Cancel and Go Back
                          </button>
                        </form>
                      </>
                    )}

                    {step === 'OTP' && (
                      <>
                        <div className="flex flex-col items-center text-center mb-6">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                            <KeyRound size={24} />
                          </div>
                          <h2 className="text-xl font-outfit font-bold text-zinc-100">Verify Code</h2>
                          <p className="text-xs text-zinc-400 mt-1 font-inter font-semibold">Enter the 6-digit code sent to WhatsApp: <strong className="text-zinc-200 font-mono">{mobileNumber}</strong></p>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                          <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                              <input
                                key={index}
                                ref={(el) => (otpRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                onPaste={handleOtpPaste}
                                disabled={loading}
                                className="w-11 h-12 bg-zinc-900/80 border border-zinc-800 text-center text-lg font-bold text-zinc-100 focus:border-amber-500 rounded-lg outline-none transition-all duration-200 focus:ring-1 focus:ring-amber-500"
                              />
                            ))}
                          </div>

                          {info && (
                            <div className="bg-emerald-950/30 border border-emerald-900/30 text-emerald-500 text-xs p-3.5 rounded-xl flex items-center gap-2">
                              <CheckCircle size={16} />
                              <span className="font-semibold">{info}</span>
                            </div>
                          )}

                          {error && (
                            <div className="bg-red-950/30 border border-red-900/30 text-rose-500 text-xs p-3.5 rounded-xl flex items-center gap-2">
                              <AlertCircle size={16} />
                              <span className="font-semibold">{error}</span>
                            </div>
                          )}

                          <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-amber-500/20 active:translate-y-0 active:scale-95 transition-all duration-200 h-12 flex items-center justify-center cursor-pointer select-none text-sm"
                          >
                            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Verify Code'}
                          </button>

                          <div className="flex flex-col items-center gap-3 mt-4">
                            {resendTimer > 0 ? (
                              <span className="text-zinc-500 text-xs flex items-center gap-1.5 font-inter">
                                <Timer size={14} />
                                Resend code in {resendTimer}s
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="text-amber-500 hover:text-amber-400 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Resend OTP on WhatsApp
                              </button>
                            )}
                            
                            <button
                              type="button"
                              onClick={() => setStep('PHONE')}
                              disabled={loading}
                              className="text-zinc-500 hover:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                            >
                              Change Mobile Number
                            </button>
                          </div>
                        </form>
                      </>
                    )}

                    {step === 'PROFILE' && (
                      <>
                        <div className="flex flex-col items-center text-center mb-6">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                            <UserIcon size={24} />
                          </div>
                          <h2 className="text-xl font-outfit font-bold text-zinc-100">Complete Profile</h2>
                          <p className="text-xs text-zinc-400 mt-1 font-inter">Tell us a bit about yourself to finish signing up.</p>
                        </div>

                        <form onSubmit={handleCompleteProfile} className="space-y-6">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="name">Full Name</label>
                            <div className="relative">
                              <UserIcon className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                              <input
                                id="name"
                                type="text"
                                placeholder="Virat Kohli"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full h-12 bg-zinc-900/80 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-12 pr-4 text-sm text-zinc-100 placeholder-zinc-500 transition-all duration-200 outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider" htmlFor="email">Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                              <input
                                id="email"
                                type="email"
                                placeholder="virat@cricket.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full h-12 bg-zinc-900/80 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-12 pr-4 text-sm text-zinc-100 placeholder-zinc-500 transition-all duration-200 outline-none"
                              />
                            </div>
                          </div>

                          {error && (
                            <div className="bg-red-950/30 border border-red-900/30 text-rose-500 text-xs p-3.5 rounded-xl flex items-center gap-2">
                              <AlertCircle size={16} />
                              <span className="font-semibold">{error}</span>
                            </div>
                          )}

                          <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-amber-500/20 active:translate-y-0 active:scale-95 transition-all duration-200 h-12 flex items-center justify-center cursor-pointer select-none text-sm"
                          >
                            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Complete Sign Up'}
                          </button>
                        </form>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
