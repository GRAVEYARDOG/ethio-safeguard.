
import React, { useState } from 'react';
import { ICONS, APP_NAME } from '../constants';
import { UserRole, User, RegistrationStatus } from '../types';
import { store } from '../store';

interface LoginPageProps {
  role: UserRole;
  onBack: () => void;
  onSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ role, onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Async login via MongoDB
    setTimeout(async () => {
      try {
        const user = await store.loginUser({ email, password });

        if (user.role !== role) {
          setError(`Access Denied. Identity mismatch for ${role} portal.`);
          setLoading(false);
          return;
        }

        if (user.status !== RegistrationStatus.APPROVED) {
          setError('Operational Clearance pending. Contact Regional Admin.');
          setLoading(false);
          return;
        }

        onSuccess(user);
      } catch (err: any) {
        setError(err.error || 'Connection Failed to Logistics Core.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Visual Identity Sidebar */}
      <div className="lg:w-2/5 bg-slate-950 p-16 md:p-24 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10">
          <button onClick={onBack} className="group flex items-center gap-4 text-indigo-400 hover:text-white mb-20 transition-all font-black uppercase tracking-[0.3em] text-xs">
            <div className="p-2 bg-indigo-600/20 rounded-xl group-hover:bg-indigo-600 transition-all">
              <ICONS.Shield className="w-6 h-6" />
            </div>
            <span>{APP_NAME} HQ</span>
          </button>

          <div className="mb-10 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="bg-indigo-500 rounded-full h-2 w-2"></span>
            </span>
            Secure Protocol Active
          </div>

          <h1 className="text-6xl font-black mb-8 tracking-tighter leading-none">
            Welcome <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Back, Unit.</span>
          </h1>

          <p className="text-2xl text-slate-400 leading-relaxed font-medium mb-12 max-w-sm">
            Access your control portal to manage deployments, track assets, and ensure humanitarian delivery safety.
          </p>
        </div>

        <div className="relative z-10 p-8 glass-card border-white/5 bg-white/5 rounded-[2.5rem] animate-float">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-900/40">
              {role === 'DRIVER' ? <ICONS.Truck className="w-6 h-6" /> : role === 'SENDER' ? <ICONS.Box className="w-6 h-6" /> : <ICONS.Settings className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Portal Context</p>
              <p className="text-lg font-black text-white">{role === 'DRIVER' ? 'Fleet Operator' : role === 'SENDER' ? 'Mission Dispatcher' : 'System Oversight'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Access Form Content */}
      <div className="lg:w-3/5 p-16 md:p-24 flex items-center justify-center mesh-gradient">
        <div className="max-w-md w-full animate-entrance">
          <div className="mb-16">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Identity Verification</h2>
            <p className="text-xl text-slate-500 font-medium">Input your encrypted credentials below.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-[2rem] text-sm font-black flex gap-4 animate-shake uppercase tracking-tight">
                <ICONS.AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Access Token (Email)</label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-8 py-6 bg-white border-2 border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-black text-lg text-slate-900 shadow-sm placeholder:text-slate-200"
                placeholder="unit@ethiosafeguard.com"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Secure Passcode</label>
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-8 py-6 bg-white border-2 border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-black text-lg text-slate-900 shadow-sm placeholder:text-slate-200"
                placeholder="••••••••••••"
              />
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 shadow-3xl shadow-indigo-500/30 disabled:opacity-50 active:scale-95 group"
              >
                {loading ? 'Decrypting Access...' : (
                  <>
                    <span>Execute Sign-In</span>
                    <ICONS.ChevronRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-16 text-center">
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 mx-auto group"
            >
              <span className="group-hover:-translate-x-2 transition-transform">←</span> Return to Logistics Hub
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};
