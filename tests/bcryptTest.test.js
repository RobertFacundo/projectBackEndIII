import bcrypt from 'bcrypt';
import { expect } from 'chai';

describe('bcrypt tests', () => {
    const password = 'password123';
    let hashedPassword;

    before(async () => {
        hashedPassword = await bcrypt.hash(password, 10);
    });

    describe('Hasheo de contraseña', () => {
        it('El hasheo debe generar un valor diferente al original', () => {
            expect(hashedPassword).to.not.equal(password);
        });
    });

    describe('Comparacion de contraseñas', () => {
        it('La comparacion debe ser exitosa si la contraseña es correcta', async () => {
            const match = await bcrypt.compare(password, hashedPassword);
            expect(match).to.be.true;
        });

        it('La comparacion debe fallar si la contraseña hasheada es alterada', async () => {
            const alteredHashedPassword = hashedPassword + 'alterada';
            const match = await bcrypt.compare(alteredHashedPassword, hashedPassword);
            expect(match).to.be.false;
        })
    });
});