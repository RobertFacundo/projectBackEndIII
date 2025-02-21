import { Router } from 'express';
import sessionsController from '../controllers/sessions.controller.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', sessionsController.register);
router.post('/login', sessionsController.login);
router.get('/current', authenticateJWT, sessionsController.current);
router.post('/unprotectedLogin', sessionsController.unprotectedLogin);
router.get('/unprotectedCurrent', authenticateJWT, sessionsController.unprotectedCurrent);

export default router;