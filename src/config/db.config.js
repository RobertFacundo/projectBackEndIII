import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        logger.info('Conexion exitosa a MongoDB');
        logger.debug(`MongoDB connection details ${connection.connections[0].host}:${connection.connections[0].port}`)
    } catch (error) {
        logger.error(`Error al conectar con MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;