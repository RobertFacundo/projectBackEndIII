import { Router } from 'express';
import cartsController from '../controllers/carts.controller.js';

const router = Router();

router.get('/', cartsController.getAllCarts);
router.get('/:cid', cartsController.getCart);
router.post('/', cartsController.createCart);
router.put('/:cid', cartsController.updateCart);
router.delete('/:cid', cartsController.deleteCart);

export default router;