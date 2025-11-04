require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http'); // Import http module
const { Server } = require('socket.io'); // Import Server from socket.io
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const productRoutes = require('./routes/productRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const profileRoutes = require('./routes/profileRoutes');
const orderRoutes = require('./routes/orderRoutes');

const cartRoutes = require('./routes/cartRoutes');

const messageRoutes = require('./routes/messageRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const rfqRoutes = require('./routes/rfqRoutes'); // Import new RFQ routes
const auditRoutes = require('./routes/auditRoutes'); // Import audit routes
const bidRoutes = require('./routes/bidRoutes');

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Allow frontend origin
    methods: ['GET', 'POST'],
  },
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // You can add more socket event listeners here
});

// Make io accessible to controllers
app.set('socketio', io);

// ---------- Middleware ----------
app.use(cors({ origin: 'http://localhost:5173', credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] })); // configure origins if needed
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/farmer/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api/cart', cartRoutes);

app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/rfq', rfqRoutes); // Use new RFQ routes
app.use('/api/audit', auditRoutes); // Use audit routes
app.use('/api/bids', bidRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ---------- Error Handler ----------
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(err.statusCode || 500).json({ message: err.message || 'Internal server error' });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => { // Use server.listen instead of app.listen
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to DB and start server:', error);
    process.exit(1);
  }
};

startServer();