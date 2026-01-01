# Ethio-Safeguard: Aid Truck Tracking System

---

## 1. Project Overview

### Problem Statement
- **Lack of Visibility**: Aid shipments often disappear or get delayed without real-time tracking.
- **Coordination Issues**: Disconnect between senders (logistics) and drivers.
- **Security Concerns**: Need for verified drivers and trucks during aid distribution.

### Solution: Ethio-Safeguard
- **Real-Time Tracking**: Live GPS tracking of aid trucks.
- **Role-Based Access**: Dedicated dashboards for Drivers, Senders, and Admins.
- **Secure Communication**: Instant updates and status synchronization.

---

## 2. Key Features

### For Senders (Logistics)
- **Live Map**: Leaflet-based map showing all active trucks.
- **Driver Management**: Register and approve drivers.
- **Request Creation**: Assign aid delivery jobs to available drivers.
- **Status Monitoring**: See if a driver is "Available", "Busy", or "Offline".

### For Drivers
- **Mobile-Friendly Dashboard**: Easy-to-use interface for drivers on the go.
- **Job Acceptance**: Receive and accept delivery requests.
- **Milestone Reporting**: Report progress (e.g., "Arrived at Checkpoint").
- **GPS Integration**: Automatically shares location with the server.

### For Admins
- **System Oversight**: Monitor all users and system health.
- **User Validation**: Verify identity of new registrations.

---

## 3. Technical Architecture

### Frontend (Client-Side)
- **React.js**: Dynamic user interface.
- **Vite**: Fast build tool and dev server.
- **Leaflet & React-Leaflet**: Interactive maps for tracking.
- **Socket.io-client**: Real-time bidirectional communication.

### Backend (Server-Side)
- **Node.js & Express**: robust REST API.
- **Socket.io**: Handling real-time location streams and status updates.
- **Redis**: Caching active driver locations for high performance.
- **MongoDB**: Persistent storage for User profiles (Drivers/Senders).

---

## 4. System Workflow

1. **Driver Logs In**: Authenticates and sets status to "Available".
2. **Sender Creates Request**: Selects a driver and specifies destination.
3. **Real-Time Update**: Driver receives request via Socket.io.
4. **Mission Start**: Driver accepts; Tracking begins.
5. **Live Tracking**: Location updates sent every few seconds to Redis -> Sender Dashboard.
6. **Completion**: Driver marks job as done; Status resets to "Available".

---

## 5. Future Improvements

- **Mobile App**: Native Android/iOS app for better GPS reliability.
- **Route Optimization**: AI-based route suggestions.
- **Offline Mode**: Store data locally when network is lost and sync later.
- **Analytics**: Historical data analysis of delivery times and routes.

---

## Thank You!
**Ethio-Safeguard Team**
