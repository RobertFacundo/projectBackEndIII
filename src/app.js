import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { engine } from 'express-handlebars'
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import multer from 'multer';

import logger from './utils/logger.js';
import errorMiddleware from './middlewares/error.middleware.js';

import { productService } from './services/index.js';
import usersController from './controllers/users.controller.js';

import usersRouter from './routes/users.router.js';
import productsRouter from './routes/products.router.js'
import sessionsRouter from './routes/sessions.router.js';
import mockingRouter from './routes/mocks.router.js';
import loggerTestRouter from './routes/loggerTest.router.js';

import './config/passportConfig.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.engine('handlebars', engine());
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'))

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

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then((connection) => {
        logger.info('Conexion exitosa  con MongoDB');
        logger.debug(`MongoDB connection details: ${connection.connections[0].host}:${connection.connections[0].port}`)
    })
    .catch((error) => logger.error(`Error al conectar con MongoDB: ${error.message}`));


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
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/loggerTest', loggerTestRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter)
app.use('/api/sessions', sessionsRouter);
app.use('/api/mocks', mockingRouter);

app.get('/', (req, res) => {
    res.render('register', { title: 'Registrese' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Iniciar Sesión' });
});

app.get('/home', async (req, res) => {
    if (req.session.user) {
        try {
            const products = await productService.getAll();
            const productsCleaned = products.map(product => ({
                name: product.name,
                description: product.description,
                price: product.price,
                imageUrl: product.imageUrl || 'default-image.jpg',
                _id : product._id
            }));

            res.render('home', {
                user: {
                    ...req.session.user,
                    _id:req.session.user._id,
                    cartId: req.session.user.cart,
                    name: `${req.session.user.first_name} ${req.session.user.last_name}`
                },
                products: productsCleaned,
                title: 'Bienvenido al Ecommerce BackEndIII'
            });
        } catch (error) {
            console.error("Error al obtener productos:", error);
            res.status(500).send("Error al obtener productos");
        }
    } else {
        res.redirect('/login');
    }
})



app.use(errorMiddleware);


app.listen(PORT, () => logger.info(`Listening on ${PORT}`))

export default app;
