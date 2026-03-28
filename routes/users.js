import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getAllUsers, getUserByEmail, getUserByUsername, checkUserExists, checkPassword, register, changePassword, changeUsername, uploadImage, deleteAccount } from '../controllers/user_controller.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype.split('/')[1]);
    cb(null, ext && mime);
  },
});

const router = Router();
router.get('/findAllUsers', getAllUsers);
router.get('/findByEmail', getUserByEmail);
router.get('/findByUsername', getUserByUsername);
router.get('/exists', checkUserExists);
router.post('/verifyPassword', checkPassword);
router.post('/register', register);
router.post('/uploadImage', upload.single('image'), uploadImage);
router.put('/changePassword', changePassword);
router.put('/changeUsername', changeUsername);
router.delete('/deleteAccount', deleteAccount);

export default router;
