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

        const { name, email, password } = req.body;

        // SERVER-SIDE VALIDATION
        // 1. Sanitize & Validate Name
        const nameTrimmed = name?.trim().replace(/\s+/g, ' ');
        const nameWords = nameTrimmed?.split(' ') || [];
        const nameRegex = /^[A-Za-z\s]+$/;

        if (!nameTrimmed || !nameRegex.test(nameTrimmed) || nameWords.length < 2 || nameWords.length > 4) {
            return res.status(400).json({ error: 'Strict Validation: Invalid name format. Use 2-4 words, letters only.' });
        }

        if (name !== nameTrimmed) {
            return res.status(400).json({ error: 'Strict Validation: Multiple spaces detected in name.' });
        }

        // 2. Validate Email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Strict Validation: Invalid email format.' });
        }

        // 3. Password length check
        if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Strict Validation: Password must be at least 8 characters.' });
        }

        // 4. Role-Specific Section Validation
        const { role, truckDetails, organizationDetails } = req.body;
        const sectionRegex = /^[A-Za-z0-9\s-]+$/;
        const multiSpaceRegex = /\s{2,}/;

        if (role === 'DRIVER' && truckDetails) {
            const { driverLicense, licensePlate, model } = truckDetails;
            if (!driverLicense || !sectionRegex.test(driverLicense) || multiSpaceRegex.test(driverLicense)) {
                return res.status(400).json({ error: 'Strict Validation: Invalid Driver License format.' });
            }
            if (!licensePlate || !sectionRegex.test(licensePlate) || multiSpaceRegex.test(licensePlate)) {
                return res.status(400).json({ error: 'Strict Validation: Invalid License Plate format.' });
            }
            if (!model || !sectionRegex.test(model) || multiSpaceRegex.test(model)) {
                return res.status(400).json({ error: 'Strict Validation: Invalid Truck Model format.' });
            }
        } else if (role === 'SENDER' && organizationDetails) {
            const { name: orgName, regNumber, headquarters } = organizationDetails;
            if (!orgName || !sectionRegex.test(orgName) || multiSpaceRegex.test(orgName)) {
                return res.status(400).json({ error: 'Strict Validation: Invalid Organization Name format.' });
            }
            if (!regNumber || !sectionRegex.test(regNumber) || multiSpaceRegex.test(regNumber)) {
                return res.status(400).json({ error: 'Strict Validation: Invalid Registration Number format.' });
            }
            if (!headquarters || !sectionRegex.test(headquarters) || multiSpaceRegex.test(headquarters)) {
                return res.status(400).json({ error: 'Strict Validation: Invalid Headquarters format.' });
            }
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'Identity already registered in system.' });
        }

        // Sanitize before save
        req.body.name = nameTrimmed;
        req.body.email = email.trim().toLowerCase();

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
