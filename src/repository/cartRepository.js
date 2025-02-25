import GenericRepository from "./GenericRepository.js";

export default class CartRepository extends GenericRepository {
    constructor(dao) {
        super(dao);
    }
    getAll = (params) => {
        return this.dao.get(params);
    };

    getBy = (params) => {
        return this.dao.getBy(params);
    };

    create = (doc) => {
        return this.dao.create(doc); 
    };

    update = (id, doc) => {
        return this.dao.update(id, doc);
    };

    delete = (id) => {
        return this.dao.delete(id);
    };
}
