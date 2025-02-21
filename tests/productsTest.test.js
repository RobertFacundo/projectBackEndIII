import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";
import { productService } from "../src/services/index.js";

let mongoServer;
let productId;

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
    await mongoose.connection.db.dropCollection('products');

    const productDoc = {
        name: 'ProductoTest',
        price: 100,
        stock: 10,
        description: 'Descripcion product',
        category: 'Electronics',
    }

    const product = await productService.create(productDoc);
    productId = product._id;
}),

    after(async function () {
        this.timeout(1000);
        await mongoose.connection.close();
    })

describe('Products API test', () => {
    describe('GET /api/products', () => {
        it('Debería devolver todos los productos', async () => {
            const res = await supertest(app).get('/api/products');

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.be.an('array').that.is.not.empty;
        })
    })

    describe('GET /api/products/:pid', () => {
        it('deberia devovler el producto solicitado', async () => {
            const res = await supertest(app).get(`/api/products/${productId}`)

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.have.property('name', 'ProductoTest')
        })

        it('Deberia devolver error si el producto no existe', async () => {
            const res = await supertest(app).get(`/api/products/60d5f7c8c937e6186c8f70d1`);

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Producto no encontrado')
        })

        it('Deberia devolver error si el ID no es valido', async () => {
            const res = await supertest(app).get(`/api/products/invalidId`);

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('El parámetro proporcionado no es válido.')
        })
    })

    describe('POST /api/products', () => {
        it('Debería crear un nuevo producto', async () => {
            const newProduct = {
                name: 'NuevoProducto',
                price: 200,
                stock: 20,
                description: 'Nuevo producto de prueba',
                category: 'Decoracion',
            };

            const res = await supertest(app)
                .post('/api/products')
                .send(newProduct)

            expect(res.status).to.equal(201)
            expect(res.body.status).to.equal('success')
            expect(res.body.payload).to.have.property('name', 'NuevoProducto');
        });

        it('Deberia devolver error si faltan campos obligatorios', async () => {
            const newProduct = {
                price: 100,
                description: 'descripcion producto',
            };

            const res = await supertest(app)
                .post('/api/products')
                .send(newProduct)

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('El parámetro proporcionado no es válido.');
        });
    });

    describe('PUT /api/products/:pid', () => {
        it('Deberia actualizar un producto existente', async () => {
            const updatedProduct = {
                name: 'ProductoActualizado',
                price: 150,
                stock: 15,
                description: 'Producto actualizado de prueba',
                category: 'decoracion',
            };

            const res = await supertest(app)
                .put(`/api/products/${productId}`)
                .send(updatedProduct)

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.updateBody.name).to.equal('ProductoActualizado')
        })

        it('Deberia devolver error si el producto no existe', async () => {
            const updatedProduct = {
                name: 'ProductoInexistente',
                price: 100,
                stock: 10,
                description: 'Producto que no existe',
                category: 'Decoracion',
            };

            const res = await supertest(app)
                .put(`/api/products/60d5f7c8c937e6186c8f70d1`)
                .send(updatedProduct)

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Producto no encontrado');
        });

        it('Deberia devolver un error si el ID no es valido', async () => {
            const updatedProduct = {
                name: 'ProductoConIdInvalido',
                price: 100,
                stock: 10,
                description: 'Producto con ID no válido',
                category: 'Decoracion',
            };

            const res = await supertest(app)
                .put('/api/products/invalidId')
                .send(updatedProduct);

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('El parámetro proporcionado no es válido.')
        });
    });

    describe('DELETE /api/products/:pid', () => {
        it('Deberia eliminar un producto existente', async () => {
            const res = await supertest(app).delete(`/api/products/${productId}`)

            expect(res.status).to.equal(200)
            expect(res.body.status).to.equal('success')
            expect(res.body.message).to.equal('Product eliminado');
        })

        it('deberia devovler un error si el producto no existe', async () => {
            const res = await supertest(app).delete('/api/products/60d5f7c8c937e6186c8f70d1')

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Producto no encontrado');
        })

        it('Devovleria un error si el id no es valido', async () => {
            const res = await supertest(app).delete('/api/products/invalidId')

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('El parámetro proporcionado no es válido.')
        })
    })
})