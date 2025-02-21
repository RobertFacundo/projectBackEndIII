import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Users from '../src/dao/Users.dao.js';
import Products from '../src/dao/Products.dao.js';
import supertest from 'supertest';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import cartModel from '../src/dao/models/carts.js';

let mongoServer;
let connection;
let userId;
let productId
let usersService;
let productsService;

before(async function () {
    this.timeout(10000);
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    await mongoose.connect(mongoUri);

    usersService = new Users();
    productsService = new Products();
});
beforeEach(async function () {
    await mongoose.connection.db.dropCollection('users');

    const userDoc = {
        first_name: 'UsuarioTest',
        last_name: 'Mocha',
        email: 'usuariotestt@Mocha.com',
        password: 'coder123',
    };

    const user = await usersService.save(userDoc);
    userId = user._id;

    const productDoc = {
        name: 'ProductoTest',
        price: 100,
        stock: 10,
        description: 'Descripcion product',
        category: 'Electronics'
    };

    const product = await productsService.save(productDoc);
    productId = product._id;

});

after(async function () {
    this.timeout(10000);
    await mongoose.connection.close();
});

describe('DAO userModel tests', () => {
    describe('Agregar nuevo usuario', () => {
        it('El usuario debe crearse con un arreglo vacio por defecto.', async () => {
            const userDoc = {
                first_name: 'UsuarioTest',
                last_name: 'Mocha',
                email: 'usuariotest@Mocha.com',
                password: 'coder123'
            };

            const res = await supertest(app)
                .post('/api/users')
                .send(userDoc);

            expect(res.status).to.equal(201);
            expect(res.body.payload.first_name).to.equal('UsuarioTest');
            expect(res.body.payload.cart).to.exist;
            expect(res.body.payload.cart.products).to.deep.equal([]);
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

    describe('Productos y cart', () => {
        let token;

        before(() => {
            token = jwt.sign({ userId: userId }, 'secretKey', { expiresIn: '1h' });
        });

        it('Debería agregar el producto al carrito', async () => {
            const res = await supertest(app)
                .post(`/api/users/${userId}/cart/${productId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Producto agregado al carro');
        });

        it('Deberia eliminar un producto del carro', async () => {
            let user = await usersService.getBy(userId);
            if (!user.cart) {
                const cart = await cartModel.create({ user: userId, products: [] });
                user.cart = cart._id;
                await user.save();
            }

            await cartModel.findByIdAndUpdate(user.cart, { $push: { products: { product: productId } } });

            const res = await supertest(app)
                .delete(`/api/users/${userId}/cart/${productId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Producto eliminado del carro')

            const updatedCart = await cartModel.findById(user.cart)
            const productIndex = updatedCart.products.findIndex(p => p.product.toString() === productId.toString());
            expect(productIndex).to.equal(-1)
        });
    });

    describe('Multiples documentos', () => {
        let token;
        before(() => {
            token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        });

        it('deberia subir archivos exitosamente', async () => {
            const file = Buffer.from('file content');
            const file2 = Buffer.from('file content 2');

            const res = await supertest(app)
                .post(`/api/users/${userId}/documents`)
                .set('Authorization', `Bearer ${token}`)
                .attach('files', file, 'example.txt')
                .attach('files', file2, 'example2.txt');

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('Files subidos exitosamente');
            expect(res.body.user.documents).to.be.an('array').that.has.lengthOf(2);
            expect(res.body.user.documents[0].name).to.equal('example.txt')
        })
    })

});