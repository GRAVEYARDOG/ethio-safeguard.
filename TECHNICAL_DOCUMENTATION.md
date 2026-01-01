# Ethio-Safeguard Technical Documentation

## 1. Project Overview
Ethio-Safeguard is a real-time tracking system designed to monitor aid truck deliveries. It facilitates coordination between Logistics Managers (Senders) and Truck Drivers, ensuring transparency and efficiency in aid distribution.

## 2. Getting Started

### Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v18 or higher)
- **Redis** (for managing real-time location state)
- **MongoDB** (or compatible database if configured)

### Installation
1. Clone the repository to your local machine.
2. Navigate to the project root directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Navigate to the `backend` directory and install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

### Environment Variables
Create a `.env` file in the `backend` directory (if not already present) and configure:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Running the Application
1. **Start the Backend Server**:
   ```bash
   cd backend
   npm start
   # or for development with auto-restart:
   npm run dev
   ```
2. **Start the Frontend Application**:
   In a new terminal, from the project root:
   ```bash
   npm run dev
   ```
   The application will typically be accessible at `http://localhost:5173`.

## 3. Architecture

### Frontend (Client)
Built with **React** and **Vite**, the frontend provides three main views:
- **Sender Dashboard**: Monitors active trucks on a map, manages driver requests.
- **Driver Dashboard**: Receives requests, reports status updates, and sends location data.
- **Admin Dashboard**: Manages user roles and system status.

**Key Libraries**:
- `react-leaflet`: For rendering the interactive map.
- `socket.io-client`: Establishes a persistent WebSocket connection to the server for real-time updates.

### Backend (Server)
Built with **Node.js** and **Express**, the backend handles API requests and WebSocket events.
- **`server.ts`**: Entry point. Sets up Express app, HTTP server, and Socket.io.
- **`socket.ts`**: Handles WebSocket events like `connect`, `disconnect`, `updateLocation`, `requestDriver`.
- **`redis.ts`**: Manages connection to the Redis store for fast retrieval of transient driver data (location, status).

### Database Model
- **User Model**: Stores user credentials, roles (`sender`, `driver`, `admin`), and trucks details.

## 4. API Reference

### REST Endpoints
- `POST /api/register`: Register a new user (Sender/Driver).
- `POST /api/login`: Authenticate a user.
- `GET /api/users`: List all users (Admin only).
- `PUT /api/users/:id/status`: Update user approval status.
- `PUT /api/users/:id/truck-status`: Update a truck's current operational status.

### Socket Events
- **`join`**: specific room (e.g., `driver_{id}`).
- **`locationUpdate`**: Driver sends `{ lat, lng }`.
- **`requestDriver`**: Sender initiates a job request.
- **`acceptRequest`**: Driver accepts a job.

## 5. Folder Structure
- **`/src`**: Frontend source code.
    - **`/views`**: Page components (Dashboards, Login, Register).
    - **`/components`**: Reusable UI parts.
- **`/backend`**: Backend source code.
    - **`/src/models`**: Database schemas.
    - **`/src/redis.ts`**: Redis utility.
    - **`/src/socket.ts`**: Socket logic.

---
*Created by Antigravity*
