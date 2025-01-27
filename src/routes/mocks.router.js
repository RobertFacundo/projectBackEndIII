import { Router } from "express";
import { generateMockUsers } from '../utils/mockUsers.js';
import { generateMockPets } from '../utils/mockPets.js';
import userModel from "../dao/models/User.js";
import petModel from "../dao/models/Pet.js";

const router = Router();

router.get('/mockingpets', (req, res) => {
    const pets = generateMockPets(10);
    res.json(pets);
});

router.get('/mockingusers', (req, res) => {
    const users = generateMockUsers(50);
    res.json(users);
});

router.post('/generateData', async (req, res) => {
    const { users = 0, pets = 0 } = req.body;

    try {
        const mockUsers = generateMockUsers(users);
        const mockPets = generateMockPets(pets)

        await userModel.insertMany(mockUsers);
        await petModel.insertMany(mockPets);

        res.status(201).json({
            message: 'Datos generados e insertados exitosamente', 
            usersInserted: users,
            petsInserted: pets
        });
    } catch (error) {
        res.status(400).json({ message: 'Error al generar datos', error: error.message })
    }
});

export default router;