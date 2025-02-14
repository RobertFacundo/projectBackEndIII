import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import __dirname from "../src/utils/index.js";
import { expect } from "chai";
import request from 'supertest';
import app from '../src/app.js';
import petModel from "../src/dao/models/Pet.js";
import fs from 'fs';
import path from 'path';

let mongoServer;
let connection;


before(async function () {
    this.timeout(10000);
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log('Mongo URI:', mongoUri);

    // Cerrar la conexión si ya existe
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB conectado:', mongoose.connection.readyState);
});

after(async function () {
    this.timeout(10000);
    await mongoose.connection.close();  // Cerrar la conexión de MongoDB después de todas las pruebas
});

describe('Pet API test con Mocha, Chai y SuperTest', function () {
    this.timeout(5000);
    describe('POST /api/pets - Crear una nueva mascota', () => {
        it('Debe crear una mascota con adopted: false si no se especifica', async () => {
            const validOwnerId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .post('/api/pets')
                .send({
                    name: 'Fido',
                    specie: 'Perro',
                    birthDate: '2022-01-01',
                    owner: validOwnerId.toString(),
                    image: 'imageUrl',
                    adopted: 'false'
                });

            expect(response.status).to.equal(201);
            expect(response.body.payload).to.have.property('adopted').that.equals(false);
        });

        it('Debe devolver error 400 si falta el campo name', async () => {
            const response = await request(app)
                .post('/api/pets')
                .send({
                    specie: 'Perro',
                    birthDate: '2022-01-01',
                    owner: 'someOwnerId',
                    image: 'imageUrl'
                });

            // Verificar que el código de estado sea 400 y el mensaje adecuado
            expect(response.status).to.equal(400);
            expect(response.body.message).to.equal("El campo 'name' es requerido.");
        })
    });

    describe('GET /api/pets - Obtener todas las mascotas', () => {
        it('Debe devolver un arrelgo de mascotas con status y payload', async () => {
            const res = await request(app).get('/api/pets')

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('status').that.equals('success');
            expect(res.body).to.have.property('payload').that.is.an('array');
        });
    });

    describe('PUT /api/pets/:id - Actualizar una mascota', () => {
        it('Debe actualizar correctamente una mascota', async () => {
            const pet = new petModel({
                name: 'Tommy',
                specie: 'Cat',
                birthDate: '2018-05-01'
            });

            const savedPet = await pet.save();
            const petId = savedPet._id.toString();

            const updatedPetData = { name: 'Tommy updated' };
            const res = await request(app)
                .put(`/api/pets/${petId}`)
                .send(updatedPetData);

            expect(res.status).to.equal(200);
            expect(res.body.payload.name).to.equal('Tommy updated')
        });
    });

    describe('DELETE /api/pets/:id - Eliminar mascota', async () => {
        it('Debe eliminar la última mascota creada', async () => {
            const pet = new petModel({
                name: 'Max',
                specie: 'Dog',
                birthDate: '2019-07-15'
            }); 

            const savedPet = await pet.save();

            const petId = savedPet._id;

            const res = await request(app).delete(`/api/pets/${petId}`);

            expect(res.status).to.equal(200);

            const deletedPet = await petModel.findById(petId);
            expect(deletedPet).to.be.null;
        });
    });

    describe('CREATE PET WITH IMAGE /api/pets/withimage - Crear pet con imagen', async () => {
        it('Debe crear una mascota con imagen adjunta', async () => {
            const validOwnerId = new mongoose.Types.ObjectId();
            const pathToImage = path.join(__dirname, '../public/img/test-image.jpg');  // Ruta a la imagen que se usará para la prueba

            // Verifica si la imagen existe antes de hacer la prueba
            if (!fs.existsSync(pathToImage)) {
                throw new Error('La imagen de prueba no existe en la ruta especificada');
            }

            const res = await request(app)
                .post('/api/pets/withimage')  // Endpoint a probar
                .field('name', 'Fido')  // Datos de la mascota
                .field('specie', 'Perro')
                .field('birthDate', '2022-01-01')
                .field('owner', validOwnerId.toString())
                .attach('image', fs.createReadStream(pathToImage))  // Adjuntamos la imagen para la prueba

            expect(res.status).to.equal(201);  // Verificamos que el estado de la respuesta sea 201
            expect(res.body.status).to.equal('success');  // Verificamos que la respuesta tenga el estado 'success'
            expect(res.body.payload.image).to.be.ok
            expect(res.body.payload.name).to.equal('Fido');  // Verificamos que el nombre de la mascota sea el correcto
            expect(res.body.payload.specie).to.equal('Perro');  // Verificamos que la especie sea la correcta
        })
    })
});