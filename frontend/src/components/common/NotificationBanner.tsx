import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface NotificationBannerProps {
  error?: string | null;
  info?: string | null;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ error, info }) => {
  if (!error && !info) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 font-inter">
      {error && (
        <div className="bg-red-950/40 border border-red-900/50 text-rose-400 p-4 rounded-2xl text-xs flex items-center gap-2 shadow-lg">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {info && (
        <div className="bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 p-4 rounded-2xl text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{info}</span>
        </div>
      )}
    </div>
  );
};
