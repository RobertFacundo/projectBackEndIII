import { Router } from "express";
import { generateMockUsers } from '../utils/mockUsers.js';
import { generateMockProducts } from '../utils/mockProducts.js';
import userModel from "../dao/models/User.js";
import productModel from "../dao/models/Product.js";

const router = Router();

router.get('/mockingproducts', (req, res) => {
    const products = generateMockProducts(10);
    res.json(products);
});

router.get('/mockingusers', (req, res) => {
    const users = generateMockUsers(50);
    res.json(users);
});

router.post('/generateData', async (req, res) => {
    const { users = 0, pets = 0 } = req.body;

    try {
        const mockUsers = generateMockUsers(users);
        const mockProducts = generateMockProducts(pets)

        await userModel.insertMany(mockUsers);
        await productModel.insertMany(mockProducts);

        res.status(201).json({
            message: 'Datos generados e insertados exitosamente', 
            usersInserted: users,
            productsInserted: products
        });
    } catch (error) {
        res.status(400).json({ message: 'Error al generar datos', error: error.message })
    }
});

export default router;