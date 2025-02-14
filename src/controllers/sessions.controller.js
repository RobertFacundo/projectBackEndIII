import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from 'jsonwebtoken';
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
        console.log(result);
        res.send({ status: "success", payload: result._id });
    } catch (error) {

    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });
    const user = await usersService.getUserByEmail(email);
    if (!user) return res.status(404).send({ status: "error", error: "User doesn't exist" });
    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) return res.status(400).send({ status: "error", error: "Incorrect password" });
    const userDto = UserDTO.getUserTokenFrom(user);
    const token = jwt.sign(userDto, 'tokenSecretJWT', { expiresIn: "1h" });
    res.cookie('coderCookie', token, { maxAge: 3600000 }).send({ status: "success", message: "Logged in" })
}

const current = async (req, res) => {
    const cookie = req.cookies['coderCookie']
    const user = jwt.verify(cookie, 'tokenSecretJWT');
    if (user)
        return res.send({ status: "success", payload: user })
}

const unprotectedLogin = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });
    const user = await usersService.getUserByEmail(email);
    console.log(user)
    if (!user) return res.status(404).send({ status: "error", error: "User doesn't exist" });
    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) return res.status(400).send({ status: "error", error: "Incorrect password" });
    const token = jwt.sign({
        id: user._id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        age: user.age,
    }, 'tokenSecretJWT', { expiresIn: "1h" });
    res.cookie('unprotectedCookie', token, { maxAge: 3600000, httpOnly: true }).send({ status: "success", message: "Unprotected Logged in" })
}
const unprotectedCurrent = async (req, res) => {
    const token = req.cookies['unprotectedCookie']; 

    if (!token) {
        return res.status(400).send({ status: "error", error: "No token found" });
    }

    try {
        const decoded = jwt.verify(token, 'tokenSecretJWT');
        const user = await usersService.getUserById(decoded.id);  

        if (!user) {
            return res.status(404).send({ status: "error", error: "User not found" });
        }

        const fullName = `${user.first_name} ${user.last_name}`;
        res.send({
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
export default {
    current,
    login,
    register,
    current,
    unprotectedLogin,
    unprotectedCurrent
}