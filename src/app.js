import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path'

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';

import mockingRouter from './routes/mocks.router.js';
import errorMiddleware from './middlewares/error.middleware.js';
import loggerTestRouter from './routes/loggerTest.router.js';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8080;
mongoose.connect('mongodb+srv://robertfacundo:mongopassword@cluster0.tbzxf.mongodb.net/adoptme?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then((connection) => {
    logger.info('Conexion exitosa  con MongoDB');
    logger.debug(`MongoDB connection details: ${connection.connections[0].host}:${connection.connections[0].port}`)
})
.catch((error) => logger.error(`Error al conectar con MongoDB: ${error.message}`));

const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename);

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'AdoptMe API',
            version: '1.0.0',
            description: 'API para gestionar usuarios, mascotas y adopciones',
        },
        servers: [
            {
                url: `http://localhost:${PORT}/api`,
            },
        ],
    },
    apis: [path.join(__dirname, 'docs', '**/*.yaml')],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use(cors())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
