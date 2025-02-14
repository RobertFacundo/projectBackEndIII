import { Router } from 'express';
import petsController from '../controllers/pets.controller.js';
import uploader from '../utils/uploader.js';

const router = Router();

router.get('/', petsController.getAllPets);
router.post('/', petsController.createPet);
router.post('/withimage', (req, res, next) => {
    uploader.single('image')(req, res, (err) => {
        if (err) {
            console.error('🚨 Error en Multer:', err.message);
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, petsController.createPetWithImage);
router.put('/:id', petsController.updatePet);
router.delete('/:pid', petsController.deletePet);

export default router;