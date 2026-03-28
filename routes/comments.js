import { Router } from 'express';
import { getByPost, create, remove } from '../controllers/comment_controller.js';

const router = Router();
router.get('/findByPost', getByPost);
router.post('/create', create);
router.delete('/delete', remove);

export default router;
