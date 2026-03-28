import { Router } from 'express';
import { getByOwner, getById, create, update, remove } from '../controllers/quest_controller.js';

const router = Router();
router.get('/findByOwner', getByOwner);
router.get('/findById', getById);
router.post('/create', create);
router.put('/updateProgress', update);
router.delete('/delete', remove);

export default router;
