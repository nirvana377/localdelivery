import { Router } from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/products.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authMiddleware, roleMiddleware(['business']), createProduct);
router.put('/:id', authMiddleware, roleMiddleware(['business']), updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware(['business']), deleteProduct);

export default router;