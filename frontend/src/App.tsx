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
  Plus,
  Edit3,
  Trash2,
  MapPin,
  Clock,
  X,
  Building,
  PhoneCall
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

interface Ground {
  id: string;
  name: string;
  address: string;
  mapLocationUrl?: string;
  description: string;
  images: string[];
  weekdayPrice: number;
  weekendPrice: number;
  timeSlots: string[];
  hasParking: boolean;
  hasCharging: boolean;
  hasFirstAid: boolean;
  hasDugout: boolean;
  hasWashroom: boolean;
  hasChangingRoom: boolean;
  contactName: string;
  contactPhone: string;
  rules: string;
  createdAt: string;
}

type Step = 'HOME' | 'PHONE' | 'OTP' | 'PROFILE' | 'DASHBOARD';

export default function App() {
  // Navigation & Common States
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [step, setStep] = useState<Step>('HOME');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // User States
  const [mobileNumber, setMobileNumber] = useState('+91');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);

  // Admin States
  const [adminUser, setAdminUser] = useState<AdminProfile | null>(null);

  // Cricket Grounds State
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [showGroundModal, setShowGroundModal] = useState(false);
  const [editingGround, setEditingGround] = useState<Ground | null>(null);

  // Ground Form Inputs
  const [gName, setGName] = useState('');
  const [gAddress, setGAddress] = useState('');
  const [gMapUrl, setGMapUrl] = useState('');
  const [gDescription, setGDescription] = useState('');
  const [gImageUrl, setGImageUrl] = useState('');
  const [gWeekdayPrice, setGWeekdayPrice] = useState(1500);
  const [gWeekendPrice, setGWeekendPrice] = useState(2500);
  const [gContactName, setGContactName] = useState('');
  const [gContactPhone, setGContactPhone] = useState('+91');
  const [gRules, setGRules] = useState('');
  const [gHasParking, setGHasParking] = useState(true);
  const [gHasCharging, setGHasCharging] = useState(true);
  const [gHasFirstAid, setGHasFirstAid] = useState(true);
  const [gHasDugout, setGHasDugout] = useState(true);
  const [gHasWashroom, setGHasWashroom] = useState(true);
  const [gHasChangingRoom, setGHasChangingRoom] = useState(true);

  // OTP inputs state (shared for user OTP verification and admin reset OTP verification)
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fetchGrounds = async () => {
    try {
      const res = await fetch('http://localhost:3000/grounds');
      if (res.ok) {
        const data = await res.json();
        setGrounds(data);
      }
    } catch (err) {
      console.error('Failed to fetch grounds:', err);
    }
  };

  const handleOpenGroundModal = (ground?: Ground) => {
    setError(null);
    if (ground) {
      setEditingGround(ground);
      setGName(ground.name);
      setGAddress(ground.address);
      setGMapUrl(ground.mapLocationUrl || '');
      setGDescription(ground.description);
      setGImageUrl(ground.images ? ground.images.join(', ') : '');
      setGWeekdayPrice(ground.weekdayPrice);
      setGWeekendPrice(ground.weekendPrice);
      setGContactName(ground.contactName);
      setGContactPhone(ground.contactPhone);
      setGRules(ground.rules);
      setGHasParking(ground.hasParking);
      setGHasCharging(ground.hasCharging);
      setGHasFirstAid(ground.hasFirstAid);
      setGHasDugout(ground.hasDugout);
      setGHasWashroom(ground.hasWashroom);
      setGHasChangingRoom(ground.hasChangingRoom);
    } else {
      setEditingGround(null);
      setGName('');
      setGAddress('');
      setGMapUrl('');
      setGDescription('');
      setGImageUrl('');
      setGWeekdayPrice(1500);
      setGWeekendPrice(2500);
      setGContactName('');
      setGContactPhone('+91');
      setGRules('Standard ground rules apply. Respect timings and wear non-marking shoes.');
      setGHasParking(true);
      setGHasCharging(true);
      setGHasFirstAid(true);
      setGHasDugout(true);
      setGHasWashroom(true);
      setGHasChangingRoom(true);
    }
    setShowGroundModal(true);
  };

  const handleSaveGround = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (gName.trim().length < 3) {
      setError('Ground Name must be at least 3 characters long');
      return;
    }

    if (!gAddress.trim() || !gDescription.trim() || !gContactName.trim()) {
      setError('Please fill in all required fields (Name, Address, Description, Contact Name)');
      return;
    }

    let contactPhoneFormatted = gContactPhone.trim();
    if (/^\d{10}$/.test(contactPhoneFormatted)) {
      contactPhoneFormatted = `+91${contactPhoneFormatted}`;
    } else if (!contactPhoneFormatted.startsWith('+')) {
      contactPhoneFormatted = `+${contactPhoneFormatted}`;
    }

    if (!/^\+?[1-9]\d{7,14}$/.test(contactPhoneFormatted)) {
      setError('Contact Phone must be a valid mobile number (e.g. +919876543210 or 9876543210)');
      return;
    }

    if (gWeekdayPrice < 0 || gWeekendPrice < 0) {
      setError('Slot pricing cannot be negative');
      return;
    }

    if (gMapUrl.trim() && !/^https?:\/\//i.test(gMapUrl.trim())) {
      setError('Google Maps link must start with http:// or https://');
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token) {
      setError('Admin authorization token missing');
      setLoading(false);
      return;
    }

    const payload = {
      name: gName,
      address: gAddress,
      mapLocationUrl: gMapUrl,
      description: gDescription,
      images: gImageUrl ? gImageUrl.split(',').map(s => s.trim()).filter(Boolean) : [],
      weekdayPrice: Number(gWeekdayPrice),
      weekendPrice: Number(gWeekendPrice),
      contactName: gContactName,
      contactPhone: contactPhoneFormatted,
      rules: gRules,
      hasParking: gHasParking,
      hasCharging: gHasCharging,
      hasFirstAid: gHasFirstAid,
      hasDugout: gHasDugout,
      hasWashroom: gHasWashroom,
      hasChangingRoom: gHasChangingRoom,
    };

    try {
      const url = editingGround 
        ? `http://localhost:3000/grounds/${editingGround.id}` 
        : 'http://localhost:3000/grounds';
      const method = editingGround ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save ground details');
      }

      setShowGroundModal(false);
      setInfo(editingGround ? 'Ground details updated successfully!' : 'New ground created successfully!');
      fetchGrounds();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGround = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ground?')) return;
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:3000/grounds/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setInfo('Ground deleted successfully');
        fetchGrounds();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check login status on mount
  useEffect(() => {
    fetchGrounds();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true' || urlParams.get('portal') === 'admin') {
      setIsAdminPortal(true);
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
        if (userData.isAdmin) {
          setIsAdminPortal(true);
          setAdminUser({
            id: userData.id,
            username: userData.name || 'Admin',
            mobileNumber: userData.mobileNumber,
            createdAt: userData.createdAt,
            isAdmin: true,
          });
        }
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

    let trimmedPhone = mobileNumber.trim();
    if (/^\d{10}$/.test(trimmedPhone)) {
      trimmedPhone = `+91${trimmedPhone}`;
    } else if (!trimmedPhone.startsWith('+')) {
      trimmedPhone = `+${trimmedPhone}`;
    }

    if (trimmedPhone.length < 10) {
      setError('Please enter a valid mobile number (e.g. +919876543210 or 9876543210).');
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

      if (data.user?.isAdmin) {
        localStorage.setItem('adminToken', data.token);
        setAdminUser({
          id: data.user.id,
          username: data.user.name || 'Admin',
          mobileNumber: data.user.mobileNumber,
          createdAt: data.user.createdAt,
          isAdmin: true,
        });
        setIsAdminPortal(true);
      }

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

  // --- COMMON LOGOUT ---

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    setUser(null);
    setAdminUser(null);
    setIsAdminPortal(false);
    setMobileNumber('+91');
    setName('');
    setEmail('');
    setStep('HOME');
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

          <main className={`w-full ${step === 'DASHBOARD' ? 'max-w-4xl' : 'max-w-md'} z-10 transition-all duration-300`}>
            {/* LOGGED IN VIEWS */}
            {step === 'DASHBOARD' && (
              <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 font-bold text-xl uppercase ${
                      (adminUser || user?.isAdmin)
                        ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-zinc-950 shadow-amber-500/25'
                        : 'bg-gradient-to-tr from-emerald-600 to-emerald-700 text-zinc-100 shadow-emerald-500/20'
                    }`}>
                      {(adminUser || user?.isAdmin) ? <ShieldCheck size={32} /> : (user?.name ? user.name.slice(0, 2) : 'US')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold px-2.5 py-0.5 bg-emerald-950/40 border border-emerald-900/30 rounded-full w-fit mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {(adminUser || user?.isAdmin) ? 'Admin Session Active' : 'WhatsApp Verified User'}
                      </div>
                      <h2 className="text-xl font-outfit font-bold text-zinc-100">
                        Welcome, {(adminUser ? adminUser.username : (user?.name || 'Cricketer'))}!
                      </h2>
                      <p className="text-xs text-zinc-400 font-inter">
                        Mobile: {adminUser ? adminUser.mobileNumber : user?.mobileNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {(adminUser || user?.isAdmin) && (
                      <button
                        onClick={() => handleOpenGroundModal()}
                        className="flex-1 md:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer select-none"
                      >
                        <Plus size={18} />
                        Add Cricket Ground
                      </button>
                    )}
                    <button 
                      onClick={handleLogout} 
                      className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm font-semibold"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                </div>

                {/* Alerts */}
                {info && (
                  <div className="bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 text-xs p-4 rounded-2xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} />
                      <span className="font-semibold">{info}</span>
                    </div>
                    <button onClick={() => setInfo(null)} className="text-emerald-400 hover:text-emerald-200 cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>
                )}

                {error && (
                  <div className="bg-red-950/40 border border-red-900/40 text-rose-400 text-xs p-4 rounded-2xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span className="font-semibold">{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200 cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* CRICKET GROUNDS SECTION */}
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-outfit font-bold text-zinc-100 flex items-center gap-2">
                        <Building size={20} className="text-amber-500" />
                        Available Cricket Grounds ({grounds.length})
                      </h3>
                      <p className="text-xs text-zinc-400 font-inter mt-1">Browse grounds, check 3-hour fixed slot prices, facilities, and contact details.</p>
                    </div>
                  </div>

                  {grounds.length === 0 ? (
                    <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                      <Building className="text-zinc-600 mb-3" size={40} />
                      <p className="text-zinc-300 text-sm font-semibold mb-1">No Cricket Grounds Available Yet</p>
                      <p className="text-zinc-500 text-xs mb-4 font-inter">Ground details added by administrators will appear here.</p>
                      {(adminUser || user?.isAdmin) && (
                        <button
                          onClick={() => handleOpenGroundModal()}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Plus size={14} />
                          Add First Ground
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {grounds.map((g) => (
                        <div key={g.id} className="bg-zinc-950/60 border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-500/30 transition-all duration-200">
                          <div>
                            {/* Photo Banner */}
                            <div className="h-44 bg-zinc-900 relative overflow-hidden">
                              <img 
                                src={g.images && g.images.length > 0 ? g.images[0] : '/gcg_box_cricket.png'} 
                                alt={g.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/gcg_box_cricket.png';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                              
                              {(adminUser || user?.isAdmin) && (
                                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                                  <button
                                    onClick={() => handleOpenGroundModal(g)}
                                    className="p-2 bg-zinc-900/80 hover:bg-amber-500 text-zinc-200 hover:text-zinc-950 rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-lg"
                                    title="Edit Ground"
                                  >
                                    <Edit3 size={15} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteGround(g.id)}
                                    className="p-2 bg-zinc-900/80 hover:bg-rose-600 text-zinc-200 hover:text-white rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-lg"
                                    title="Delete Ground"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              )}

                              <div className="absolute bottom-3 left-3 right-3">
                                <h4 className="text-base font-outfit font-bold text-zinc-100">{g.name}</h4>
                                <p className="text-xs text-zinc-400 font-inter flex items-center gap-1 mt-0.5">
                                  <MapPin size={12} className="text-amber-500 shrink-0" />
                                  <span className="truncate">{g.address}</span>
                                </p>
                              </div>
                            </div>

                            <div className="p-4 space-y-4 text-xs font-inter">
                              {/* Map Location Link */}
                              {g.mapLocationUrl && (
                                <a 
                                  href={g.mapLocationUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="inline-flex items-center gap-1.5 text-amber-400 hover:underline text-xs font-semibold"
                                >
                                  <MapPin size={12} />
                                  Open Google Maps Location ↗
                                </a>
                              )}

                              <p className="text-zinc-400 text-xs leading-relaxed">{g.description}</p>

                              {/* 3-Hour Fixed Pricing */}
                              <div className="bg-zinc-900/80 border border-white/5 rounded-xl p-3 grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Weekday (3 Hrs)</span>
                                  <span className="text-sm font-bold text-emerald-400">₹{g.weekdayPrice}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Weekend (3 Hrs)</span>
                                  <span className="text-sm font-bold text-amber-400">₹{g.weekendPrice}</span>
                                </div>
                              </div>

                              {/* Facilities Badges */}
                              <div>
                                <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-2">Available Facilities</span>
                                <div className="flex flex-wrap gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 border ${g.hasParking ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' : 'bg-zinc-900/40 text-zinc-600 border-zinc-800 line-through'}`}>
                                    🅿️ Parking {g.hasParking ? '✓' : '✗'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 border ${g.hasCharging ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' : 'bg-zinc-900/40 text-zinc-600 border-zinc-800 line-through'}`}>
                                    ⚡ Charging {g.hasCharging ? '✓' : '✗'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 border ${g.hasFirstAid ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' : 'bg-zinc-900/40 text-zinc-600 border-zinc-800 line-through'}`}>
                                    🩹 First Aid {g.hasFirstAid ? '✓' : '✗'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 border ${g.hasDugout ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' : 'bg-zinc-900/40 text-zinc-600 border-zinc-800 line-through'}`}>
                                    🏏 Dugout {g.hasDugout ? '✓' : '✗'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 border ${g.hasWashroom ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' : 'bg-zinc-900/40 text-zinc-600 border-zinc-800 line-through'}`}>
                                    🚻 Washroom {g.hasWashroom ? '✓' : '✗'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 border ${g.hasChangingRoom ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' : 'bg-zinc-900/40 text-zinc-600 border-zinc-800 line-through'}`}>
                                    👕 Changing Room {g.hasChangingRoom ? '✓' : '✗'}
                                  </span>
                                </div>
                              </div>

                              {/* Responsible Person */}
                              <div className="bg-zinc-900/50 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <PhoneCall size={14} className="text-amber-500" />
                                  <div>
                                    <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Responsible Person</span>
                                    <span className="text-xs font-semibold text-zinc-200">{g.contactName}</span>
                                  </div>
                                </div>
                                <span className="text-xs font-mono text-amber-400">{g.contactPhone}</span>
                              </div>

                              {/* Rules */}
                              <div className="bg-zinc-900/30 p-2.5 rounded-xl border border-white/5">
                                <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-1">Ground Rules</span>
                                <p className="text-[11px] text-zinc-400 whitespace-pre-line leading-relaxed">{g.rules}</p>
                              </div>

                              {/* Action for regular users */}
                              {!(adminUser || user?.isAdmin) && (
                                <button 
                                  onClick={() => alert(`Booking flow for ${g.name} - Select 3-Hour Slot`)}
                                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                                >
                                  <Clock size={14} />
                                  Book 3-Hour Slot
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* UNIFIED OTP LOGIN SCREENS */}
            {step !== 'DASHBOARD' && (
              <div className="bg-zinc-900/90 backdrop-blur-3xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col">
                {step === 'PHONE' && (
                  <>
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                        <Phone size={24} />
                      </div>
                      <h2 className="text-xl font-outfit font-bold text-zinc-100">Welcome to GCG</h2>
                      <p className="text-xs text-zinc-400 mt-1 font-inter">Enter your mobile number to receive a secure 6-digit WhatsApp OTP.</p>
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
                            className="w-full h-12 bg-zinc-900/80 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-8 pr-4 text-sm text-zinc-100 placeholder-zinc-500 transition-all duration-200 outline-none font-mono"
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
                        Return to Homepage
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
                  </div>
                )}
          </main>
        </div>
      )}

      {/* ADD / EDIT CRICKET GROUND MODAL */}
      {showGroundModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto">
            <button
              onClick={() => setShowGroundModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-100 p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                <Building size={20} />
              </div>
              <div>
                <h3 className="text-lg font-outfit font-bold text-zinc-100">
                  {editingGround ? 'Edit Cricket Ground' : 'Add New Cricket Ground'}
                </h3>
                <p className="text-xs text-zinc-400 font-inter">Enter ground details, map location, 3-hour fixed slot prices, and facilities.</p>
              </div>
            </div>

            <form onSubmit={handleSaveGround} className="space-y-5 font-inter text-xs">
              {/* Ground Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-zinc-300 uppercase tracking-wider">Ground Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Gentlemen Turf Stadium, Drive-In Road"
                  value={gName}
                  onChange={(e) => setGName(e.target.value)}
                  required
                  className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none"
                />
              </div>

              {/* Address & Map URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-zinc-300 uppercase tracking-wider">Address *</label>
                  <input
                    type="text"
                    placeholder="e.g. Plot 42, Sports Complex, SG Highway"
                    value={gAddress}
                    onChange={(e) => setGAddress(e.target.value)}
                    required
                    className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-zinc-300 uppercase tracking-wider">Google Maps Link</label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/?q=..."
                    value={gMapUrl}
                    onChange={(e) => setGMapUrl(e.target.value)}
                    className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-zinc-300 uppercase tracking-wider">Description *</label>
                <textarea
                  rows={3}
                  placeholder="Describe ground dimensions, grass quality, night floodlights, etc."
                  value={gDescription}
                  onChange={(e) => setGDescription(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-sm text-zinc-100 outline-none"
                />
              </div>

              {/* Ground Photos */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-zinc-300 uppercase tracking-wider">Ground Photo URLs (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                  value={gImageUrl}
                  onChange={(e) => setGImageUrl(e.target.value)}
                  className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none"
                />
              </div>

              {/* Fixed 3-Hour Slot Pricing */}
              <div className="bg-zinc-950/60 p-4 rounded-2xl border border-white/5 space-y-3">
                <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider block">Fixed 3-Hour Slot Pricing</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-zinc-300">Weekday Price (₹ / 3 Hrs) *</label>
                    <input
                      type="number"
                      min={0}
                      value={gWeekdayPrice}
                      onChange={(e) => setGWeekdayPrice(Number(e.target.value))}
                      required
                      className="w-full h-11 bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-zinc-300">Weekend Price (₹ / 3 Hrs) *</label>
                    <input
                      type="number"
                      min={0}
                      value={gWeekendPrice}
                      onChange={(e) => setGWeekendPrice(Number(e.target.value))}
                      required
                      className="w-full h-11 bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Facilities Checkboxes */}
              <div className="bg-zinc-950/60 p-4 rounded-2xl border border-white/5 space-y-3">
                <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider block">Facilities Available</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={gHasParking}
                      onChange={(e) => setGHasParking(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span>🅿️ Parking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={gHasCharging}
                      onChange={(e) => setGHasCharging(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span>⚡ Charging Points</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={gHasFirstAid}
                      onChange={(e) => setGHasFirstAid(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span>🩹 First Aid Kit</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={gHasDugout}
                      onChange={(e) => setGHasDugout(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span>🏏 Dugout</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={gHasWashroom}
                      onChange={(e) => setGHasWashroom(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span>🚻 Washroom</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={gHasChangingRoom}
                      onChange={(e) => setGHasChangingRoom(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span>👕 Changing Room</span>
                  </label>
                </div>
              </div>

              {/* Contact Person Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-zinc-300 uppercase tracking-wider">Responsible Person Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={gContactName}
                    onChange={(e) => setGContactName(e.target.value)}
                    required
                    className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-zinc-300 uppercase tracking-wider">Contact Phone *</label>
                  <input
                    type="tel"
                    placeholder="e.g. +919876543210"
                    value={gContactPhone}
                    onChange={(e) => setGContactPhone(e.target.value)}
                    required
                    className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none"
                  />
                </div>
              </div>

              {/* Rules */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-zinc-300 uppercase tracking-wider">Ground Rules & Regulations *</label>
                <textarea
                  rows={3}
                  placeholder="1. Spike shoes not allowed&#10;2. Arrive 15 mins prior to slot&#10;3. No smoking"
                  value={gRules}
                  onChange={(e) => setGRules(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-sm text-zinc-100 outline-none"
                />
              </div>

              {error && (
                <div className="bg-red-950/30 border border-red-900/30 text-rose-500 p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowGroundModal(false)}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : (editingGround ? 'Update Ground Details' : 'Save & Publish Ground')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
