import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:80/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

export const locationService = {
  updateLocation: (data: any) => api.post('/locations', data),
  getTruckLocations: (truckId: string) => api.get(`/locations/${truckId}`),
  getActiveTrucks: () => api.get('/locations/active'),
};

export const systemService = {
  getHealth: () => api.get('/system/health'),
};
