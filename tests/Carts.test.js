import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";  
import { cartService } from "../src/services/index.js";  

let mongoServer;
let cartId;

before(async function () {
    this.timeout(10000);
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    await mongoose.connect(mongoUri);
});

beforeEach(async function () {
    await mongoose.connection.db.dropCollection('carts');

    const cartDoc = {
        user: new mongoose.Types.ObjectId(),
        products: [{
            product: new mongoose.Types.ObjectId(), 
            quantity: 2
        }]
    };

    const cart = await cartService.create(cartDoc);
    cartId = cart._id;
});

after(async function () {
    this.timeout(1000);
    await mongoose.connection.close();
});

describe('Carts API test', () => {
    describe('GET /api/carts', () => {
        it('Debería devolver todos los carritos', async () => {
            const res = await supertest(app).get('/api/carts');

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.be.an('array').that.is.not.empty;
        });
    });

    describe('GET /api/carts/:cid', () => {
        it('Debería devolver el carrito solicitado', async () => {
            const res = await supertest(app).get(`/api/carts/${cartId}`);

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.have.property('_id').that.equals(cartId.toString());
        });

        it('Debería devolver un error si el ID no es válido', async () => {
            const res = await supertest(app).get('/api/carts/invalidId');

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('El parámetro proporcionado no es válido.');
        });
    });

    describe('POST /api/carts', () => {
        it('Debería crear un nuevo carrito', async () => {
            const newCart = {
                user: new mongoose.Types.ObjectId(),
                products: [{
                    product: new mongoose.Types.ObjectId(),
                    quantity: 1
                }]
            };

            const res = await supertest(app)
                .post('/api/carts')
                .send(newCart);

            expect(res.status).to.equal(201);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.have.property('user').that.equals(newCart.user.toString());
        });

    });

    describe('PUT /api/carts/:cid', () => {
        it('Debería actualizar un carrito existente', async () => {
            const updatedCart = {
                user: new mongoose.Types.ObjectId(),
                products: [{
                    product: new mongoose.Types.ObjectId(),
                    quantity: 3
                }]
            };

            const res = await supertest(app)
                .put(`/api/carts/${cartId}`)
                .send(updatedCart);

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.updateBody.products[0].quantity).to.equal(3);
        });

        it('Debería devolver un error si el ID no es válido', async () => {
            const updatedCart = {
                user: new mongoose.Types.ObjectId(),
                products: [{
                    product: new mongoose.Types.ObjectId(),
                    quantity: 5
                }]
            };

            const res = await supertest(app)
                .put('/api/carts/invalidId')
                .send(updatedCart);

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('El parámetro proporcionado no es válido.');
        });
    });

    describe('DELETE /api/carts/:cid', () => {
        it('Debería eliminar un carrito existente', async () => {
            const res = await supertest(app).delete(`/api/carts/${cartId}`);

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.message).to.equal('Cart eliminado');
        });

        it('Debería devolver un error si el carrito no existe', async () => {
            const res = await supertest(app).delete('/api/carts/60d5f7c8c937e6186c8f70d1');

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('No se ha encontrado el carro');
        });

        it('Debería devolver un error si el ID no es válido', async () => {
            const res = await supertest(app).delete('/api/carts/invalidId');

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('El parámetro proporcionado no es válido.');
        });
    });
});
