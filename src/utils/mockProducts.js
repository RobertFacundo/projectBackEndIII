import { faker } from "@faker-js/faker";

export const generateMockProducts = (count) => {
    const products = [];
    const categories = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Toys", "Sports"];

    for (let i = 0; i < count; i++) {
        products.push({
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: faker.number.float({ min: 5, max: 1000, precision: 0.01 }),
            stock: faker.number.int({ min: 0, max: 100 }),
            category: faker.helpers.arrayElement(categories),
            imageUrl: faker.image.urlPicsumPhotos(),
        })
    }
    return products;
}