import React, { useState } from 'react';
import { X, ShieldCheck, RefreshCw } from 'lucide-react';

interface AdminLoginModalProps {
  loading: boolean;
  onClose: () => void;
  onAdminLogin: (username: string, password: string) => Promise<void>;
  onRequestResetOtp: (usernameOrMobile: string) => Promise<void>;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  loading,
  onClose,
  onAdminLogin,
  onRequestResetOtp,
}) => {
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdminLogin(adminUsername, adminPassword);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRequestResetOtp(resetIdentifier);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto font-inter">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-100 p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 font-bold">
            <ShieldCheck size={26} />
          </div>
          <h3 className="text-xl font-outfit font-bold text-zinc-100">
            {isResetMode ? 'Reset Admin Password' : 'Admin Portal Login'}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {isResetMode ? 'Enter username or mobile to receive reset OTP' : 'Sign in with administrator credentials'}
          </p>
        </div>

        {!isResetMode ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Username / Mobile *
              </label>
              <input
                type="text"
                placeholder="admin"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                required
                className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none"
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsResetMode(true)}
                className="text-[11px] text-amber-400 hover:underline font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold py-3 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 text-xs"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Login as Administrator'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Username or Registered Mobile *
              </label>
              <input
                type="text"
                placeholder="admin or +919876543210"
                value={resetIdentifier}
                onChange={(e) => setResetIdentifier(e.target.value)}
                required
                className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold py-3 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Request Password Reset OTP'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Back to Admin Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
