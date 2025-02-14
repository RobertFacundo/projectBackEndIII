import mongoose, { Mongoose } from "mongoose";
import { createHash } from "../src/utils/index.js";
import { expect } from "chai";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../src/app.js";
import { usersService } from "../src/services/index.js";

let mongoServer;
let userData = {
    first_name: 'example',
    last_name: 'supertest',
    email: "testuser@example.com",
    password: "123456",
    name: "Test User",
    age: 25
};

before(async function () {
    this.timeout(10000)
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    userData.password = await createHash(userData.password);
    await usersService.create(userData);
});
after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

describe('Session API test', () => {
    let authCookie;

    it('Debe devolver una cookie unprotected al hacer login', async () => {
        const res = await request(app)
            .post("/api/sessions/unprotectedLogin")
            .set("Content-Type", "application/json")
            .send({
                email: userData.email,
                password: '123456'
            });

        expect(res.status).to.equal(200);
        expect(res.headers['set-cookie']).to.exist;

        authCookie = res.headers['set-cookie'].find(cookie => cookie.startsWith('unprotectedCookie'));
        expect(authCookie).to.exist;
    });

    it('Debe devolver los datos completos del usuario en unprotectedCurrent', async () => {
        if (!authCookie) {
            throw new Error("No se recibió la cookie de autenticación en el login");
        }
        const res = await request(app)
            .get("/api/sessions/unprotectedCurrent")
            .set('Cookie', authCookie);

        console.log(res.body)

        expect(res.status).to.equal(200);
        expect(res.body.status).to.equal('success');
        expect(res.body.payload).to.have.property('email', userData.email);
        expect(res.body.payload).to.have.property('name', `${userData.first_name} ${userData.last_name}`);
    });
});