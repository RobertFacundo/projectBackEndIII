import productModel from "./models/Product.js";

export default class Products {
    async get(params = {}) {
        return await productModel.find(params)
    }
    async getBy(params) {
        return await productModel.findOne(params);
    }
    async save(doc) {
        return await productModel.create(doc);
    }
    async update(id, doc) {
        return await productModel.findByIdAndUpdate(id, doc, { new: true })
    }
    async delete(id) {
        return await productModel.findByIdAndDelete(id)
    }
}

