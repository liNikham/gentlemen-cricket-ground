import React from 'react';
import { ArrowRight, Phone, RefreshCw, ShieldCheck } from 'lucide-react';

interface PhoneFormProps {
  mobileNumber: string;
  setMobileNumber: (val: string) => void;
  loading: boolean;
  onSendOtp: (e: React.FormEvent) => void;
  onOpenAdminModal: () => void;
}

export const PhoneForm: React.FC<PhoneFormProps> = ({
  mobileNumber,
  setMobileNumber,
  loading,
  onSendOtp,
  onOpenAdminModal,
}) => {
  return (
    <div className="max-w-md mx-auto bg-zinc-900/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl font-inter">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 font-bold">
          <Phone size={28} />
        </div>
        <h2 className="text-2xl font-outfit font-bold text-zinc-100">Welcome Player</h2>
        <p className="text-xs text-zinc-400 mt-1">Enter your mobile number to get started</p>
      </div>

      <form onSubmit={onSendOtp} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Mobile Number *
          </label>
          <div className="relative">
            <input
              type="tel"
              placeholder="+919876543210 or 9876543210"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
              className="w-full h-12 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none font-mono tracking-wide transition-all"
            />
          </div>
          <p className="text-[11px] text-zinc-500 mt-1.5">Indian numbers auto-prefix with +91</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold py-3.5 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="animate-spin" size={18} />
          ) : (
            <>
              <span>Get Verification OTP</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <button
          type="button"
          onClick={onOpenAdminModal}
          className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1.5 font-semibold cursor-pointer"
        >
          <ShieldCheck size={14} />
          Administrator Portal Login ↗
        </button>
      </div>
    </div>
  );
};
