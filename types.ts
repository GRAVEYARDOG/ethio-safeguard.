
export type UserRole = 'DRIVER' | 'SENDER' | 'ADMIN';

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum TruckStatus {
  IDLE = 'IDLE',
  READY = 'READY',
  BUSY = 'BUSY'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: RegistrationStatus;
  password?: string;
  truckDetails?: {
    licensePlate: string;
    model: string;
    capacity: string;
    driverLicense: string;
    experienceYears: string;
    location?: { lat: number; lng: number };
    currentStatus: TruckStatus;
  };
  organizationDetails?: {
    name: string;
    type: string;
    regNumber: string;
    sector: string;
    headquarters: string;
  };
}

export interface AidRequest {
  id: string;
  senderId: string;
  driverId: string;
  aidType: string;
  quantity: string;
  destination: string;
  urgency: 'Low' | 'Medium' | 'High';
  status: RequestStatus;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  read: boolean;
  createdAt: number;
  requestId?: string;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  text: string;
  role: UserRole;
  createdAt: number;
}
