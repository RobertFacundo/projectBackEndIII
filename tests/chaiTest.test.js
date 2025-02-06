import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { expect } from "chai";
import userModel from "../src/dao/Users.dao.js";

let mongoServer;
let userDao;
let connection;

before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    connection = await mongoose.connect(mongoUri);
    userDao = new userModel();
});

after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('DAO userModel tests con Chai', () => {
    describe('Agregar un nuevo usuario', () => {
        it('El usuario debe crease con un arreglo de mascotas vacios por defecto', async () => {
            const userDoc = {
                first_name: 'UsuarioTest',
                last_name: 'Mocha',
                email: 'usuariotest1@MochaChai.com',
                password: 'coder123'
            };

            const user = await userDao.save(userDoc);

            expect(user).to.have.property('_id');
            expect(user.first_name).to.equal('UsuarioTest');
            expect(user).to.have.property('pets').that.is.an('array').that.is.empty;
        });
    });

    describe('Obtener usuario por email', () => {
        it('Se debe obtener un usuario mediante su email', async () => {
            const userDoc = {
                first_name: 'testUsuario',
                last_name: 'Mocha',
                email: 'mochaTest@mochaChai.com',
                password: 'coder123'
            };
            await userDao.save(userDoc);
            const foundUser = await userDao.getBy({ email: 'mochaTest@mochaChai.com' });

            expect(foundUser).to.not.be.null;
            expect(foundUser.email).to.equal('mochaTest@mochaChai.com');
            expect(foundUser.first_name).to.equal('testUsuario');
        });
    });

    describe('Actualizar usuario', () => {
        it('Debe Actualizar correctamente un usuario', async () => {
            const userDoc = {
                first_name: 'NombreViejo',
                last_name: 'Mocha',
                email: 'updateTest2@mochaChai.com',
                password: 'coder123'
            };

            const user = await userDao.save(userDoc);

            await userDao.update(user._id, { first_name: 'NombreNuevo' });
            const updatedUser = await userDao.getBy({ email: 'updateTest2@mochaChai.com' });

            expect(updatedUser.first_name).to.equal('NombreNuevo');
        })
    })

    describe('Eliminar Usuario', () => {
        it('Debe eliminar un usuario exitosamente', async () => {
            const userDoc = {
                first_name: 'NombreViejo',
                last_name: 'Mocha',
                email: 'updateTest@mochaChai.com',
                password: 'coder123'
            };

            const user = await userDao.save(userDoc);

            await userDao.delete(user._id);
            const deletedUser = await userDao.getBy({email:'updateTest@mochaChai.com'});

            expect(deletedUser).to.be.null;
        })
    });
});