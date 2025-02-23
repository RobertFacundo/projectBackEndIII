import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import mongoose from "mongoose";
import cartModel from "../dao/models/carts.js";
import jwt from 'jsonwebtoken';
import passport from "passport";
import UserDTO from '../dto/User.dto.js';

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });
        const exists = await usersService.getUserByEmail(email);
        if (exists) return res.status(400).send({ status: "error", error: "User already exists" });
        const hashedPassword = await createHash(password);
        const user = {
            first_name,
            last_name,
            email,
            password: hashedPassword
        }
        let result = await usersService.create(user);

        const newCart = await cartModel.create({
            user: result._id,
            products: []
        });
        result.cart = newCart._id;

        await usersService.update(result._id, result);

        if (req.is('json')) {
            return res.status(201).send({
                status: "success",
                message: 'Usuario registrado exitosamente',
                payload: result._id
            });
        } else {
            return res.redirect('/login');
        }
    } catch (error) {
        res.status(500).send({ status: "error", error: "Error", message: error.message });
    }
}

const login = async (req, res, next) => {

    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).send({ status: 'error', error: info.message });
        }

        try {
            req.login(user, async (err) => {
                if (err) {
                    console.error('Error al iniciar sesión:', err);
                    return next(err);
                }

                req.session.user = user

                user.last_connection = new Date();
                await user.save();

                const userDto = UserDTO.getUserTokenFrom(user);
                if (!userDto) {
                    return res.status(500).send({ status: 'error', error: 'Error generando el token JWT' });
                }

                const token = jwt.sign(userDto, process.env.JWT_SECRET, { expiresIn: '1h' });

                res.cookie('coderCookie', token, { maxAge: 3600000, httpOnly: true });

                if (req.is('json')) {
                    return res.status(200).send({
                        status: 'success',
                        message: 'Logged in',
                        user: {
                            email: user.email,
                            name: `${user.first_name} ${user.last_name}`,
                            role: user.role,
                            id: user._id,
                            cart: user.cart,
                            documents: user.documents
                        },
                        token,
                    });
                } else {
                    return res.redirect('/home');
                }
            });
        } catch (error) {
            return res.status(500).send({ status: 'error', error: 'Error generando el token JWT' });
        }
    })(req, res, next); 
};

const current = async (req, res) => {
    const cookie = req.cookies['coderCookie'];

    try {
        const user = jwt.verify(cookie, process.env.JWT_SECRET);
        if (user) {
            return res.send({ status: "success", payload: user });
        }
    } catch (err) {
        return res.status(403).send({ status: "error", error: 'Forbidden' });
    }
}

const unprotectedLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });

        const user = await usersService.getUserByEmail(email);
        if (!user) return res.status(404).send({ status: "error", error: "User doesn't exist" });

        const isValidPassword = passwordValidation(password, user.password);
        if (!isValidPassword) return res.status(400).send({ status: "error", error: "Incorrect password" });

        const token = jwt.sign({
            id: user._id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            age: user.age,
        }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie('unprotectedCookie', token, { maxAge: 3600000, httpOnly: true }).send({ status: "success", message: "Unprotected Logged in" })
    } catch (error) {
        res.status(500).send({ status: "error", error: "Internal server error" });
    }
}
const unprotectedCurrent = async (req, res) => {
    const token = req.cookies['coderCookie'];
    const guestToken = req.cookies['unprotectedCookie'];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = new mongoose.Types.ObjectId(decoded.id);
            const user = await usersService.getUserById(userId);

            if (!user) {
                return res.send({
                    status: "success",
                    payload: {
                        email: "unprotectedUser@example.com",
                        name: "Unprotected User",
                        role: "guest",
                    }
                });
            }

            const fullName = `${user.first_name} ${user.last_name}`;

            return res.send({
                status: "success",
                payload: {
                    email: user.email,
                    name: fullName,
                    role: user.role,
                }
            });
        } catch (err) {
            return res.status(400).send({ status: "error", error: "Invalid token" });
        }
    }

    if (guestToken) {
        return res.send({
            status: "success",
            payload: {
                email: "guest@example.com",
                name: "Guest User",
                role: "guest",
            }
        });
    }

    return res.send({
        status: "success",
        payload: {
            email: "guest@example.com",
            name: "Guest User",
            role: "guest",
        }
    });
}

export default {
    current,
    login,
    register,
    current,
    unprotectedLogin,
    unprotectedCurrent
}