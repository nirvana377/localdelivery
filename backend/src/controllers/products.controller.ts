import { Request, Response } from 'express';
import pool from '../config/database';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM products ORDER BY category, name'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    const { name, description, price, category, image_url, available } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO products (name, description, price, category, image_url, available)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [name, description, price, category, image_url, available ?? true]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, price, category, image_url, available } = req.body;
    try {
        const result = await pool.query(
            `UPDATE products SET name=$1, description=$2, price=$3,
       category=$4, image_url=$5, available=$6
       WHERE id=$7 RETURNING *`,
            [name, description, price, category, image_url, available, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};