
import React, { useState } from 'react';
import { ICONS, APP_NAME } from '../constants';
import { UserRole, RegistrationStatus, User } from '../types';
import { store } from '../store';

interface RegistrationPageProps {
  onBack: () => void;
  onComplete: () => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ onBack, onComplete }) => {
  const [role, setRole] = useState<UserRole>('DRIVER');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form states differentiated by role
  const [commonData, setCommonData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [driverData, setDriverData] = useState({
    driverLicense: '',
    licensePlate: '',
    truckModel: '',
    capacity: '10 tons',
    experienceYears: '',
  });

  const [senderData, setSenderData] = useState({
    orgName: '',
    regNumber: '',
    sector: 'Humanitarian',
    orgType: 'NGO',
    headquarters: '',
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // 1. Letters/Name Validation
    const nameTrimmed = commonData.name.trim().replace(/\s+/g, ' ');
    const nameWords = nameTrimmed.split(' ');
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!nameRegex.test(nameTrimmed)) {
      newErrors.name = 'Numbers and special characters are not allowed in names.';
    } else if (nameWords.length < 2 || nameWords.length > 4) {
      newErrors.name = 'Name must be between 2 and 4 words.';
    } else if (commonData.name !== nameTrimmed) {
      newErrors.name = 'Multiple spaces are not allowed.';
    }

    // 2. Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(commonData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // 3. Password Validation
    if (commonData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    } else if (commonData.password !== commonData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // 4. Role-Specific Section Validation
    const sectionRegex = /^[A-Za-z0-9\s-]+$/;
    const multiSpaceRegex = /\s{2,}/;

    if (role === 'DRIVER') {
      // Experience Validation
      const exp = parseInt(driverData.experienceYears);
      if (isNaN(exp) || exp < 0) {
        newErrors.experienceYears = 'Experience must be a positive number.';
      } else if (driverData.experienceYears.includes(' ')) {
        newErrors.experienceYears = 'Spaces are not allowed in numeric fields.';
      }

      // Section Inputs Validation
      if (!sectionRegex.test(driverData.driverLicense)) {
        newErrors.driverLicense = 'Special characters are not allowed.';
      } else if (multiSpaceRegex.test(driverData.driverLicense)) {
        newErrors.driverLicense = 'Multiple spaces are not allowed.';
      }

      if (!sectionRegex.test(driverData.licensePlate)) {
        newErrors.licensePlate = 'Special characters are not allowed.';
      } else if (multiSpaceRegex.test(driverData.licensePlate)) {
        newErrors.licensePlate = 'Multiple spaces are not allowed.';
      }

      if (!sectionRegex.test(driverData.truckModel)) {
        newErrors.truckModel = 'Special characters are not allowed.';
      } else if (multiSpaceRegex.test(driverData.truckModel)) {
        newErrors.truckModel = 'Multiple spaces are not allowed.';
      }
    } else {
      // SENDER Validation
      if (!sectionRegex.test(senderData.orgName)) {
        newErrors.orgName = 'Special characters are not allowed.';
      } else if (multiSpaceRegex.test(senderData.orgName)) {
        newErrors.orgName = 'Multiple spaces are not allowed.';
      }

      if (!sectionRegex.test(senderData.regNumber)) {
        newErrors.regNumber = 'Special characters are not allowed.';
      } else if (multiSpaceRegex.test(senderData.regNumber)) {
        newErrors.regNumber = 'Multiple spaces are not allowed.';
      }

      if (!sectionRegex.test(senderData.headquarters)) {
        newErrors.headquarters = 'Special characters are not allowed.';
      } else if (multiSpaceRegex.test(senderData.headquarters)) {
        newErrors.headquarters = 'Multiple spaces are not allowed.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    setTimeout(async () => {
      // Create user object
      const newUser: Partial<User> = {
        name: commonData.name,
        email: commonData.email,
        password: commonData.password, // Added password for API
        role,
        status: RegistrationStatus.PENDING,
        ...(role === 'DRIVER' ? {
          truckDetails: {
            driverLicense: driverData.driverLicense,
            licensePlate: driverData.licensePlate,
            model: driverData.truckModel,
            capacity: driverData.capacity,
            experienceYears: driverData.experienceYears,
            currentStatus: 'IDLE' as any
          }
        } : {
          organizationDetails: {
            name: senderData.orgName,
            type: senderData.orgType,
            regNumber: senderData.regNumber,
            sector: senderData.sector,
            headquarters: senderData.headquarters,
          }
        })
      };

      try {
        await store.registerUser(newUser);
        setLoading(false);
        setSubmitted(true);
      } catch (err: any) {
        console.error(err);
        setLoading(false);
        alert(err.error || 'Registration failed');
      }
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center p-8">
        <div className="bg-white p-20 rounded-[4rem] shadow-3xl max-w-2xl w-full text-center border border-slate-50 animate-entrance">
          <div className="w-32 h-32 bg-indigo-50 text-indigo-600 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
            <ICONS.CheckCircle className="w-14 h-14" />
          </div>
          <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">Application Logged.</h2>
          <p className="text-xl text-slate-500 mb-12 font-medium leading-relaxed">
            Your {role === 'DRIVER' ? 'driver credentials and vehicle assets' : 'organization credentials'} have been securely submitted to the {APP_NAME} verification core.
          </p>
          <button
            onClick={onComplete}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-2xl active:scale-95"
          >
            Return to HQ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Immersive Sidebar */}
      <div className="lg:w-2/5 bg-slate-950 p-16 md:p-24 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1454165833767-027ffea9e78b?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10">
          <button onClick={onBack} className="group flex items-center gap-4 text-indigo-400 hover:text-white mb-20 transition-all font-black uppercase tracking-[0.3em] text-xs">
            <div className="p-2 bg-indigo-600/20 rounded-xl group-hover:bg-indigo-600 transition-all">
              <ICONS.Shield className="w-6 h-6" />
            </div>
            <span>{APP_NAME}</span>
          </button>
          <h1 className="text-6xl font-black mb-10 tracking-tighter leading-none">
            {role === 'DRIVER' ? 'Drive for' : 'Send via'} <br /><span className="text-indigo-500">Global Aid.</span>
          </h1>
          <p className="text-2xl text-slate-400 leading-relaxed font-medium mb-16">
            {role === 'DRIVER'
              ? "Join our fleet of professional responders. We require proof of license and vehicle roadworthiness to ensure mission safety."
              : "Onboard your organization to our secure network. We verify non-profit status and registration for total operational trust."
            }
          </p>
        </div>
        <div className="space-y-12 relative z-10">
          {[
            { n: "01", t: "Registration", d: "Differentiated requirements based on your specific role." },
            { n: "02", t: "Verification", d: "Manual review of regulatory and professional documents." },
            { n: "03", t: "Activation", d: "Full access to the live dispatching and tracking engine." }
          ].map((step, i) => (
            <div key={i} className="flex gap-8 items-center animate-entrance" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-lg">
                {step.n}
              </div>
              <div>
                <h4 className="font-black text-xl mb-1 tracking-tight">{step.t}</h4>
                <p className="text-slate-500 font-medium text-sm">{step.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="lg:w-3/5 p-16 md:p-24 overflow-y-auto mesh-gradient custom-scrollbar">
        <div className="max-w-2xl mx-auto animate-entrance">
          <div className="flex bg-slate-100/50 p-2 rounded-[2rem] mb-16 shadow-inner border border-slate-200">
            <button
              onClick={() => setRole('DRIVER')}
              className={`flex-1 py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all ${role === 'DRIVER' ? 'bg-white shadow-2xl text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Truck Operator
            </button>
            <button
              onClick={() => setRole('SENDER')}
              className={`flex-1 py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all ${role === 'SENDER' ? 'bg-white shadow-2xl text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Aid Provider
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 pb-20">
            {/* Common Section */}
            <div className="space-y-10">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                Account Identity
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Official Full Name</label>
                  <input
                    required
                    type="text"
                    value={commonData.name}
                    onChange={e => setCommonData({ ...commonData, name: e.target.value })}
                    className={`w-full px-8 py-5 bg-white border-2 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 shadow-sm ${errors.name ? 'border-red-500' : 'border-slate-100'}`}
                    placeholder="e.g. Abebe Bikila"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{errors.name}</p>}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Secure Email Address</label>
                  <input
                    required
                    type="email"
                    value={commonData.email}
                    onChange={e => setCommonData({ ...commonData, email: e.target.value })}
                    className={`w-full px-8 py-5 bg-white border-2 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 shadow-sm ${errors.email ? 'border-red-500' : 'border-slate-100'}`}
                    placeholder="abebe@organization.com"
                  />
                  {errors.email && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{errors.email}</p>}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Access Password</label>
                  <input
                    required
                    type="password"
                    value={commonData.password}
                    onChange={e => setCommonData({ ...commonData, password: e.target.value })}
                    className={`w-full px-8 py-5 bg-white border-2 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 shadow-sm ${errors.password ? 'border-red-500' : 'border-slate-100'}`}
                    placeholder="••••••••••••"
                  />
                  {errors.password && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{errors.password}</p>}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Confirm Password</label>
                  <input
                    required
                    type="password"
                    value={commonData.confirmPassword}
                    onChange={e => setCommonData({ ...commonData, confirmPassword: e.target.value })}
                    className={`w-full px-8 py-5 bg-white border-2 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 shadow-sm ${errors.confirmPassword ? 'border-red-500' : 'border-slate-100'}`}
                    placeholder="••••••••••••"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-200"></div>

            {/* Differentiated Section */}
            {role === 'DRIVER' ? (
              <div className="space-y-10 animate-entrance">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                  Asset & Licensing
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Driver License Number</label>
                    <input
                      required
                      type="text"
                      value={driverData.driverLicense}
                      onChange={e => setDriverData({ ...driverData, driverLicense: e.target.value })}
                      className={`w-full px-8 py-5 bg-white border-2 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 shadow-sm ${errors.driverLicense ? 'border-red-500' : 'border-slate-100'}`}
                      placeholder="e.g. DL-2024-8891"
                    />
                    {errors.driverLicense && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{errors.driverLicense}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Truck Plate ID</label>
                    <input
                      required
                      type="text"
                      value={driverData.licensePlate}
                      onChange={e => setDriverData({ ...driverData, licensePlate: e.target.value })}
                      className={`w-full px-8 py-5 bg-white border-2 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 shadow-sm ${errors.licensePlate ? 'border-red-500' : 'border-slate-100'}`}
                      placeholder="ETH-AA-12345"
                    />
                    {errors.licensePlate && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{errors.licensePlate}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Vehicle Model</label>
                    <input
                      required
                      type="text"
                      value={driverData.truckModel}
                      onChange={e => setDriverData({ ...driverData, truckModel: e.target.value })}
                      className={`w-full px-8 py-5 bg-white border-2 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 shadow-sm ${errors.truckModel ? 'border-red-500' : 'border-slate-100'}`}
                      placeholder="e.g. Isuzu Forward"
                    />
                    {errors.truckModel && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{errors.truckModel}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Tonnage Capacity</label>
                    <select
                      value={driverData.capacity}
                      onChange={e => setDriverData({ ...driverData, capacity: e.target.value })}
                      className="w-full px-8 py-5 bg-white border-2 border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-black text-slate-800 appearance-none shadow-sm"
                    >
                      <option>5 tons</option>
                      <option>10 tons</option>
                      <option>20 tons</option>
                      <option>40 tons (Heavy)</option>
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Experience (Years)</label>
                    <input
                      required
                      type="number"
                      value={driverData.experienceYears}
                      onChange={e => setDriverData({ ...driverData, experienceYears: e.target.value })}
                      className={`w-full px-8 py-5 bg-white border-2 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 shadow-sm ${errors.experienceYears ? 'border-red-500' : 'border-slate-100'}`}
                      placeholder="e.g. 5"
                    />
                    {errors.experienceYears && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{errors.experienceYears}</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-entrance">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                  Provider Credentials
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Organization Name</label>
                    <input
                      required
                      type="text"
                      value={senderData.orgName}
                      onChange={e => setSenderData({ ...senderData, orgName: e.target.value })}
                      className={`w-full px-8 py-5 bg-white border-2 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 shadow-sm ${errors.orgName ? 'border-red-500' : 'border-slate-100'}`}
                      placeholder="e.g. World Health Aid Ethiopia"
                    />
                    {errors.orgName && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{errors.orgName}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Registration ID</label>
                    <input
                      required
                      type="text"
                      value={senderData.regNumber}
                      onChange={e => setSenderData({ ...senderData, regNumber: e.target.value })}
                      className={`w-full px-8 py-5 bg-white border-2 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 shadow-sm ${errors.regNumber ? 'border-red-500' : 'border-slate-100'}`}
                      placeholder="NGO-REG-2024-X"
                    />
                    {errors.regNumber && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{errors.regNumber}</p>}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Primary Sector</label>
                    <select
                      value={senderData.sector}
                      onChange={e => setSenderData({ ...senderData, sector: e.target.value })}
                      className="w-full px-8 py-5 bg-white border-2 border-slate-100 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-black text-slate-800 appearance-none shadow-sm"
                    >
                      <option>Humanitarian</option>
                      <option>Medical</option>
                      <option>Disaster Relief</option>
                      <option>Governmental</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Headquarters Address</label>
                    <input
                      required
                      type="text"
                      value={senderData.headquarters}
                      onChange={e => setSenderData({ ...senderData, headquarters: e.target.value })}
                      className={`w-full px-8 py-5 bg-white border-2 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-bold text-slate-800 shadow-sm ${errors.headquarters ? 'border-red-500' : 'border-slate-100'}`}
                      placeholder="e.g. Bole Sub-City, Addis Ababa"
                    />
                    {errors.headquarters && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-widest">{errors.headquarters}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-7 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 shadow-3xl shadow-indigo-500/30 disabled:opacity-50 active:scale-95 group"
              >
                {loading ? 'Transmitting Data...' : (
                  <>
                    <span>Submit Strategic Profile</span>
                    <ICONS.ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
