import { Router } from 'express';
import { getAllUsers, getUserByEmail, getUserByUsername, checkUserExists, checkPassword, register, changePassword, deleteAccount } from '../controllers/user_controller.js';

const router = Router();
router.get('/findAllUsers', getAllUsers);
router.get('/findByEmail', getUserByEmail);
router.get('/findByUsername', getUserByUsername);
router.get('/exists', checkUserExists);
router.post('/verifyPassword', checkPassword);
router.post('/register', register);
router.put('/changePassword', changePassword);
router.delete('/deleteAccount', deleteAccount);

export default router;