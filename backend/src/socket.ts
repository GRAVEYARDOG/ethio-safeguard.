import { Server, Socket } from 'socket.io';
import { redisClient, redisSubscriber } from './redis';
import { Location } from './models/Location';

export const setupSocket = (io: Server) => {
    // Subscribe to Redis channel for updates from other instances
    redisSubscriber.subscribe('location-update', (message) => {
        const data = JSON.parse(message);
        // Broadcast to local clients connected to this instance
        io.to('dashboard').emit('location-update', data);
    });

    // Fix: Subscribe to mission-assignment to forward to local drivers
    redisSubscriber.subscribe('mission-assignment', (message) => {
        const mission = JSON.parse(message);
        console.log('socket.ts: Received mission-assignment from REDIS. Forwarding to local drivers room.');
        io.to('drivers').emit('mission-assigned', mission);

        // DEBUG: Ensure this node ALSO broadcasts the debug signal
        io.emit('mission-debug', { msg: 'Global Broadcast (From Redis)', target: mission.driverId });
    });

    io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id);

        // Join room based on role
        socket.on('join-dashboard', () => {
            socket.join('dashboard');
            console.log(`Socket ${socket.id} joined dashboard`);
        });

        socket.on('register-driver', (driverId: string) => {
            socket.join('drivers');
            console.log(`Driver ${driverId} registered on socket ${socket.id}`);
        });

        // Driver sends location update
        socket.on('update-location', async (data: { driverId: string; lat: number; lng: number }) => {
            console.log('Received location:', data);

            // 1. DIRECT BROADCAST (Bypass Redis for immediate local update)
            io.to('dashboard').emit('location-update', data);

            // 2. Save to MongoDB (Persistence)
            try {
                await Location.create({
                    driverId: data.driverId,
                    lat: data.lat,
                    lng: data.lng
                });
            } catch (err) {
                console.error('Error saving location:', err);
            }

            // 3. Publish to Redis (Fault Tolerance / Scalability)
            // This ensures if we have multiple backend instances, all dashboards get the update
            try {
                await redisClient.publish('location-update', JSON.stringify(data));
            } catch (err) {
                console.error('Redis publish error (ignoring):', err);
            }
        });

        // Driver Actions (Milestone, Completed) - Broadcast to Dashboard
        socket.on('driver-action', (data: { type: 'MILESTONE' | 'COMPLETED', driverId: string, requestId: string, payload?: any }) => {
            console.log('Received driver action:', data);
            io.to('dashboard').emit('driver-action', data);
        });

        // Sender assigns a mission to a driver
        socket.on('assign-mission', async (mission: any, callback?: (msg: string) => void) => {
            console.log('SERVER: Received mission assignment:', mission);
            if (callback) callback('Server received mission');

            // 1. Direct broadcast to drivers room (so the specific driver gets it)
            const room = io.sockets.adapter.rooms.get('drivers');
            console.log(`SERVER: Emitting mission to 'drivers' room. Driver Count: ${room ? room.size : 0}`);
            if (room) {
                console.log('Socket IDs in drivers room:', [...room]);
            } else {
                console.log('WARNING: drivers room is empty!');
            }
            io.to('drivers').emit('mission-assigned', mission);
            // DEBUG: Global broadcast to check if ANY socket receives it
            io.emit('mission-debug', { msg: 'Global Broadcast Check', target: mission.driverId });
            console.log('SERVER: Emitted mission-assigned to "drivers" room');

            // 2. Publish to Redis for other instances
            try {
                await redisClient.publish('mission-assignment', JSON.stringify(mission));
            } catch (err) {
                console.error('Redis publish error (ignoring):', err);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
