import mongoose from "mongoose";
import { usersService } from "../services/index.js";
import { createError } from "../utils/customError.js";
import errorDictionary from "../utils/errorDictionary.js";

const getAllUsers = async (req, res, nexy) => {
    try {
        const users = await usersService.getAll();
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

        const hashedPassword = await createHash(password);
        const newUser = {
            first_name,
            last_name,
            email,
            password: hashedPassword
        };

        const result = await usersService.create(newUser);
        res.status(201).send({ status: "success", payload: result });

    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error));
    }
};

const getUser = async (req, res, next) => {
    try {
        const userId = req.params.uid;


        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return next(createError('INVALID_PARAM', errorDictionary.INVALID_PARAM, new Error('El parámetro UID no es un ObjectId válido.')));
        }

        const user = await usersService.getUserById(userId);
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

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser,
    createUser
}