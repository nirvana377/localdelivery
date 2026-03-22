import { Server, Socket } from 'socket.io';

export const initSocket = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Cliente conectado: ${socket.id}`);

        // Unirse a sala según rol
        socket.on('join_room', (room: string) => {
            socket.join(room);
            console.log(`📦 Socket ${socket.id} unido a sala: ${room}`);
        });

        // Nuevo pedido — notifica al negocio
        socket.on('new_order', (order) => {
            io.to('business').emit('order_received', order);
        });

        // Actualizar estado del pedido — notifica al cliente y repartidor
        socket.on('update_order_status', (data) => {
            io.to(`order_${data.orderId}`).emit('order_status_updated', data);
            io.to('rider').emit('order_status_updated', data);
        });

        // Ubicación del repartidor en tiempo real
        socket.on('rider_location', (data) => {
            io.to(`order_${data.orderId}`).emit('rider_location_updated', data);
        });

        socket.on('disconnect', () => {
            console.log(`❌ Cliente desconectado: ${socket.id}`);
        });
    });
};