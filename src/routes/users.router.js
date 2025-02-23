import { Router } from 'express';
import usersController from '../controllers/users.controller.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import uploader from '../utils/uploader.js';

const router = Router();

router.post('/', usersController.createUser);
router.get('/', usersController.getAllUsers);
router.get('/:uid', usersController.getUser);
router.put('/:uid', usersController.updateUser);
router.delete('/:uid', usersController.deleteUser);

router.post('/:uid/cart/:pid', authenticateJWT, usersController.addProductToCart);
router.delete('/:uid/cart/:pid', authenticateJWT, usersController.deleteProductFromCart);
router.get('/:uid/cart/:cartId', authenticateJWT, usersController.getCartByUserIdAndCartId)

router.post('/:uid/documents', uploader, usersController.uploadDocuments)


export default router;
