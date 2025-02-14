import PetDTO from "../dto/Pet.dto.js";
import petModel from "../dao/models/Pet.js";
import mongoose from "mongoose";
import { petsService } from "../services/index.js"
import { createError } from "../utils/customError.js";
import errorDictionary from "../utils/errorDictionary.js";
import __dirname from "../utils/index.js";

const getAllPets = async (req, res, next) => {
    try {
        const pets = await petsService.getAll();
        res.send({ status: 'success', payload: pets })
    } catch (error) {
        next(createError('DATABASE_ERROR', errorDictionary.DATABASE_ERROR, error));
    }
}

const createPet = async (req, res, next) => {
    try {
        let { name, specie, birthDate, owner, image, adopted } = req.body;

        // Verifica si el campo 'name' está presente
        if (!name) {
            return res.status(400).json({ message: "El campo 'name' es requerido." });
        }

        // Validar que owner sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(owner)) {
            return res.status(400).json({ error: "Invalid owner ID format" });
        }

        owner = new mongoose.Types.ObjectId(owner);

        // Convertir 'adopted' a booleano correctamente
        const isAdopted = adopted !== undefined ? adopted === true || adopted === "true" : false;

        // Crear una nueva mascota
        const newPet = new petModel({
            name,
            specie,
            birthDate,
            owner,
            image,
            adopted: isAdopted,
        });

        // Guardar la mascota en la base de datos
        const savedPet = await newPet.save();
        res.status(201).json({
            status: 'success',
            payload: savedPet,
        });
    } catch (error) {
        console.error('Error al crear la mascota:', error);
        res.status(500).json({ message: error.message });
    }
};

const updatePet = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, specie, birthDate, adopted, owner, image } = req.body;

        // Verifica si el id existe
        const petToUpdate = await petModel.findById(id);
        if (!petToUpdate) {
            return res.status(404).json({ message: 'Mascota no encontrada.' });
        }

        // Actualiza los campos de la mascota
        petToUpdate.name = name || petToUpdate.name;
        petToUpdate.specie = specie || petToUpdate.specie;
        petToUpdate.birthDate = birthDate || petToUpdate.birthDate;
        petToUpdate.adopted = adopted !== undefined ? adopted : petToUpdate.adopted;
        petToUpdate.owner = owner || petToUpdate.owner;
        petToUpdate.image = image || petToUpdate.image;

        // Guarda la mascota actualizada
        const updatedPet = await petToUpdate.save();

        res.status(200).json({
            status: 'success',
            payload: updatedPet,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePet = async (req, res, next) => {
    try {
        const petId = req.params.pid;
        const pet = await petsService.delete(petId);
        if (!pet) {
            throw createError('PET_NOT_FOUND', errorDictionary.PET_NOT_FOUND);
        }
        res.send({ status: 'success', message: 'Pet deleted', result: pet });
    } catch (error) {
        console.log(error);
        next(error)
    }
}

const createPetWithImage = async (req, res) => {
    console.log("📸 Imagen recibida:", req.file);
    try {

        const file = req.file;  // Aquí está la imagen subida por el usuario

        const { name, specie, birthDate, owner } = req.body; // Recibimos los datos de la mascota

        // Verificamos que los datos requeridos estén presentes
        if (!name || !specie || !birthDate || !owner) {
            return res.status(400).json({ error: "Faltan datos requeridos" });
        }

        // Creamos un objeto `pet` que será usado para almacenar los datos de la mascota
        const pet = new petModel({
            name,
            specie,
            birthDate,
            owner,
            image: `/public/img/${file.filename}`, // Asignamos la ruta de la imagen que Multer generó
        });

        // Llamamos a un servicio que se encarga de almacenar la mascota en la base de datos
        const result = await pet.save();

        // Respondemos con el éxito y la mascota creada
        res.status(201).send({ status: 'success', payload: result });
    } catch (error) {
        console.error('❌ Error en createPetWithImage:', error.stack);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: error.message });
    }
}
export default {
    getAllPets,
    createPet,
    updatePet,
    deletePet,
    createPetWithImage
}