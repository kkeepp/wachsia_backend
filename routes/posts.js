import { Router } from 'express';
import { getById, getByCommunity, getByUser, create, favorite, remove } from '../controllers/post_controller.js';

const router = Router();
router.get('/findById', getById);
router.get('/findByCommunity', getByCommunity);
router.get('/findByUser', getByUser);
router.post('/create', create);
router.post('/favorite', favorite);
router.delete('/delete', remove);

export default router;
