import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import { getDestination } from '../utils/uploader.js'
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

        let cart = await cartModel.findById(user.cart);
        if (!cart) {
            cart = await cartModel.create({
                products: [],
                user: userId 
            });

            user.cart = cart._id;
            await user.save();
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

        if (cart.products[productIndex].quantity > 1) {
            cart.products[productIndex].quantity -= 1;
        } else {
            cart.products.splice(productIndex, 1)
        }

        await cart.save();

        res.send({ status: 'success', message: 'Producto eliminado del carro', payload: cart });
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error))
    }
}

const uploadDocuments = async (req, res, next) => {
    const userId = req.params.uid;
    const files = req.files;

    if (!files || files.length === 0) {
        return next(createError('NOT_FILES_UPLOADED', errorDictionary.NOT_FILES_UPLOADED));
    }

    try {
        const user = await usersService.getUserById(userId);
        if (!user) {
            return next(createError('USER_NOT_FOUND', errorDictionary.USER_NOT_FOUND));
        }

        const documents = files.map(file => ({
            name: file.originalname,
            reference: `/public/${getDestination(file)}/${file.filename}`,
        }));

        user.documents.push(...documents);
        user.last_connection = new Date();

        await user.save();

        return res.status(200).send({
            status: 'success',
            message: 'Files subidos exitosamente',
            user: {
                id: user._id,
                documents: user.documents,
            }
        })
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error))
    }
}

const getCartByUserIdAndCartId = async (req, res, next) => {
    try {

        const { uid, cartId } = req.params;
        if (!uid || !cartId) {
            throw new Error('Faltan los parámetros del usuario o el carrito');
        }

        if (!mongoose.Types.ObjectId.isValid(uid) || !mongoose.Types.ObjectId.isValid(cartId)) {
            return res.status(400).json({ error: 'Uno de los IDs no es válido' });
        }

        const user = await usersService.getUserById(uid);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const cart = await cartModel.findById(cartId);
        if (!cart) {
            throw new Error('No se encontró el carrito');
        }
        const cartItems = await Promise.all(
            cart.products.map(async (item, index) => {
                console.log(`Buscando producto con ID: ${item.product} en índice ${index}`);
                const product = await productService.getBy(item.product);
                if (!product) {
                    console.error(`Producto con ID ${item.product} no encontrado en la BD.`);
                    return null; // Devolvemos null en caso de que el producto no exista
                }
                console.log(`Producto encontrado:`, product);
                return {
                    product: product,
                    quantity: item.quantity,
                    name: product.name,
                    price: product.price,
                }
            })
        )

        const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return res.status(200).json({ cartItems, totalPrice });
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser,
    createUser,
    addProductToCart,
    deleteProductFromCart,
    getCartByUserIdAndCartId,
    uploadDocuments
}