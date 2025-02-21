import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import mongoose from "mongoose";
import cartModel from "../dao/models/carts.js";
import jwt from 'jsonwebtoken';
import passport from "passport";
import UserDTO from '../dto/User.dto.js';

const register = async (req, res) => {
    console.log('inicializando register')
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
        console.log(result, 'result dedsde el register')

        const newCart = await cartModel.create({
            user: result._id,
            products: []
        });
        result.cart = newCart._id;

        await usersService.update(result._id, result);

        res.status(201).send({ status: "success",message:'Usuario registrado cexitosamente', payload: result._id });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ status: "error", error: "Error", message: error.message });
    }
}

const login = async (req, res, next) => {

    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            console.error('Error en autenticación:', err);
            return next(err); // Manejo de errores
        }

        if (!user) {
            console.log('Usuario no encontrado o contraseña incorrecta');
            return res.status(401).send({ status: 'error', error: info.message });
        }

        try {
            req.login(user, async (err) => {
                if (err) {
                    console.error('Error al iniciar sesión:', err);
                    return next(err);
                }

                user.last_connection = new Date();
                await user.save();

                // Generación del DTO y el token JWT
                const userDto = UserDTO.getUserTokenFrom(user);
                if (!userDto) {
                    return res.status(500).send({ status: 'error', error: 'Error generando el token JWT' });
                }

                // Firmar el token con JWT
                const token = jwt.sign(userDto, process.env.JWT_SECRET, { expiresIn: '1h' });

                // Enviar el token en la cookie
                res.cookie('coderCookie', token, { maxAge: 3600000, httpOnly: true });

                // Responder con éxito y los detalles del usuario
                return res.send({
                    status: 200,
                    message: 'Logged in',
                    user: {
                        email: user.email,
                        name: `${user.first_name} ${user.last_name}`,
                        role: user.role,
                        id: user._id,
                    },
                    token,
                });
            });
        } catch (error) {
            return res.status(500).send({ status: 'error', error: 'Error generando el token JWT' });
        }
    })(req, res, next);  // Invocar Passport con el req, res y next
};

const current = async (req, res) => {
    const cookie = req.cookies['coderCookie'];

    try {
        // Usa la misma clave secreta en ambos lugares
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