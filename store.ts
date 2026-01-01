
import { User, RegistrationStatus, TruckStatus, AidRequest, Notification } from './types';

const STORAGE_KEYS = {
  USERS: 'ethio_users',
  REQUESTS: 'ethio_requests',
  NOTIFICATIONS: 'ethio_notifications'
};

const INITIAL_ADMIN: User = {
  id: 'admin-1',
  name: 'Ethio Admin',
  email: 'admin@ethiosafeguard.com',
  role: 'ADMIN',
  status: RegistrationStatus.APPROVED
};

const API_URL = 'http://localhost:3000/api'; // Points to Nginx Load Balancer

export const store = {
  // Now async
  fetchUsers: async (): Promise<User[]> => {
    try {
      const res = await fetch(`${API_URL}/users`);
      return await res.json();
    } catch (e) { console.error(e); return []; }
  },

  registerUser: async (user: any): Promise<User> => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!res.ok) throw await res.json();
    return await res.json();
  },

  loginUser: async (creds: any): Promise<User> => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    if (!res.ok) throw await res.json();
    return await res.json();
  },

  updateUserStatus: async (id: string, status: string) => {
    try {
      console.log(`Sending update status request for ${id} to ${status}`);
      const res = await fetch(`${API_URL}/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Update status failed:', err);
        throw err;
      }
      console.log('Update status successful');
    } catch (e) {
      console.error('Network error in updateUserStatus:', e);
      throw e;
    }
  },

  updateTruckStatus: async (id: string, status: string) => {
    await fetch(`${API_URL}/users/${id}/truck-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  },

  // Keep requests/notifications local for now or TODO migrate them too
  getRequests: (): AidRequest[] => {
    const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return data ? JSON.parse(data) : [];
  },
  saveRequests: (requests: AidRequest[]) => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  },
  getNotifications: (): Notification[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  },
  saveNotifications: (notifications: Notification[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const all = store.getNotifications();
    const newNote: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      read: false
    };
    store.saveNotifications([newNote, ...all]);
  }
};
