import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import userModel from '../src/dao/Users.dao.js';

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

describe('DAO userModel tests', () => {
    describe('Agregar nuevo usuario', () => {
        it('El usuario debe crearse con un arreglo de mascotas vacío por defecto.', async () => {
            const userDoc = {
                first_name: 'UsuarioTest',
                last_name: 'Mocha',
                email: 'usuariotest@Mocha.com',
                password: 'coder123'
            };

            const user = await userDao.save(userDoc);

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
                last_name:'Mocha',
                email: 'mochaTest@mocha.com',
                password:'coder123'
            };

            await userDao.save(userDoc);

            const foundUser = await userDao.getBy({email: 'mochaTest@mocha.com'});

            if(!foundUser){
                throw new Error('User no encontrado');
            }
            if(foundUser.email !== 'mochaTest@mocha.com'){
                throw new Error('Email no coincide')
            }
            if(foundUser.first_name !== 'testUsuario'){
                throw new Error('No coincide el nombre')
            }
        });
    });
});