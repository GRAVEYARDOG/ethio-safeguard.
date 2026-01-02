# 🌍 Ethio-Safeguard
### Fault-Tolerant Real-Time Humanitarian Logistics Platform


Ethio-Safeguard is a production-grade logistics platform designed to coordinate humanitarian aid delivery in real-time. Built with a focus on **Fault Tolerance** and **High Availability**, the system ensures that aid reaches its destination even in the face of server failures or network instability.

---

## 🚀 Key Features

- **Real-Time GPS Tracking**: Live location broadcasting using Socket.io and Leaflet maps.
- **Strategic Displacement Form**: Formal mission assignment for Senders to deploy Drivers.
- **Verification Center**: Admin dashboard for screening and approving platform participants.
- **Mult-instance Sync**: Redis-backed synchronization allows horizontal scaling across multiple backends.
- **Self-Healing Architecture**: Automated reconnection logic for database and cache layers.

---

## 🏗️ Technical Architecture

The platform follows a modern **Client-Server** architecture with specialized infrastructure for resilience.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React + Vite + Leaflet | UI/UX & GPS Broadcasting |
| **Backend** | Node.js + Express | Application Logic & Websocket Server |
| **Real-Time** | Socket.io + Redis | Live Synch Across Instances |
| **Database** | MongoDB + Mongoose | Persistent Storage (Replica Sets) |
| **Load Balancer** | Nginx | Traffic Distribution & Failover |

---

## ☁️ Live Cloud Deployment

The project is fully hosted and accessible at the following URLs:
- **Live Website (Frontend)**: [ethio-safeguard.vercel.app](https://ethio-safeguard.vercel.app)
- **Production API (Backend)**: [ethio-safeguard-backend-production.up.railway.app](https://ethio-safeguard-backend-production.up.railway.app)
- **Database**: Managed via [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Real-time Engine**: Powered by [Upstash Redis](https://upstash.com)

---

## 🛡️ Fault Tolerance Demonstration (Chaos Testing)

Ethio-Safeguard is designed to survive infrastructure failures. You can demonstrate this using the following `docker-compose` commands:

1. **Server Failover**: `docker-compose stop backend-1` (Nginx instantly shifts traffic to backend-2).
2. **Database Resilience**: `docker-compose stop mongo` (App remains alive and retries connection).
3. **Self-Healing**: `docker-compose start mongo` (App reconnects automatically in 5s).
4. **Full Recovery**: `docker-compose up -d` (Restores 100% capacity).

---

## 🛠️ Local Setup

1. **Clone the repository**
2. **Environment Configuration**: Create a `.env` file from `.env.example`.
3. **Run with Docker**:
   ```bash
   docker-compose up --build
   ```
---

## 👥 Contributors
Built for a strategic logistics project by:
- **[Name : KALKIDAN GIRMA SEGAW ID NUMBER: 1510018]**
- **[Name : TUT GATWECH TUT ID NUMBER: 1501376]**

---
*Ethio-Safeguard: Saving lives through transparent logistics.*
