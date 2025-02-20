import mongoose from "mongoose";

const Collection = 'Carts';

const schema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'Products',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ]
});

const cartModel = mongoose.model(Collection, schema);

export default cartModel;