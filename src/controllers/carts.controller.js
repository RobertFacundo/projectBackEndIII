import mongoose from "mongoose";
import { cartService } from "../services/index.js";
import { createError } from "../utils/customError.js";
import errorDictionary from "../utils/errorDictionary.js";

const getAllCarts = async (req, res, next) => {
    try {
        const carts = await cartService.getAll();
        res.send({ status: "success", payload: carts });
    } catch (error) {
        next(createError("DATABASE_ERROR", errorDictionary.DATABASE_ERROR, error))
    }
};

const getCart = async (req, res, next) => {
    try {
        const cartId = req.params.cid;
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return next(createError("INVALID_PARAM", errorDictionary.INVALID_PARAM));
        }

        const cart = await cartService.getBy({ _id: cartId });
        if (!cart) {
            return next(createError("CART_NOT_FOUND", errorDictionary.CART_NOT_FOUND));
        }
        res.send({ status: 'success', payload: cart });
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error));
    }
};

const createCart = async (req, res, next) => {
    try {
        console.log(req.body);
        const { user } = req.body;

        // Verificar si el usuario está presente
        if (!user) {
            return next(createError("INVALID_PARAM", errorDictionary.INVALID_PARAM));
        }

        // Verificar si el usuario ya tiene un carrito asociado
        const existingCart = await cartService.getBy({ user });

        if (existingCart) {
            // Si ya existe un carrito para el usuario, retornar un mensaje de error
            return next(createError("CART_ALREADY_EXISTS", errorDictionary.CART_ALREADY_EXISTS));
        }

        // Crear un carrito vacío solo con el usuario
        const newCart = await cartService.create({ user, products: [] }); // Sin productos por ahora
        console.log("Nuevo carrito creado:", newCart);
        res.status(201).send({ status: 'success', payload: newCart });

    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error));
    }
}

const updateCart = async (req, res, next) => {
    try {
        const cartId = req.params.cid;
        const updateBody = req.body;
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return next(createError('INVALID_PARAM', errorDictionary.INVALID_PARAM));
        }
        const cart = await cartService.getBy({ _id: cartId });
        if (!cart) {
            return next(createError('CART_NOT_FOUND', errorDictionary.CART_NOT_FOUND));
        }
        await cartService.update(cartId, updateBody);
        res.send({ status: 'success', message: 'Cart update', updateBody });
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error))
    }
};

const deleteCart = async (req, res, next) => {
    try {
        const cartId = req.params.cid;
        if (!mongoose.Types.ObjectId.isValid(cartId)) {
            return next(createError('INVALID_PARAM', errorDictionary.INVALID_PARAM));
        }
        const cart = await cartService.getBy({ _id: cartId });
        if (!cart) {
            return next(createError('CART_NOT_FOUND', errorDictionary.CART_NOT_FOUND));
        }
        await cartService.delete(cartId);
        res.send({ status: 'success', message: 'Cart eliminado' });
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error))
    }
};

export default {
    getAllCarts,
    getCart,
    createCart,
    updateCart,
    deleteCart
}