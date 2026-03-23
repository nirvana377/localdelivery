import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';
import ordersRoutes from './routes/orders.routes';
import productsRoutes from './routes/products.routes';
import deliveryRoutes from './routes/delivery.routes';
import { initSocket } from './config/socket';

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    'http://localhost:5173',
    'https://localdelivery.vercel.app',
    /\.vercel\.app$/
];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/delivery', deliveryRoutes);

// Socket.io
initSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

export { io };