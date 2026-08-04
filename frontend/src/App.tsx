import React, { useState, useEffect } from 'react';

// Types
import { UserProfile, AdminProfile, Step } from './types/auth.types';
import { Ground } from './types/ground.types';

// Constants
import { API_BASE, ADMIN_API_BASE, GROUNDS_API_BASE } from './constants/config';
import { DEFAULT_SAMPLE_GROUNDS } from './constants/sampleGrounds';

// Components
import { Navbar } from './components/common/Navbar';
import { NotificationBanner } from './components/common/NotificationBanner';
import { Footer } from './components/common/Footer';

import { PhoneForm } from './components/auth/PhoneForm';
import { OtpVerificationForm } from './components/auth/OtpVerificationForm';
import { ProfileCompletionForm } from './components/auth/ProfileCompletionForm';
import { AdminLoginModal } from './components/auth/AdminLoginModal';

import { GroundGrid } from './components/grounds/GroundGrid';
import { GroundModal } from './components/grounds/GroundModal';
import { BookingModal } from './components/booking/BookingModal';

export default function App() {
  // Navigation & Common States
  const [step, setStep] = useState<Step>('HOME');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // User & Admin Profile States
  const [mobileNumber, setMobileNumber] = useState('+91');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [adminUser, setAdminUser] = useState<AdminProfile | null>(null);

  // OTP State
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(0);

  // Modals & Grounds State
  const [grounds, setGrounds] = useState<Ground[]>(DEFAULT_SAMPLE_GROUNDS);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showGroundModal, setShowGroundModal] = useState(false);
  const [editingGround, setEditingGround] = useState<Ground | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingGround, setBookingGround] = useState<Ground | null>(null);

  // Auto session restored on load & grounds fetch
  useEffect(() => {
    fetchGrounds();
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const adminToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminUser');

    if (adminToken && storedAdmin) {
      setAdminUser(JSON.parse(storedAdmin));
    } else if (token && storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      if (parsed.isProfileCompleted) {
        setStep('DASHBOARD');
      } else {
        setStep('PROFILE');
      }
    }
  }, []);

  // Timer for OTP resend countdown
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const fetchGrounds = async () => {
    try {
      const res = await fetch(GROUNDS_API_BASE);
      if (res.ok) {
        const data = await res.json();
        let fetchedList: Ground[] = Array.isArray(data) ? data : [];

        const combined = [...fetchedList];
        for (const sample of DEFAULT_SAMPLE_GROUNDS) {
          if (!combined.some((g) => g.name.toLowerCase() === sample.name.toLowerCase() || g.id === sample.id)) {
            combined.push(sample);
          }
        }

        const normalized = combined.map((g) => ({
          ...g,
          timeSlots:
            g.timeSlots && g.timeSlots.length >= 2
              ? g.timeSlots
              : [g.timeSlots?.[0] || '7:00 AM - 10:30 AM', g.timeSlots?.[1] || '2:30 PM - 5:50 PM'],
        }));

        setGrounds(normalized);
      } else {
        setGrounds(DEFAULT_SAMPLE_GROUNDS);
      }
    } catch (err) {
      console.error('Using default sample grounds:', err);
      setGrounds(DEFAULT_SAMPLE_GROUNDS);
    }
  };

  // User Auth Flow
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let formattedPhone = mobileNumber.trim();
    if (/^\d{10}$/.test(formattedPhone)) {
      formattedPhone = `+91${formattedPhone}`;
      setMobileNumber(formattedPhone);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
      setMobileNumber(formattedPhone);
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: formattedPhone }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStep('OTP');
      setResendTimer(30);
      setInfo(`Verification code sent to ${formattedPhone}`);
    } catch (err: any) {
      setError(err.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, otp: otpCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid OTP code');
      }

      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      if (data.user.isProfileCompleted) {
        setStep('DASHBOARD');
      } else {
        setStep('PROFILE');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please login again.');
      setStep('PHONE');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setStep('DASHBOARD');
      setInfo('Profile completed successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin Login Flow
  const handleAdminLogin = async (username: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid admin credentials');
      }

      localStorage.setItem('adminToken', data.accessToken);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
      setAdminUser(data.admin);
      setShowAdminModal(false);
      setInfo(`Welcome Admin (${data.admin.username})!`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGround = async (payload: any) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

    // Update local state for immediate responsiveness
    setGrounds((prev) => {
      if (editingGround) {
        return prev.map((g) => (g.id === editingGround.id ? { ...g, ...payload } : g));
      } else {
        const newId = 'ground-' + Date.now();
        return [{ id: newId, createdAt: new Date().toISOString(), ...payload }, ...prev];
      }
    });

    try {
      if (editingGround && !editingGround.id.startsWith('ground-sample-')) {
        await fetch(`${GROUNDS_API_BASE}/${editingGround.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else if (!editingGround) {
        await fetch(GROUNDS_API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      setShowGroundModal(false);
      setInfo(editingGround ? 'Ground details updated successfully!' : 'New ground added successfully!');
      fetchGrounds();
    } catch (err) {
      console.warn('Backend update failed, using local update:', err);
      setShowGroundModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setAdminUser(null);
    setStep('HOME');
    setInfo('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
      <Navbar
        user={user}
        adminUser={adminUser}
        onLogout={handleLogout}
        onOpenAdminLogin={() => setShowAdminModal(true)}
      />

      <NotificationBanner error={error} info={info} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'HOME' && !user && !adminUser && (
          <div className="space-y-12">
            <PhoneForm
              mobileNumber={mobileNumber}
              setMobileNumber={setMobileNumber}
              loading={loading}
              onSendOtp={handleSendOtp}
              onOpenAdminModal={() => setShowAdminModal(true)}
            />
            <GroundGrid
              grounds={grounds}
              isAdmin={Boolean(adminUser || user?.isAdmin)}
              onBook={(g) => {
                setBookingGround(g);
                setShowBookingModal(true);
              }}
              onEdit={(g) => {
                setEditingGround(g);
                setShowGroundModal(true);
              }}
              onAddGround={() => {
                setEditingGround(null);
                setShowGroundModal(true);
              }}
            />
          </div>
        )}

        {step === 'OTP' && (
          <OtpVerificationForm
            mobileNumber={mobileNumber}
            otp={otp}
            setOtp={setOtp}
            loading={loading}
            resendTimer={resendTimer}
            onVerifyOtp={handleVerifyOtp}
            onResendOtp={() => {}}
            onBack={() => setStep('HOME')}
          />
        )}

        {step === 'PROFILE' && (
          <ProfileCompletionForm
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            loading={loading}
            onSubmit={handleProfileSubmit}
          />
        )}

        {(step === 'DASHBOARD' || user || adminUser) && (
          <GroundGrid
            grounds={grounds}
            isAdmin={Boolean(adminUser)}
            onBook={(g) => {
              setBookingGround(g);
              setShowBookingModal(true);
            }}
            onEdit={(g) => {
              setEditingGround(g);
              setShowGroundModal(true);
            }}
            onAddGround={() => {
              setEditingGround(null);
              setShowGroundModal(true);
            }}
          />
        )}
      </main>

      {/* ADMIN LOGIN MODAL */}
      {showAdminModal && (
        <AdminLoginModal
          loading={loading}
          onClose={() => setShowAdminModal(false)}
          onAdminLogin={handleAdminLogin}
          onRequestResetOtp={async () => {}}
        />
      )}

      {/* GROUND EDIT / CREATE MODAL */}
      {showGroundModal && (
        <GroundModal
          editingGround={editingGround}
          loading={loading}
          onClose={() => setShowGroundModal(false)}
          onSave={handleSaveGround}
        />
      )}

      {/* BOOKING MODAL WITH 30-DAY CALENDAR */}
      {showBookingModal && bookingGround && (
        <BookingModal
          ground={bookingGround}
          onClose={() => setShowBookingModal(false)}
          onConfirmBooking={() => {}}
        />
      )}

      <Footer />
    </div>
  );
}
