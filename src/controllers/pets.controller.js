import PetDTO from "../dto/Pet.dto.js";
import { petsService } from "../services/index.js"
import { createError } from "../utils/customError.js";
import errorDictionary from "../utils/errorDictionary.js";
import __dirname from "../utils/index.js";

const getAllPets = async (req, res) => {
    try {
        const pets = await petsService.getAll();
        res.send({ status: 'success', payload: pets })
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error));
    }
}

const createPet = async (req, res, next) => {
    try {
        const { name, specie, birthDate } = req.body;
        if (!name || !specie || !birthDate) {
            throw createError('INVALID_PARAM', errorDictionary.INVALID_PARAM);
        }
        const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
        const result = await petsService.create(pet);
        res.send({ status: 'success', payload: result });
    } catch (error) {
        console.error('Error en createPet:', error.message);
        next(error)
    };
};

const updatePet = async (req, res, next) => {
    try {
        const petUpdatedBody = req.body;
        const petId = req.params.pid;
        const result = await petsService.update(petId, petUpdatedBody);
        if (!result) {
            throw createError('PET_NOT_FOUND', errorDictionary.PET_NOT_FOUND)
        }
        res.send({ status: 'success', message: 'Pet Updated' });
    } catch (error) {
        console.log(error.message)
        next(error)
    }
};

const deletePet = async (req, res, next) => {
    try {
        const petId = req.params.pid;
        const result = await petsService.delete(petId);
        if (!result) {
            throw createError('PET_NOT_FOUND', errorDictionary.PET_NOT_FOUND);
        }
        res.send({ status: 'success', message: 'Pet deleted' });
    } catch (error) {
        console.log(error);
        next(error)
    }
}

const createPetWithImage = async (req, res) => {
    try {
        const file = req.file;
        const { name, specie, birthDate } = req.body;
        if (!name || !specie, !birthDate) {
            throw createError('INVALID_PARAM', errorDictionary.INVALID_PARAM);
        }
        const pet = PetDTO.getPetInputFrom({
            name,
            specie,
            birthDate,
            image: `${__dirname}/../public/img/${file.filename}`,
        });
        const result = await petsService.create(pet);
        res.send({ status: 'success', payload: result });
    } catch (error) {
        next(error)
    }
}
export default {
    getAllPets,
    createPet,
    updatePet,
    deletePet,
    createPetWithImage
}