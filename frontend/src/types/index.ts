export interface Location {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface Truck {
  id: string;
  driverName: string;
  location: Location;
  status: 'active' | 'inactive' | 'emergency';
  speed: number;
  battery: number;
}
