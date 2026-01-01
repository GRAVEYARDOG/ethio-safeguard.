
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, RegistrationStatus, TruckStatus, AidRequest, Notification, RequestStatus } from './types';
import { store } from './store';
import { LandingPage } from './views/LandingPage';
import { RegistrationPage } from './views/RegistrationPage';
import { LoginPage } from './views/LoginPage';
import { AdminDashboard } from './views/AdminDashboard';
import { DriverDashboard } from './views/DriverDashboard';
import { SenderDashboard } from './views/SenderDashboard';
import { NotificationCenter } from './components/NotificationCenter';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'LANDING' | 'REGISTER' | 'LOGIN' | 'DASHBOARD' | 'MAP'>('LANDING');
  const [loginRole, setLoginRole] = useState<UserRole | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  const loadNotifications = useCallback(() => {
    if (!currentUser) return;
    const all = store.getNotifications();
    setNotifications(all.filter(n => n.userId === currentUser.id));
  }, [currentUser]);

  useEffect(() => {
    const interval = setInterval(loadNotifications, 5000);
    loadNotifications();
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleLogout = () => {
    setCurrentUser(null);
    setView('LANDING');
    setLoginRole(null);
  };

  const renderView = () => {
    switch (view) {
      case 'LANDING':
        return <LandingPage 
          onStartRegister={() => setView('REGISTER')} 
          onStartLogin={(role) => {
            setLoginRole(role);
            setView('LOGIN');
          }} 
        />;
      case 'REGISTER':
        return <RegistrationPage onBack={() => setView('LANDING')} onComplete={() => setView('LANDING')} />;
      case 'LOGIN':
        return <LoginPage 
          role={loginRole!} 
          onBack={() => setView('LANDING')} 
          onSuccess={(user) => {
            setCurrentUser(user);
            setView('DASHBOARD');
          }} 
        />;
      case 'DASHBOARD':
        if (!currentUser) return null;
        if (currentUser.role === 'ADMIN') return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
        if (currentUser.role === 'DRIVER') return <DriverDashboard user={currentUser} onLogout={handleLogout} refreshNotifications={loadNotifications} />;
        if (currentUser.role === 'SENDER') return <SenderDashboard user={currentUser} onLogout={handleLogout} />;
        return null;
      default:
        return <LandingPage onStartRegister={() => setView('REGISTER')} onStartLogin={(role) => {
          setLoginRole(role);
          setView('LOGIN');
        }} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderView()}
      {currentUser && (
        <NotificationCenter 
          notifications={notifications} 
          onClear={(id) => {
            const all = store.getNotifications();
            store.saveNotifications(all.filter(n => n.id !== id));
            loadNotifications();
          }}
        />
      )}
    </div>
  );
};

export default App;
