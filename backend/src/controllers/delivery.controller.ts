import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { io } from '../index';

export const getAssignedOrders = async (req: AuthRequest, res: Response) => {
    const rider_id = req.user?.id;
    try {
        const result = await pool.query(
            `SELECT o.*, json_agg(
        json_build_object('product_id', oi.product_id, 'quantity', oi.quantity,
        'unit_price', oi.unit_price, 'name', p.name)
      ) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.rider_id = $1 AND o.status NOT IN ('delivered', 'cancelled')
      GROUP BY o.id ORDER BY o.created_at DESC`,
            [rider_id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

export const updateDeliveryStatus = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['picked_up', 'on_the_way', 'delivered'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Estado inválido' });
    }

    try {
        const result = await pool.query(
            'UPDATE orders SET status = $1 WHERE id = $2 AND rider_id = $3 RETURNING *',
            [status, id, req.user?.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        const updatedOrder = result.rows[0];

        // Notificar al cliente y negocio
        io.to(`order_${id}`).emit('order_status_updated', updatedOrder);
        io.to('business').emit('order_status_updated', updatedOrder);

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

export const updateRiderLocation = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { lat, lng } = req.body;

    try {
        // Notificar ubicación en tiempo real al cliente
        io.to(`order_${id}`).emit('rider_location_updated', {
            orderId: id,
            lat,
            lng
        });

        res.json({ message: 'Ubicación actualizada' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

export const getRiders = async (req: AuthRequest, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email FROM users WHERE role = $1',
            ['rider']
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};