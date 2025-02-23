import mongoose from "mongoose";
import { productService } from "../services/index.js";
import { createError } from "../utils/customError.js";
import errorDictionary from "../utils/errorDictionary.js";

const getAllProducts = async (req, res, next) => {
    try {
        const products = await productService.getAll();
        const user = req.session.user;

        if(req.accepts('application/json')){
            return res.send({ status: 'success', payload: products });
        }else{
           return res.render("home", {
                title: "Página de Inicio",
                user,  
                products 
            });
        }
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error))
    }
};

const getProduct = async (req, res, next) => {
    try {
        const productId = req.params.pid;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(createError('INVALID_PARAM', errorDictionary.INVALID_PARAM, new Error('El parametro PID no es un ObjectId valido')));
        }

        const product = await productService.getBy({ _id: productId });
        if (!product) {
            return next(createError('PRODUCT_NOT_FOUND', errorDictionary.PRODUCT_NOT_FOUND));
        }
        res.send({ status: 'success', payload: product });
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error));
    }
};

const createProduct = async (req, res, next) => {
    try {
        const { name, price, description, stock, category } = req.body

        if (!name || !price || !description || !stock || !category) {
            return next(createError('INVALID_PARAM', errorDictionary.INVALID_PARAM, new Error('Todos los campos son obligatorios')));
        }

        const newProduct = { name, price, description, stock, category };
        const result = await productService.create(newProduct);
        res.status(201).send({ status: 'success', payload: result });
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error));
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const productId = req.params.pid;
        const updateBody = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(createError('INVALID_PARAM', errorDictionary.INVALID_PARAM, new Error('PID no válido')));
        }

        const product = await productService.getBy({ _id: productId });
        if (!product) {
            return next(createError('PRODUCT_NOT_FOUND', errorDictionary.PRODUCT_NOT_FOUND));
        }

        await productService.update(productId, updateBody);
        res.send({ status: 'success', message: 'product updated', updateBody });
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error));
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const productId = req.params.pid;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(createError('INVALID_PARAM', errorDictionary.INVALID_PARAM, new Error('PID no válido')));
        }

        const product = await productService.getBy({ _id: productId });
        if (!product) {
            return next(createError('PRODUCT_NOT_FOUND', errorDictionary.PRODUCT_NOT_FOUND));
        }

        await productService.delete(productId);
        res.send({ status: 'success', message: 'Product eliminado' });
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error));
    }
};

export default {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
}