const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket.io Multiplayer Sync Logic
io.on('connection', (socket) => {
    console.log(`📡 New AR Client Connected: ${socket.id}`);

    socket.on('join-ar-session', (sessionId) => {
        socket.join(sessionId);
        console.log(`🚪 Client ${socket.id} joined AR Session: ${sessionId}`);
    });

    socket.on('broadcast-ar-state', (data) => {
        // Broadcast to everyone in that session EXCEPT the sender
        socket.to(data.sessionId).emit('sync-ar-state', data.state);
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Client Disconnected: ${socket.id}`);
    });
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Firebase Admin Initialization
try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
    console.log('✅ Firebase Admin Initialized');
} catch (err) {
    console.error('❌ Firebase Admin Initialization Error:', err.message);
}

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const restaurantRoutes = require('./routes/restaurant');
const customerRoutes = require('./routes/customer');
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/customer', customerRoutes);

// Basic Route for testing
app.get('/api/health', (req, res) => {
    res.json({ status: 'success', message: 'AR Food Viewer SaaS Server is running' });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
