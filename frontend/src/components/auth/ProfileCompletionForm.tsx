import React from 'react';
import { User, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ProfileCompletionFormProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfileCompletionForm: React.FC<ProfileCompletionFormProps> = ({
  name,
  setName,
  email,
  setEmail,
  loading,
  onSubmit,
}) => {
  return (
    <div className="max-w-md mx-auto bg-zinc-900/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl font-inter">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 font-bold">
          <User size={28} />
        </div>
        <h2 className="text-2xl font-outfit font-bold text-zinc-100">Complete Player Profile</h2>
        <p className="text-xs text-zinc-400 mt-1">Add your name and email to finalize booking account setup</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Virat Kohli"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-12 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="e.g. virat@cricket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold py-3.5 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer mt-4"
        >
          {loading ? (
            <RefreshCw className="animate-spin" size={18} />
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>Save & Complete Profile</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
