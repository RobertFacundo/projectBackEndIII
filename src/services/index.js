import Users from "../dao/Users.dao.js";
import Products from "../dao/Products.dao.js";
import Carts from '../dao/CartModel.dao.js'


import UserRepository from "../repository/UserRepository.js";
import ProductRepository from "../repository/ProductRepository.js";
import CartRepository from "../repository/cartRepository.js";

export const usersService = new UserRepository(new Users());
export const productService = new ProductRepository(new Products())
export const cartService = new CartRepository(new Carts())