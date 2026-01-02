
import React from 'react';
import { ICONS, APP_NAME } from '../constants';
import { UserRole } from '../types';
import { Footer } from '../components/Footer';

interface LandingPageProps {
  onStartRegister: () => void;
  onStartLogin: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartRegister, onStartLogin }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="px-8 py-5 flex items-center justify-between glass-card sticky top-0 z-50 transition-all duration-500 mx-4 mt-4 rounded-3xl">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
            <ICONS.Shield className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">{APP_NAME}</span>
        </div>
        <div className="hidden lg:flex items-center gap-10">
          <a href="#network" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Network</a>
          <a href="#security" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Security</a>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onStartLogin('ADMIN')}
            className="hidden sm:block text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors mr-4"
          >
            Admin
          </button>
          <button
            onClick={onStartRegister}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:shadow-indigo-200 active:scale-95"
          >
            Join the Mission
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Cinematic Hero */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">
            <div className="animate-entrance relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest mb-10 shadow-sm">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                Global Logistics Backbone
              </div>
              <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 leading-[1.05] mb-10 tracking-tighter">
                Transparency <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500">Saves Lives.</span>
              </h1>
              <p className="text-2xl text-slate-500 mb-14 leading-relaxed max-w-xl font-medium">
                The most advanced tracking infrastructure for humanitarian aid. Connecting donors, senders, and drivers in one secure, live ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <button
                  onClick={() => onStartLogin('DRIVER')}
                  className="group flex items-center justify-center gap-4 bg-slate-900 text-white px-12 py-6 rounded-3xl font-bold hover:bg-slate-800 transition-all shadow-2xl hover:-translate-y-1"
                >
                  <ICONS.Truck className="w-6 h-6 text-indigo-400 group-hover:rotate-6 transition-transform" />
                  Driver Portal
                </button>
                <button
                  onClick={() => onStartLogin('SENDER')}
                  className="flex items-center justify-center gap-4 bg-white text-slate-900 border-2 border-slate-100 px-12 py-6 rounded-3xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-xl shadow-slate-200/50 hover:-translate-y-1"
                >
                  <ICONS.Box className="w-6 h-6" />
                  Sender Portal
                </button>
              </div>

              {/* Verified Partner Logos - Display Normally */}
              <div className="mt-20 pt-10 border-t border-slate-200/60 flex flex-wrap gap-x-12 gap-y-8 items-center transition-all duration-700">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 w-full mb-2 lg:w-auto lg:mb-0">Verified Partners:</p>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/WHO_logo.svg/512px-WHO_logo.svg.png" alt="WHO" className="h-8 lg:h-9 object-contain" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/USAID-Identity.svg/512px-USAID-Identity.svg.png" alt="USAID" className="h-8 lg:h-10 object-contain" />
              </div>
            </div>

            <div className="relative animate-entrance animate-delay-200">
              <div className="absolute -inset-20 bg-gradient-to-tr from-indigo-200/20 to-teal-100/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
              <div className="relative group perspective-1000">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-[3rem] opacity-30 blur-xl group-hover:opacity-50 transition duration-1000"></div>
                {/* Hero Dashboard Image - Ensuring Visibility with a reliable source */}
                <div className="relative glass-card p-3 rounded-[3rem] premium-shadow overflow-hidden transform group-hover:rotate-y-1 transition-transform duration-700 bg-white/40">
                  <div className="relative rounded-[2.2rem] overflow-hidden bg-slate-200 min-h-[500px]">
                    <img
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200"
                      alt="Tracking Command Dashboard"
                      className="w-full object-cover h-[600px] shadow-2xl brightness-95 group-hover:brightness-100 transition-all duration-500 block relative z-10"
                    />
                    {/* Live Data Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none z-20"></div>
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none z-30">
                      <div className="flex gap-2">
                        <div className="bg-emerald-500 h-2 w-2 rounded-full animate-pulse"></div>
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-[0.2em]">Live Telemetry</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-mono text-white">40.7128° N, 74.0060° W</div>
                    </div>
                  </div>

                  {/* Floating Stats */}
                  <div className="absolute top-16 left-10 p-6 glass-card rounded-3xl shadow-2xl animate-float border border-white/40 z-30">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Fleet Utilization</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tight">94.2%</p>
                  </div>

                  <div className="absolute bottom-12 right-10 p-6 glass-card rounded-3xl shadow-2xl animate-float border border-white/40 z-30" style={{ animationDelay: '1.5s' }}>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Response Latency</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tight">1.8s</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Security Section */}
        <section id="security" className="py-24 px-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="glass-card bg-white/80 p-16 md:p-24 rounded-[4rem] border border-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none grayscale">
                <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="Background" />
              </div>
              <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8 relative z-10">
                <div className="max-w-2xl">
                  <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-8">Architected for <span className="text-indigo-600">Trust.</span></h2>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed">We don't just track trucks; we secure the vital corridors that keep humanity moving forward through military-grade verification protocols.</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-10 relative z-10">
                {[
                  { icon: <ICONS.Shield />, title: "Smart Verification", desc: "Every driver is biometrically and document-verified by regional administrators.", grad: "from-blue-50 to-indigo-50" },
                  { icon: <ICONS.Map />, title: "Tactical Overlays", desc: "Live maps integrate conflict zone data to suggest the safest routes in real-time.", grad: "from-indigo-50 to-purple-50" },
                  { icon: <ICONS.Bell />, title: "Impact Alerts", desc: "Receive proof-of-delivery photos and confirmations directly to your dashboard.", grad: "from-teal-50 to-emerald-50" }
                ].map((f, i) => (
                  <div key={i} className={`group/feat bg-gradient-to-br ${f.grad} p-12 rounded-[3.5rem] border border-white/50 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-700 hover:-translate-y-3`}>
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-indigo-500/5 group-hover/feat:scale-110 group-hover/feat:rotate-6 transition-all duration-500 text-indigo-600">
                      {f.icon}
                    </div>
                    <h3 className="text-3xl font-extrabold mb-5 text-slate-900 tracking-tight">{f.title}</h3>
                    <p className="text-slate-500 leading-relaxed text-lg font-medium">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Network Section */}
        <section id="network" className="pb-32 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="glass-card bg-indigo-600 rounded-[4rem] p-16 md:p-24 shadow-3xl relative overflow-hidden group">
              <div className="absolute inset-0 opacity-15 pointer-events-none scale-110 group-hover:scale-100 transition-transform duration-[10s]">
                <img src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover grayscale invert" alt="Map" />
              </div>
              <div className="relative z-10 text-center max-w-4xl mx-auto text-white">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-12">
                  Global Deployment Network
                </div>
                <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter leading-tight">Join the Humanitarian <br /><span className="text-indigo-200">Logistics Backbone.</span></h2>
                <p className="text-xl md:text-2xl text-indigo-100 mb-16 font-medium leading-relaxed max-w-2xl mx-auto">
                  Whether you're a driver with a single Isuzu or an international agency, EthioSafeguard is your home for secure delivery.
                </p>
                <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                  <button
                    onClick={onStartRegister}
                    className="bg-white text-indigo-600 px-12 py-6 rounded-[2.5rem] font-black text-xl hover:bg-indigo-50 transition-all shadow-2xl active:scale-95 hover:-translate-y-1"
                  >
                    Register Organization
                  </button>
                  <div className="flex items-center gap-4 text-indigo-200 font-bold bg-white/5 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map(i => (
                        <img key={i} src={`https://i.pravatar.cc/100?img=${i + 20}`} className="w-10 h-10 rounded-full border-2 border-indigo-600 shadow-xl" alt="Driver" />
                      ))}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-white">4,200+ Drivers Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onRegister={onStartRegister} onLogin={onStartLogin} />
    </div>
  );
};
