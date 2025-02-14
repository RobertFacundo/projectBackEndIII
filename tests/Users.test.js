import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Users from '../src/dao/Users.dao.js';
import supertest from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

let mongoServer;
let connection;
let userId;
let usersService;

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

    usersService = new Users();
});
beforeEach(async function () {
    // Limpiar la colección 'users' antes de cada prueba
    await mongoose.connection.db.dropCollection('users');

    // Crear un usuario de prueba antes de cada prueba
    const userDoc = {
        first_name: 'UsuarioTest',
        last_name: 'Mocha',
        email: 'usuariotestt@Mocha.com',
        password: 'coder123'
    };

    const user = await usersService.save(userDoc);
    userId = user._id;
});

after(async function () {
    this.timeout(10000);
    await mongoose.connection.close();  // Cerrar la conexión de MongoDB después de todas las pruebas
});

describe('DAO userModel tests', () => {
    describe('Agregar nuevo usuario', () => {
        it('El usuario debe crearse con un arreglo de mascotas vacío por defecto.', async () => {
            const userDoc = {
                first_name: 'UsuarioTest',
                last_name: 'Mocha',
                email: 'usuariotest@Mocha.com',
                password: 'coder123'
            };

            const user = await usersService.save(userDoc);

            if (!user._id) {
                throw new Error('Usuario no fue creado correctamente');
            }
            if (user.first_name !== 'UsuarioTest') {
                throw new Error('El nombre de usuario no coincide')
            }
            if (!Array.isArray(user.pets)) {
                throw new Error('Pets deberia ser un arreglo')
            }
            if (user.pets.length !== 0) {
                throw new Error('El arreglo deberia estar vacio por defecto');
            }
        });
    });

    describe('Obtener usuario por email', () => {
        it('Se debe obtener un usuario mediante su email', async () => {
            const userDoc = {
                first_name: 'testUsuario',
                last_name: 'Mocha',
                email: 'mochaTest@mocha.com',
                password: 'coder123'
            };

            await usersService.save(userDoc);

            const foundUser = await usersService.getBy({ email: 'mochaTest@mocha.com' });

            if (!foundUser) {
                throw new Error('User no encontrado');
            }
            if (foundUser.email !== 'mochaTest@mocha.com') {
                throw new Error('Email no coincide')
            }
            if (foundUser.first_name !== 'testUsuario') {
                throw new Error('No coincide el nombre')
            }
        });
    });

    describe('Actualizar usuario', () => {
        it('Debería actualizar un usuario existente', async () => {
            const updateData = { first_name: 'NuevoNombre' };

            const response = await supertest(app)
                .put(`/api/users/${userId}`)
                .send(updateData);

            expect(response.status).to.equal(200);
            expect(response.body.updateBody.first_name).to.equal('NuevoNombre');
        });

        it('Debería devolver un error si el usuario no existe', async () => {
            const usuarioInexistenteId = '67af6c36d1d4058dc96dca99'
            const updateData = { first_name: 'Inexistente' };

            const response = await supertest(app)
                .put(`/api/users/${usuarioInexistenteId}`)
                .send(updateData);

            expect(response.status).to.equal(404);
            expect(response.body.message).to.equal('No se encontró el usuario.');
        });
    });

    describe('Eliminar usuario', () => {
        it('Debería eliminar un usuario existente', async () => {
            const response = await supertest(app)
                .delete(`/api/users/${userId}`);

            console.log(response.status)
            console.log(response.body)

            expect(response.status).to.equal(200);
            expect(response.body.message).to.equal('Usuario eliminado');
        });

        it('Debería devolver un error si el usuario no existe', async () => {
            const usuarioInexistenteId = '67af6c36d1d4058dc96dca99'
            const response = await supertest(app)
                .delete(`/api/users/${usuarioInexistenteId}`);

            expect(response.status).to.equal(404);
            expect(response.body.message).to.equal('No se encontró el usuario.');
        });
    });


});