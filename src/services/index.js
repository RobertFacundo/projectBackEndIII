import Users from "../dao/Users.dao.js";
import Products from "../dao/Products.dao.js";


import UserRepository from "../repository/UserRepository.js";
import ProductRepository from "../repository/ProductRepository.js";

export const usersService = new UserRepository(new Users());
export const productService = new ProductRepository(new Products())