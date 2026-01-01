
const API_URL = (process.env.VITE_API_URL ? `${process.env.VITE_API_URL}/api` : 'http://localhost:3000/api');

const DRIVER = {
    name: 'Kalkidan Driver',
    email: 'kalkidan27@gmail.com',
    password: 'kalkidan27',
    role: 'DRIVER',
    truckDetails: {
        licensePlate: 'AA-2-12345',
        model: 'Isuzu FSR',
        capacity: 5000,
        currentStatus: 'IDLE'
    }
};

const SENDER = {
    name: 'Tut Sender',
    email: 'tutgatwech25@gmail.com',
    password: 'gatwech25',
    role: 'SENDER',
    organizationDetails: {
        name: 'UNICEF Ethiopia',
        type: 'NGO'
    }
};

async function register(user) {
    try {
        console.log(`Registering ${user.email}...`);
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        const data = await res.json();

        if (data.error === 'Identity already registered in system.') {
            console.log(`✅ ${user.email} already exists.`);
            // If exists, we need to find ID to approve
            // For now, we assume they might be approved or we login to check. 
            // Better to login and check ID.
            return data;
        }

        console.log(`✅ Registered: ${user.email} (ID: ${data.id})`);

        // Approve User
        console.log(`Approving ${user.email}...`);
        await fetch(`${API_URL}/users/${data.id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'APPROVED' })
        });
        console.log(`✅ Approved ${user.email}`);

    } catch (err) {
        console.log(`❌ Failed to register ${user.email}:`, err.message);
    }
}

async function main() {
    await register(DRIVER);
    await register(SENDER);
}

main();
