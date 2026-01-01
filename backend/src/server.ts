import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectRedis } from './redis';
import { connectMongo } from './models/Location';
import { setupSocket } from './socket';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for simplicity in dev, restrict in prod
        methods: ['GET', 'POST']
    }
});

// Health check
app.get('/health', (req, res) => {
    res.send('OK');
});

// -- AUTH & USER ROUTES --
import { User } from './models/User';

// Register
app.post('/api/register', async (req, res) => {
    try {
        console.log('--- REGISTER REQUEST ---');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        const existing = await User.findOne({ email: req.body.email });
        if (existing) {
            return res.status(400).json({ error: 'Identity already registered in system.' });
        }
        const user = await User.create(req.body);
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration protocol failed.' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        console.log('--- LOGIN REQUEST ---');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        const { email, password } = req.body;
        // In prod, use bcrypt.compare here
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: 'Strategic Identity not found.' });
        if (user.password && user.password !== password) return res.status(401).json({ error: 'Invalid security credentials.' });

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Authentication protocol failed.' });
    }
});

// Get Users (Admin)
app.get('/api/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Update Status (Approve)
app.put('/api/users/:id/status', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Status update failed.' });
    }
});

// Update Truck Status
app.put('/api/users/:id/truck-status', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (user && user.truckDetails) {
            user.truckDetails.currentStatus = req.body.status;
            await user.save();
            res.json(user);
        } else {
            res.status(404).json({ error: 'Unit not found.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Truck status update failed.' });
    }
});

const start = async () => {
    await connectRedis();
    await connectMongo();
    setupSocket(io);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start();
