import cartModel from "./models/carts.js";

export default class Carts {
    async get(params = {}) {
        return await cartModel.find(params).populate("products.product")
    }
    async getBy(params) {
        return await cartModel.findOne(params).populate("products.product");
    }
    async create(doc) {
        return await cartModel.create(doc);
    }
    async update(id, doc) {
        return await cartModel.findByIdAndUpdate(id, doc);
    }
    async delete(id) {
        return await cartModel.findByIdAndDelete(id);
    }
}