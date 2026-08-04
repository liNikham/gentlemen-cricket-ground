import React, { useRef } from 'react';
import { ArrowLeft, KeyRound, RefreshCw, CheckCircle2 } from 'lucide-react';

interface OtpVerificationFormProps {
  mobileNumber: string;
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  loading: boolean;
  resendTimer: number;
  onVerifyOtp: (e: React.FormEvent) => void;
  onResendOtp: () => void;
  onBack: () => void;
}

export const OtpVerificationForm: React.FC<OtpVerificationFormProps> = ({
  mobileNumber,
  otp,
  setOtp,
  loading,
  resendTimer,
  onVerifyOtp,
  onResendOtp,
  onBack,
}) => {
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
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

  return (
    <div className="max-w-md mx-auto bg-zinc-900/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl font-inter">
      <button
        onClick={onBack}
        className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 mb-6 transition-all cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Mobile Input
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 font-bold">
          <KeyRound size={28} />
        </div>
        <h2 className="text-2xl font-outfit font-bold text-zinc-100">Verify OTP</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Code sent to <span className="font-mono text-amber-400 font-semibold">{mobileNumber}</span>
        </p>
      </div>

      <form onSubmit={onVerifyOtp} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 text-center">
            Enter 6-Digit Verification Code
          </label>
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  otpRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl text-center font-mono text-xl text-amber-400 font-bold outline-none transition-all"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || otp.join('').length < 6}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold py-3.5 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="animate-spin" size={18} />
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>Verify & Continue</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs">
        {resendTimer > 0 ? (
          <span className="text-zinc-500">Resend OTP in {resendTimer}s</span>
        ) : (
          <button
            type="button"
            onClick={onResendOtp}
            className="text-amber-400 hover:underline font-semibold cursor-pointer"
          >
            Resend OTP Code
          </button>
        )}
      </div>
    </div>
  );
};
