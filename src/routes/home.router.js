import express from 'express';
import { productService } from '../services/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const products = await productService.getAll();
        const productsCleaned = products.map(product => ({
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl || 'default-image.jpg',
            _id: product._id
        }));

        res.render('home', {
            user: {
                ...req.session.user,
                _id: req.session.user._id,
                cartId: req.session.user.cart,
                name: `${req.session.user.first_name} ${req.session.user.last_name}`
            },
            products: productsCleaned,
            title: 'Ecommerce BackEndIII'
        });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).send("Error al obtener productos");
    }
});

export default router;
