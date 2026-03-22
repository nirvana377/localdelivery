import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { io } from '../index';

export const createOrder = async (req: AuthRequest, res: Response) => {
    const { items, delivery_address, payment_method } = req.body;
    const client_id = req.user?.id;

    try {
        // Calcular total
        let total = 0;
        for (const item of items) {
            const product = await pool.query('SELECT price FROM products WHERE id = $1', [item.product_id]);
            total += product.rows[0].price * item.quantity;
        }

        // Crear orden
        const orderResult = await pool.query(
            `INSERT INTO orders (client_id, total, delivery_address, payment_method, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
            [client_id, total, delivery_address, payment_method]
        );
        const order = orderResult.rows[0];

        // Crear items de la orden
        for (const item of items) {
            const product = await pool.query('SELECT price FROM products WHERE id = $1', [item.product_id]);
            await pool.query(
                `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
                [order.id, item.product_id, item.quantity, product.rows[0].price]
            );
        }

        // Notificar al negocio via Socket.io
        io.to('business').emit('order_received', order);

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
    try {
        let result;
        if (req.user?.role === 'client') {
            result = await pool.query(
                `SELECT o.*, json_agg(
          json_build_object('product_id', oi.product_id, 'quantity', oi.quantity,
          'unit_price', oi.unit_price, 'name', p.name)
        ) as items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.client_id = $1
        GROUP BY o.id ORDER BY o.created_at DESC`,
                [req.user.id]
            );
        } else {
            result = await pool.query(
                `SELECT o.*, json_agg(
          json_build_object('product_id', oi.product_id, 'quantity', oi.quantity,
          'unit_price', oi.unit_price, 'name', p.name)
        ) as items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        GROUP BY o.id ORDER BY o.created_at DESC`
            );
        }
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, rider_id } = req.body;

    try {
        const result = await pool.query(
            `UPDATE orders SET status = $1, rider_id = COALESCE($2, rider_id)
       WHERE id = $3 RETURNING *`,
            [status, rider_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        const updatedOrder = result.rows[0];

        // Notificar en tiempo real
        io.to(`order_${id}`).emit('order_status_updated', updatedOrder);
        io.to('rider').emit('order_status_updated', updatedOrder);

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT o.*, json_agg(
        json_build_object('product_id', oi.product_id, 'quantity', oi.quantity,
        'unit_price', oi.unit_price, 'name', p.name)
        ) as items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.id = $1
        GROUP BY o.id`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};