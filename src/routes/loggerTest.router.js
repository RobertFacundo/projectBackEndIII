import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/', (req, res) => {
    logger.debug('Este es un mensaje de nivel DEBUG');
    logger.http('Este es un mensaje  de nivel HTTP');
    logger.info('Este es un mensaje de nivel INFO');
    logger.warning('Este es un mensaje de nivel WARNING');
    logger.error('Este es un mensaje de nivel ERROR');
    logger.fatal('Este es un mensaje de nivel FATAL');

    res.send('Prueba de logs completada');
});

export default router;