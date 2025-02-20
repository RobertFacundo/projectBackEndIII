import { Router } from 'express';
import usersController from '../controllers/users.controller.js';

const router = Router();

router.post('/', usersController.createUser);
router.get('/', usersController.getAllUsers);
router.get('/:uid', usersController.getUser);
router.put('/:uid', usersController.updateUser);
router.delete('/:uid', usersController.deleteUser);

router.post('/:uid/cart/:pid', usersController.addProductToCart);
router.delete('/:uid/cart/:pid', usersController.deleteProductFromCart);


export default router;
