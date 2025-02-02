import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import logger from './utils/logger.js';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';

import mockingRouter from './routes/mocks.router.js';
import errorMiddleware from './middlewares/error.middleware.js';
import loggerTestRouter from './routes/loggerTest.router.js';

const app = express();
const PORT = process.env.PORT || 8080;
const connection = mongoose.connect("mongodb+srv://robertfacundo:mongopassword!@cluster0.tbzxf.mongodb.net/adoptme?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then((connection) => {
    logger.info('Conexion exitosa  con MongoDB');
    logger.debug(`MongoDB connection details: ${connection.connections[0].host}:${connection.connections[0].port}`)
})
.catch((error) => logger.error(`Error al conectar con MongoDB: ${error.message}`));

dotenv.config();

app.use(express.json());
app.use(cookieParser());

app.use('/loggerTest', loggerTestRouter);

app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/sessions', sessionsRouter);

app.use('/api/mocks', mockingRouter);


app.use(errorMiddleware);


app.listen(PORT, () => logger.info(`Listening on ${PORT}`))
