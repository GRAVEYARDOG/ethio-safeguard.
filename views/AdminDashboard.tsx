
import React, { useState, useEffect } from 'react';
import { User, RegistrationStatus } from '../types';
import { store } from '../store';
import { ICONS as UI_ICONS, APP_NAME } from '../constants';
import { Footer } from '../components/Footer';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await store.fetchUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: string, status: RegistrationStatus) => {
    console.log('--- ADMIN DASHBOARD: HANDLE STATUS CHANGE ---');
    console.log('UserID:', userId);
    console.log('Status:', status);

    // Check if ID is defined
    if (!userId) {
      console.error('CRITICAL ERROR: UserID is undefined!');
      return;
    }

    try {
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));

      // Update in MongoDB via API
      console.log('Calling store.updateUserStatus...');
      await store.updateUserStatus(userId, status);
      console.log('Store update successful');

      // Refresh to ensure sync
      await fetchUsers();
    } catch (error) {
      console.error('Failed to update status:', error);
      // Revert on error
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => u.role !== 'ADMIN' && u.status === tab);

  return (
    <div className="min-h-screen flex flex-col mesh-gradient">
      <div className="flex flex-grow relative">
        {/* Modern Sidebar */}
        <aside className="w-80 bg-slate-950 text-white flex flex-col fixed h-full z-10 shadow-2xl transition-all duration-700 border-r border-white/5">
          <div className="p-10 flex items-center gap-4 border-b border-white/5">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-900/50">
              <UI_ICONS.Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tighter block">{APP_NAME}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 opacity-60">Control Hub</span>
            </div>
          </div>
          <nav className="flex-grow p-8 space-y-4">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 px-4">Management</div>
            <button className="w-full flex items-center gap-5 px-6 py-5 bg-indigo-600 rounded-3xl font-black text-sm shadow-2xl shadow-indigo-900/60 transition-all hover:scale-[1.03] active:scale-95">
              <UI_ICONS.User className="w-6 h-6" />
              Verification Queue
            </button>
          </nav>
          <div className="p-8 border-t border-white/5">
            <div className="mb-8 p-6 bg-slate-900/50 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">System Load</p>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-1/3 animate-pulse"></div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-5 px-6 py-5 text-red-400 hover:bg-red-400/10 rounded-3xl transition-all font-black text-sm group uppercase tracking-widest"
            >
              <UI_ICONS.LogOut className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow ml-80 p-12 animate-entrance">
          <header className="flex justify-between items-end mb-16">
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Verification Center</h1>
              <p className="text-xl text-slate-500 font-medium">Screening {users.length} total platform participants.</p>
            </div>
            <div className="flex items-center gap-5 glass-card p-3 rounded-[2.5rem] shadow-xl border border-white/50 animate-entrance animate-delay-200">
              <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-2xl rotate-3">
                {user.name[0]}
              </div>
              <div className="pr-6">
                <p className="text-lg font-black text-slate-900 leading-tight">{user.name}</p>
                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em]">Regional Oversight</p>
              </div>
            </div>
          </header>

          <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-900/5 border border-slate-100 overflow-hidden mb-20 animate-entrance animate-delay-100">
            <div className="flex bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
              {(['PENDING', 'APPROVED', 'REJECTED'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-12 py-8 font-black text-xs uppercase tracking-[0.2em] transition-all border-b-4 relative ${tab === t ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                >
                  {t}
                  <span className={`ml-3 px-2.5 py-1 rounded-lg text-[10px] ${tab === t ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                    {users.filter(u => u.role !== 'ADMIN' && u.status === t).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black tracking-[0.3em] uppercase text-left border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-8">Participant Data</th>
                    <th className="px-10 py-8">Role Type</th>
                    <th className="px-10 py-8">Operational Assets</th>
                    <th className="px-10 py-8 text-right">Oversight Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-10 py-32 text-center">
                        <div className="max-w-md mx-auto">
                          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <UI_ICONS.CheckCircle className="w-12 h-12 text-slate-200" />
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 mb-3">All Clear</h3>
                          <p className="text-slate-400 font-medium">There are currently no participants in the {tab.toLowerCase()} state.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, idx) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-all group animate-entrance" style={{ animationDelay: `${idx * 80}ms` }}>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center font-black text-2xl text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 transition-all shadow-sm">
                              {u.name[0]}
                            </div>
                            <div>
                              <div className="font-black text-xl text-slate-900 leading-tight mb-1">{u.name}</div>
                              <div className="text-sm text-slate-500 font-medium">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${u.role === 'DRIVER' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          {u.role === 'DRIVER' ? (
                            <div className="space-y-1">
                              <p className="font-black text-lg text-slate-800 tracking-tight">{u.truckDetails?.licensePlate}</p>
                              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{u.truckDetails?.model}</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-black text-lg text-slate-800 tracking-tight">{u.organizationDetails?.name}</p>
                              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{u.organizationDetails?.type}</p>
                            </div>
                          )}
                        </td>
                        <td className="px-10 py-8 text-right space-x-3">
                          {tab === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(u.id || (u as any)._id, RegistrationStatus.APPROVED)}
                                className="px-8 py-3.5 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(u.id || (u as any)._id, RegistrationStatus.REJECTED)}
                                className="px-8 py-3.5 bg-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {tab !== 'PENDING' && (
                            <button
                              onClick={() => handleStatusChange(u.id || (u as any)._id, RegistrationStatus.PENDING)}
                              className="px-8 py-3.5 bg-white border-2 border-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
                            >
                              Revoke Access
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      <div className="ml-80">
        <Footer />
      </div>
    </div>
  );
};
