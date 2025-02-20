import mongoose from 'mongoose';

const collection = 'Users';

const schema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    cart: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Carts',
        default: null
    }
})

const userModel = mongoose.model(collection, schema);

export default userModel;