import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-zinc-950 py-8 text-center text-xs text-zinc-500 font-inter">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-zinc-950 font-bold flex items-center justify-center text-[10px]">
            GCG
          </div>
          <span className="font-outfit font-bold text-zinc-300">Gentlemen Cricket Ground</span>
        </div>
        <p>© {new Date().getFullYear()} Gentlemen Cricket Ground. All rights reserved.</p>
      </div>
    </footer>
  );
};
