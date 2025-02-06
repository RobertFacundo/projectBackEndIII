import { expect } from "chai";
import UserDTO from "../src/dto/User.dto.js";

describe('Pruebas de UserDTO', () => {
    const user = {
        first_name: 'UsuarioTestDTO',
        last_name: 'Mocha',
        email: 'usuarioDtoTest@MochaChai.com',
        password: 'coder123',
        role: 'user',
    };

    describe('Unificacion del nombre y apellido', () => {
        it('Debe unificar el nombre y el apellido en una unica propiedad "name"', () => {
            const userToken = UserDTO.getUserTokenFrom(user);
            expect(userToken).to.have.property('name').that.equals('UsuarioTestDTO Mocha');
        });
    });

    describe('Eliminacion de propiedades innecesarias', () => {
        it('Debe eliminar "password", "first_name" y "last_name"', () => {
            const userToken = UserDTO.getUserTokenFrom(user);
            expect(userToken).to.not.have.property('password');
            expect(userToken).to.not.have.property('first_name');
            expect(userToken).to.not.have.property('last_name');
        })
    })
})