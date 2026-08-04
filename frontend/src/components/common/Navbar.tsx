import React from 'react';
import { LogOut, ShieldCheck, User } from 'lucide-react';
import { UserProfile, AdminProfile } from '../../types/auth.types';

interface NavbarProps {
  user: UserProfile | null;
  adminUser: AdminProfile | null;
  onLogout: () => void;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  adminUser,
  onLogout,
  onOpenAdminLogin,
}) => {
  return (
    <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-zinc-950 font-black text-xl tracking-tighter">
            GCG
          </div>
          <div>
            <h1 className="text-xl font-outfit font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              Gentlemen Cricket Ground
              {adminUser && (
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1">
                  <ShieldCheck size={11} /> Admin Portal
                </span>
              )}
            </h1>
            <p className="text-xs text-zinc-400 font-inter">Book Turf & Box Cricket Grounds</p>
          </div>
        </div>

        {/* User / Admin Actions */}
        <div className="flex items-center gap-3 font-inter">
          {adminUser ? (
            <div className="flex items-center gap-3">
              <div className="bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-1.5 text-right hidden sm:block">
                <span className="text-[10px] text-amber-400 uppercase font-semibold block">Logged in Admin</span>
                <span className="text-xs text-zinc-200 font-mono">{adminUser.username}</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-right hidden sm:block">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Player Profile</span>
                <span className="text-xs text-zinc-200">{user.name || user.mobileNumber}</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <User size={14} />
              Admin Portal
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
