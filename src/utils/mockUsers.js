import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

export function generateMockUsers(count) {
    const users = [];
    const passwordHash = bcrypt.hashSync('coder123', 10);

    for (let i = 0; i < count; i++) {
        users.push({
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            password: passwordHash,
            role: faker.helpers.arrayElement(['user', 'admin']),
            cart: [],
        }); 
    }
    return users;
}