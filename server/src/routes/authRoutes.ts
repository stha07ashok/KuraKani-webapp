import { Router } from 'express';
import { loginWithFirebase } from '../controllers/authController';

const router = Router();

router.post('/login', loginWithFirebase);

export default router;
