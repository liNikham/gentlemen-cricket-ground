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
  Activity
} from 'lucide-react';

const API_BASE = 'http://localhost:3000/auth';

interface UserProfile {
  id: string;
  mobileNumber: string;
  name: string | null;
  email: string | null;
  isProfileCompleted: boolean;
  createdAt: string;
}

type Step = 'PHONE' | 'OTP' | 'PROFILE' | 'DASHBOARD';

export default function App() {
  const [step, setStep] = useState<Step>('PHONE');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus(token);
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

  const checkAuthStatus = async (token: string) => {
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
        if (userData.isProfileCompleted) {
          setStep('DASHBOARD');
        } else {
          setStep('PROFILE');
        }
      } else {
        localStorage.removeItem('token');
        setStep('PHONE');
      }
    } catch (err) {
      console.error('Auth verification failed', err);
      // Keep offline or reset on error
      localStorage.removeItem('token');
      setStep('PHONE');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    // Basic validation: must start with + and country code
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
      // Clear OTP inputs
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setMobileNumber('');
    setName('');
    setEmail('');
    setStep('PHONE');
    setError(null);
    setInfo(null);
  };

  // OTP Inputs handling
  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    // Take only the last character if typed
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
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
    <div className="app-container">
      {/* Background ambient glows */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <header className="app-header">
        <div className="logo-area">
          <span className="logo-icon">🏏</span>
          <h1 className="logo-title">Gentlemen Cricket Ground</h1>
        </div>
      </header>

      <main className="main-content">
        {step === 'PHONE' && (
          <div className="glass-card fade-in">
            <div className="card-header">
              <div className="icon-container">
                <Phone className="header-icon" />
              </div>
              <h2>Welcome back</h2>
              <p>Sign in using your mobile number to receive a secure OTP on WhatsApp.</p>
            </div>

            <form onSubmit={handleSendOtp} className="auth-form">
              <div className="input-group">
                <label htmlFor="mobile">Mobile Number</label>
                <div className="input-wrapper">
                  <span className="input-icon-prefix">+</span>
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
                  />
                </div>
                <small className="help-text">Include your country code, e.g. 91 for India</small>
              </div>

              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <RefreshCw className="animate-spin" /> : 'Send OTP via WhatsApp'}
              </button>
            </form>
          </div>
        )}

        {step === 'OTP' && (
          <div className="glass-card fade-in">
            <div className="card-header">
              <div className="icon-container">
                <KeyRound className="header-icon" />
              </div>
              <h2>Verify OTP</h2>
              <p>Enter the 6-digit code sent to your WhatsApp number <strong>{mobileNumber}</strong></p>
            </div>

            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="otp-container">
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
                    className="otp-input"
                    disabled={loading}
                  />
                ))}
              </div>

              {info && (
                <div className="alert alert-info">
                  <CheckCircle size={18} />
                  <span>{info}</span>
                </div>
              )}

              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <RefreshCw className="animate-spin" /> : 'Verify Code'}
              </button>

              <div className="otp-footer">
                {resendTimer > 0 ? (
                  <p className="timer-text">
                    <Timer size={14} />
                    Resend code in {resendTimer}s
                  </p>
                ) : (
                  <button
                    type="button"
                    className="btn-link"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    Resend OTP on WhatsApp
                  </button>
                )}
                
                <button
                  type="button"
                  className="btn-link btn-link-muted"
                  onClick={() => setStep('PHONE')}
                  disabled={loading}
                >
                  Change Mobile Number
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'PROFILE' && (
          <div className="glass-card fade-in">
            <div className="card-header">
              <div className="icon-container">
                <UserIcon className="header-icon" />
              </div>
              <h2>Complete Profile</h2>
              <p>Almost there! Tell us a bit about yourself to finish creating your account.</p>
            </div>

            <form onSubmit={handleCompleteProfile} className="auth-form">
              <div className="input-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <UserIcon className="input-icon" size={18} />
                  <input
                    id="name"
                    type="text"
                    placeholder="Virat Kohli"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="email"
                    type="email"
                    placeholder="virat@cricket.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <RefreshCw className="animate-spin" /> : 'Complete Sign Up'}
              </button>
            </form>
          </div>
        )}

        {step === 'DASHBOARD' && user && (
          <div className="glass-card dashboard-card fade-in">
            <div className="dashboard-status">
              <div className="pulse-indicator"></div>
              <span>Logged In Securely</span>
            </div>

            <div className="dashboard-header">
              <div className="avatar">
                <span>{user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}</span>
              </div>
              <h2>Welcome, {user.name || 'User'}!</h2>
              <p className="mobile-pill">{user.mobileNumber}</p>
            </div>

            <div className="user-details-grid">
              <div className="detail-item">
                <span className="detail-label">Email</span>
                <span className="detail-value">{user.email || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">User ID</span>
                <span className="detail-value mono-text">{user.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Account Created</span>
                <span className="detail-value">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Auth Gateway</span>
                <span className="detail-value">WhatsApp Verified</span>
              </div>
            </div>

            <div className="dashboard-footer">
              <button onClick={handleLogout} className="btn btn-secondary">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
