import { Router } from 'express';
import { getAllUsers } from '../controllers/user_controller.js';

const router = Router();
router.get('/findAllUsers', getAllUsers);

export default router;