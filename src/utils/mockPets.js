import { faker } from "@faker-js/faker";

export const generateMockPets = (count) =>{
    const pets = [];
    const breeds = {
        cat: ['Siamese', 'Persian', 'Maine Coon', 'Bengal'],
        dog: ['Labrador', 'Beagle', 'Poodle', 'Bulldog'],
        bird: ['Parrot', 'Sparrow', 'Canary', 'Pigeon'],
        rabbit: ['Angora', 'Mini Lop', 'Dutch', 'Himalayan']
    };

    for(let i = 0; i < count; i++){
        const specie = faker.helpers.arrayElement(['cat', 'dog', 'bird', 'rabbit']);
        pets.push({
            name: faker.helpers.arrayElement(breeds[specie]),
            age: faker.number.int({min: 1, max: 15}),
            adopted: false,
            specie: faker.helpers.arrayElement(['cat', 'dog', 'bird', 'rabbit']),  
        })
    }
    return pets;
}