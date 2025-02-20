import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import { productService, usersService } from "../services/index.js";
import { createError } from "../utils/customError.js";
import errorDictionary from "../utils/errorDictionary.js";
import cartModel from "../dao/models/carts.js";

const getAllUsers = async (req, res, next) => {
    try {
        const users = await usersService.getAll().populate('cart');
        res.send({ status: 'success', payload: users });
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, Error));
    }
}
const createUser = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return next(createError('INVALID_PARAM', errorDictionary.INVALID_PARAM, new Error('Todos los campos son obligatorios.')));
        }

        const exists = await usersService.getUserByEmail(email);
        if (exists) {
            return next(createError('USER_ALREADY_EXISTS', errorDictionary.USER_ALREADY_EXISTS, new Error('El usuario ya existe.')));
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            first_name,
            last_name,
            email,
            password: hashedPassword
        };

        const createdUser = await usersService.create(newUser);

        const newCart = await cartModel.create({
            user: createdUser._id,
            products: []
        });
        if (!newCart) {
            return next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, new Error('No se pudo crear el carrito.')));
        }

        createdUser.cart = newCart._id;
        await usersService.update(createdUser._id, createdUser);

        const populatedUser = await usersService.getBy({ _id: createdUser._id }).populate('cart')
        if (!populatedUser || !populatedUser.cart) {
            return next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, new Error('El usuario no tiene un carrito válido.')));
        }

        res.status(201).send({ status: 'success', payload: populatedUser })

    } catch (error) {
        console.error(error.message);
        if (error && error.message) {
            next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, new Error(error.message)));
        } else {
            // Si no tiene 'message', enviar un mensaje genérico
            next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, new Error('Hubo un problema en la base de datos.')));
        }

    }
};

const getUser = async (req, res, next) => {
    try {
        const userId = req.params.uid;


        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return next(createError('INVALID_PARAM', errorDictionary.INVALID_PARAM, new Error('El parámetro UID no es un ObjectId válido.')));
        }

        const user = await usersService.getUserById(userId).populate('cart');
        if (!user) {
            return next(createError('USER_NOT_FOUND', errorDictionary.USER_NOT_FOUND));
        }

        res.send({ status: "success", payload: user });
    } catch (error) {
        const dbError = createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR.message, error);
        next(dbError);
    }
}

const updateUser = async (req, res, next) => {
    try {
        const userId = req.params.uid;
        const updateBody = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return next(createError('INVALID_PARAM', errorDictionary.INVALID_PARAM, new Error('UID no válido')));
        }

        const user = await usersService.getUserById(userId);
        if (!user) {
            return next(createError('USER_NOT_FOUND', errorDictionary.USER_NOT_FOUND));
        }

        await usersService.update(userId, updateBody);
        res.send({ status: 'success', message: 'User updated', updateBody });
    } catch (error) {
        next(createError('DATABASE_ERROR', error.errorDictionary.DATABASE_ERROR, error));
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.uid;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return next(createError('INVALID_PARAM', errorDictionary.INVALID_PARAM, new Error('UID no válido')));
        }

        const user = await usersService.getUserById(userId);
        console.log(user, ' controller test')
        if (!user) {
            return next(createError('USER_NOT_FOUND', errorDictionary.USER_NOT_FOUND));
        }

        await usersService.delete(userId);
        res.send({ status: 'success', message: 'Usuario eliminado' });
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error));
    }
}

const addProductToCart = async (req, res, next) => {
    try {
        const userId = req.params.uid;
        const productId = req.params.pid;

        const product = await productService.getBy({ _id: productId });
        if (!product) {
            return next(createError('PRODUCT_NOT_FOUND', errorDictionary.PRODUCT_NOT_FOUND));
        }

        const user = await usersService.getUserById(userId);
        if (!user) {
            return next(createError('USER_NOT_FOUND', errorDictionary.USER_NOT_FOUND));
        }

        const cart = await cartModel.findById(user.cart);
        if (!cart) {
            return next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, new Error('No se encontró el carrito del usuario')))
        }

        const productInCart = cart.products.find(p => p.product.toString() === productId);

        if (productInCart) {
            productInCart.quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 })
        }

        await cart.save();
        res.send({ status: 'success', message: 'Producto agregado al carro', payload: cart })
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error));
    }
}

const deleteProductFromCart = async (req, res, next) => {
    try {
        const userId = req.params.uid;
        const productId = req.params.pid;

        const product = await productService.getBy({ _id: productId });
        if (!product) {
            return next(createError('PRODUCT_NOT_FOUND', errorDictionary.PRODUCT_NOT_FOUND));
        }

        const user = await usersService.getUserById(userId);
        if (!user) {
            return next(createError('USER_NOT_FOUND', errorDictionary.USER_NOT_FOUND));
        }

        const cart = await cartModel.findById(user.cart);
        if (!cart) {
            return next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, new Error('No se encontró el carro')));
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);

        if (productIndex === -1) {
            return next(createError('PRODUCT_NOT_IN_CART', errorDictionary.PRODUCT_NOT_IN_CART))
        }

        cart.products.splice(productIndex, 1);

        await cart.save();

        res.send({ status: 'success', message: 'Producto eliminado del carro', payload: cart });
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error))
    }
}

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser,
    createUser,
    addProductToCart,
    deleteProductFromCart
}