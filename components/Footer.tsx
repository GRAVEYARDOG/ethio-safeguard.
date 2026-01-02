
import React from 'react';
import { ICONS, APP_NAME } from '../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-24 pb-12 px-8 mt-auto border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Partners Section - Filtered Logos - Displayed Normally */}
        <div className="mb-24 pb-16 border-b border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center mb-12">Proudly Supported By Strategic Partners</p>
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 items-center transition-all duration-700">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/WHO_logo.svg/512px-WHO_logo.svg.png" alt="WHO" className="h-10 lg:h-11 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/USAID-Identity.svg/512px-USAID-Identity.svg.png" alt="USAID" className="h-11 lg:h-13 object-contain" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-8 group cursor-pointer">
              <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                <ICONS.Shield className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">{APP_NAME}</span>
            </div>
            <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-md">
              EthioSafeguard is the world's most secure decentralized tracking protocol for humanitarian logistics. We ensure every unit is accounted for, from origin to last-mile delivery.
            </p>
            <div className="flex gap-4">
              {[
                { name: 'Twitter', url: 'https://twitter.com/WHO' },
                { name: 'LinkedIn', url: 'https://www.linkedin.com/company/world-health-organization' },
                { name: 'Github', url: 'https://github.com/WorldHealthOrganization' },
                { name: 'Instagram', url: 'https://www.instagram.com/who/' }
              ].map((social) => (
                <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:-translate-y-1 transition-all duration-300">
                  <span className="text-[10px] font-black uppercase tracking-tighter">{social.name[0]}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-8">Ecosystem</h4>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li><a href="#network" className="hover:text-indigo-600 transition-colors">Route Planner</a></li>
              <li><a href="#security" className="hover:text-indigo-600 transition-colors">Tactical Security</a></li>
              <li><a href="#network" className="hover:text-indigo-600 transition-colors">Fleet Network</a></li>
              <li><a href="#security" className="hover:text-indigo-600 transition-colors">Mission Hub</a></li>
            </ul>
          </div>

          <div className="lg:col-span-5">
            <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-8">Resource Hub</h4>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li><a href="#security" className="hover:text-indigo-600 transition-colors">Safety Guides</a></li>
              <li><a href="#network" className="hover:text-indigo-600 transition-colors">Support Portal</a></li>
              <li><a href="#security" className="hover:text-indigo-600 transition-colors">Driver Academy</a></li>
              <li><a href="#network" className="hover:text-indigo-600 transition-colors">API Docs</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">System Status: All Corridors Operational</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-[10px] text-slate-400 font-black uppercase tracking-widest">
            <a href="#security" className="hover:text-indigo-600 transition-all">Privacy Strategy</a>
            <a href="#network" className="hover:text-indigo-600 transition-all">Terms of Deployment</a>
            <a href="#security" className="hover:text-indigo-600 transition-all">Compliance</a>
            <p className="">© 2024 {APP_NAME.toUpperCase()} LOGISTICS</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
