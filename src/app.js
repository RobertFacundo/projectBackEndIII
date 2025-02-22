import './config/passportConfig.js';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import multer from 'multer';

import usersRouter from './routes/users.router.js';
import productsRouter from './routes/products.router.js'
import sessionsRouter from './routes/sessions.router.js';

import mockingRouter from './routes/mocks.router.js';
import errorMiddleware from './middlewares/error.middleware.js';
import loggerTestRouter from './routes/loggerTest.router.js';

const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: 'yourSecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 3600
    }),
    cookie: { secure: false }
}));


app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 8080;
mongoose.connect(process.env.MONGO_URI, {
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
            title: 'Ecommerce API',
            version: '1.0.0',
            description: 'API para gestionar funcionalidades de ecommerce',
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

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/loggerTest', loggerTestRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter)
app.use('/api/sessions', sessionsRouter);
app.use('/api/mocks', mockingRouter);

app.use('/public', express.static('public'));

app.use(errorMiddleware);


app.listen(PORT, () => logger.info(`Listening on ${PORT}`))

export default app;
